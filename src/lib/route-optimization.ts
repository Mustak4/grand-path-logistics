/**
 * Route optimization utilities for Grand Partner AS logistics
 * Always starts from warehouse location and optimizes delivery routes
 */

// Warehouse coordinates (Grand Partner AS)
export const WAREHOUSE_COORDINATES = {
  lat: 41.4419365,
  lng: 22.6477195,
  address: "Grand Partner AS, Radovish, North Macedonia"
};

export const WAREHOUSE_GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Grand+Partner+AS/@41.4419365,22.6477195,632m/data=!3m2!1e3!4b1!4m6!3m5!1s0x14a9fe69e88995d7:0xb4ed1cafe23add9f!8m2!3d41.4419325!4d22.6502998!16s%2Fg%2F11by__wvy6?entry=ttu";

interface Location {
  id: string;
  lat: number;
  lng: number;
  adresa: string;
  naseleno_mesto: string;
}

interface Order {
  id: string;
  klient_id: string;
  suma: number;
  datum: string;
  tip_napalata: "fiskalna" | "faktura";
  napomena?: string;
  client: {
    lat?: number;
    lng?: number;
    adresa: string;
    naseleno_mesto: string;
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Optimize route using Nearest Neighbor algorithm
 * Always starts from warehouse and finds shortest path
 */
export function optimizeRoute(orders: Order[]): Order[] {
  if (orders.length === 0) return [];
  
  // Filter orders with GPS coordinates
  const ordersWithGPS = orders.filter(order => 
    order.client.lat && order.client.lng
  );
  
  if (ordersWithGPS.length === 0) {
    // If no GPS coordinates, return original order
    return orders;
  }
  
  const optimized: Order[] = [];
  const unvisited = [...ordersWithGPS];
  
  // Start from warehouse
  let currentLat = WAREHOUSE_COORDINATES.lat;
  let currentLng = WAREHOUSE_COORDINATES.lng;
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentLat, 
      currentLng, 
      unvisited[0].client.lat!, 
      unvisited[0].client.lng!
    );
    
    // Find nearest unvisited location
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        unvisited[i].client.lat!,
        unvisited[i].client.lng!
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add nearest location to route
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    
    // Update current position
    currentLat = nearest.client.lat!;
    currentLng = nearest.client.lng!;
  }
  
  // Add orders without GPS coordinates at the end
  const ordersWithoutGPS = orders.filter(order => 
    !order.client.lat || !order.client.lng
  );
  
  return [...optimized, ...ordersWithoutGPS];
}

/**
 * Create Google Maps route URL starting from warehouse
 */
export function createRouteFromWarehouse(orders: Order[]): string {
  if (orders.length === 0) return WAREHOUSE_GOOGLE_MAPS_URL;
  
  const optimizedOrders = optimizeRoute(orders);
  const waypoints = optimizedOrders
    .filter(order => order.client.lat && order.client.lng)
    .map(order => `${order.client.lat},${order.client.lng}`)
    .join('|');
  
  if (waypoints) {
    return `https://www.google.com/maps/dir/${WAREHOUSE_COORDINATES.lat},${WAREHOUSE_COORDINATES.lng}/${waypoints}`;
  }
  
  return WAREHOUSE_GOOGLE_MAPS_URL;
}

/**
 * Calculate total route distance and estimated time
 */
export function calculateRouteStats(orders: Order[]): {
  totalDistance: number;
  estimatedTime: number;
  totalRevenue: number;
} {
  const optimizedOrders = optimizeRoute(orders);
  let totalDistance = 0;
  let currentLat = WAREHOUSE_COORDINATES.lat;
  let currentLng = WAREHOUSE_COORDINATES.lng;
  
  // Calculate distance between stops
  for (const order of optimizedOrders) {
    if (order.client.lat && order.client.lng) {
      totalDistance += calculateDistance(
        currentLat,
        currentLng,
        order.client.lat,
        order.client.lng
      );
      currentLat = order.client.lat;
      currentLng = order.client.lng;
    }
  }
  
  // Return to warehouse
  totalDistance += calculateDistance(
    currentLat,
    currentLng,
    WAREHOUSE_COORDINATES.lat,
    WAREHOUSE_COORDINATES.lng
  );
  
  // Estimate time: 30 min per stop + travel time (assuming 40 km/h average)
  const estimatedTime = (optimizedOrders.length * 30) + (totalDistance * 1.5); // 1.5 min per km
  
  const totalRevenue = optimizedOrders.reduce((sum, order) => sum + order.suma, 0);
  
  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round(estimatedTime),
    totalRevenue
  };
}

/**
 * Group orders by region for better organization
 */
export function groupOrdersByRegion(orders: Order[]): Record<string, Order[]> {
  const regions: Record<string, Order[]> = {};
  
  orders.forEach(order => {
    const region = getRegionFromLocation(order.client.naseleno_mesto);
    if (!regions[region]) {
      regions[region] = [];
    }
    regions[region].push(order);
  });
  
  return regions;
}

/**
 * Get region name from settlement
 */
function getRegionFromLocation(naseleno_mesto: string): string {
  const lowerMesto = naseleno_mesto.toLowerCase();
  
  // Штипскиот Регион
  if (['радовиш', 'штип', 'кочани', 'виница', 'пробиштип', 'кавадарци', 'неготино'].includes(lowerMesto)) {
    return 'Штипскиот Регион';
  }
  
  // Скопскиот Регион
  if (['скопје', 'куманово', 'кратово', 'качаник', 'велес', 'демир капија'].includes(lowerMesto)) {
    return 'Скопскиот Регион';
  }
  
  // Битолскиот Регион
  if (['битола', 'прилеп', 'крушево', 'демир хисар', 'ресен'].includes(lowerMesto)) {
    return 'Битолскиот Регион';
  }
  
  // Охридскиот Регион
  if (['охрид', 'струга', 'дебар', 'кичево', 'маврово'].includes(lowerMesto)) {
    return 'Охридскиот Регион';
  }
  
  // Тетовскиот Регион
  if (['тетово', 'гостивар', 'кичево', 'маврово'].includes(lowerMesto)) {
    return 'Тетовскиот Регион';
  }
  
  return 'Други региони';
}
