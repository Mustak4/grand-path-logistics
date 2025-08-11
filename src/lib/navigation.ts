/**
 * Navigation utility functions for North Macedonia logistics
 * Prioritizes GPS coordinates for accurate navigation
 */

interface Location {
  lat?: number;
  lng?: number;
  adresa: string;
  naseleno_mesto: string;
}

/**
 * Creates a Google Maps navigation URL
 * Prioritizes GPS coordinates for accurate navigation in North Macedonia
 */
export function createNavigationUrl(location: Location): string {
  if (location.lat && location.lng) {
    // Use coordinates for precise navigation - best for North Macedonia
    return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
  } else {
    // Fallback to address search with country specification
    const query = `${location.adresa}, ${location.naseleno_mesto}, North Macedonia`;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
  }
}

/**
 * Creates a simple Google Maps search URL (for viewing location)
 */
export function createMapsSearchUrl(location: Location): string {
  if (location.lat && location.lng) {
    return `https://www.google.com/maps/@${location.lat},${location.lng},16z`;
  } else {
    const query = `${location.adresa}, ${location.naseleno_mesto}, North Macedonia`;
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  }
}

/**
 * Validates GPS coordinates for North Macedonia
 * Rough bounds: Lat 40.8-42.4, Lng 20.4-23.0
 */
export function validateCoordinatesForNorthMacedonia(lat: number, lng: number): boolean {
  return lat >= 40.8 && lat <= 42.4 && lng >= 20.4 && lng <= 23.0;
}

/**
 * Formats coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
