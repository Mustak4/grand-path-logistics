import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Map as MapIcon, 
  Truck, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface RouteRow { 
  id: string; 
  datum: string; 
  vozac_id: string | null; 
  status: string;
  stops_count?: number;
  total_amount?: number;
}

interface Profile { 
  id: string; 
  ime: string | null 
}

interface OrderRow { 
  id: string; 
  datum: string; 
  suma: number;
  klient_ime?: string;
}

const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ 
    date: new Date().toISOString().slice(0, 10), 
    driver: "", 
    status: "draft" 
  });
  
  const [assign, setAssign] = useState<{ 
    routeId: string; 
    orderIds: string[] 
  }>({ routeId: "", orderIds: [] });

  const driverMap = useMemo(() => 
    new Map(drivers.map((d) => [d.id, d.ime || "Возач"])), 
    [drivers]
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aktivna":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "zavrsena":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "draft":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "aktivna":
        return "Активна";
      case "zavrsena":
        return "Завршена";
      case "draft":
        return "Нацрт";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aktivna":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "zavrsena":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        console.log("Loading routes data...");
        
        // Load routes first - simplest query
        const { data: routesData, error: routesError } = await supabase
          .from("routes")
          .select("*")
          .order("datum", { ascending: false });
          
        console.log("Routes data:", routesData, "Error:", routesError);
        if (routesError) throw routesError;
        
        // Load drivers (profiles with vozac role)
        const { data: driversData, error: driversError } = await supabase
          .from("profiles")
          .select("id, ime")
          .eq("uloga", "vozac");
          
        console.log("Drivers data:", driversData, "Error:", driversError);
        if (driversError) throw driversError;
        
        // Load orders for order assignment
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`id, datum, suma, klient_id, clients!inner(ime)`) // join client name
          .order("datum", { ascending: false })
          .limit(50);
          
        console.log("Orders data:", ordersData, "Error:", ordersError);
        if (ordersError) throw ordersError;
        
        // Load client names separately for orders
        const clientIds = [...new Set(ordersData.map(o => o.klient_id))];
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("id, ime")
          .in("id", clientIds);
          
        console.log("Clients data:", clientsData, "Error:", clientsError);
        if (clientsError) throw clientsError;
        
        const clientMap = new Map(clientsData.map(c => [c.id, c.ime]));
        
        // Load stops count and total amount for each route
        let stopsData: any[] = [];
        if (routesData && routesData.length > 0) {
          const routeIds = routesData.map(r => r.id);
          const { data: stopsResult, error: stopsError } = await supabase
            .from("stops")
            .select("ruta_id, suma_za_naplata")
            .in("ruta_id", routeIds);
            
          console.log("Stops data:", stopsResult, "Error:", stopsError);
          if (stopsError) throw stopsError;
          stopsData = stopsResult || [];
        }
        
        // Aggregate stops data by route
        const routeStats = new Map();
        stopsData.forEach(stop => {
          if (!routeStats.has(stop.ruta_id)) {
            routeStats.set(stop.ruta_id, { count: 0, total: 0 });
          }
          const stats = routeStats.get(stop.ruta_id);
          stats.count++;
          stats.total += stop.suma_za_naplata || 0;
        });
        
        // Format routes with stats
        const formattedRoutes: RouteRow[] = (routesData || []).map(route => {
          const stats = routeStats.get(route.id) || { count: 0, total: 0 };
          return {
            id: route.id,
            datum: route.datum,
            vozac_id: route.vozac_id,
            status: route.status,
            stops_count: stats.count,
            total_amount: stats.total
          };
        });
        
        // Format orders with client names
        const formattedOrders: OrderRow[] = (ordersData || []).map(order => ({
          id: order.id,
          datum: order.datum,
          suma: order.suma,
          klient_ime: clientMap.get(order.klient_id) || "—"
        }));
        
        console.log("Final data:", { formattedRoutes, drivers: driversData, formattedOrders });
        
        setRoutes(formattedRoutes);
        setDrivers(driversData || []);
        setOrders(formattedOrders);
        
      } catch (error: any) {
        console.error("Error loading routes:", error);
        toast.error(`Грешка при вчитување: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, []);

  const createRoute = async () => {
    if (!form.driver) {
      toast.error("Изберете возач");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("routes")
        .insert({
        datum: form.date,
        vozac_id: form.driver,
        status: form.status,
          vozilo: null // Can be added later
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to local state
      const newRoute: RouteRow = {
        id: data.id,
        datum: data.datum,
        vozac_id: data.vozac_id,
        status: data.status,
        stops_count: 0,
        total_amount: 0
      };
      
      setRoutes(prev => [newRoute, ...prev]);
      toast.success("Рутата е креирана");
      
      // Reset form
      setForm({
        date: new Date().toISOString().slice(0, 10),
        driver: "",
        status: "draft"
      });
      
    } catch (error: any) {
      console.error("Error creating route:", error);
      toast.error(error.message || "Грешка при креирање на рутата");
    }
  };

  const addOrdersToRoute = async () => {
    if (!assign.routeId || assign.orderIds.length === 0) {
      toast.error("Изберете рута и нарачки");
      return;
    }
    
    try {
      // Get current max order (redosled) for this route
      const { data: existingStops, error: stopsError } = await supabase
        .from("stops")
        .select("redosled")
        .eq("ruta_id", assign.routeId)
        .order("redosled", { ascending: false })
        .limit(1);
        
      if (stopsError) throw stopsError;
      
      let nextOrder = (existingStops?.[0]?.redosled || 0) + 1;
      
      // Create stops for each selected order
      const stopsToCreate = assign.orderIds.map((orderId, index) => {
        const order = orders.find(o => o.id === orderId);
        return {
          ruta_id: assign.routeId,
          naracka_id: orderId,
          redosled: nextOrder + index,
          status: "na_cekane",
          suma_za_naplata: order?.suma || 0
        };
      });
      
      const { error: insertError } = await supabase
        .from("stops")
        .insert(stopsToCreate);
        
      if (insertError) throw insertError;
      
      // Update local state
      setRoutes(prev => prev.map(route => {
        if (route.id === assign.routeId) {
          return {
            ...route,
            stops_count: (route.stops_count || 0) + assign.orderIds.length,
            total_amount: (route.total_amount || 0) + assign.orderIds.reduce((sum, orderId) => {
              const order = orders.find(o => o.id === orderId);
              return sum + (order?.suma || 0);
            }, 0)
          };
        }
        return route;
      }));
      
      toast.success("Нарачките се додадени во рутата");
      
      // Reset form
      setAssign({ routeId: "", orderIds: [] });
    } catch (error: any) {
      console.error("Error adding orders to route:", error);
      toast.error(error.message || "Грешка при додавање на нарачки");
    }
  };

  const updateRouteStatus = async (routeId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("routes")
        .update({ status: newStatus })
        .eq("id", routeId);
        
      if (error) throw error;
      
      setRoutes(prev => prev.map(route => 
        route.id === routeId ? { ...route, status: newStatus } : route
      ));
      
      toast.success("Статусот е променет");
    } catch (error: any) {
      console.error("Error updating route status:", error);
      toast.error("Грешка при промена на статусот");
    }
  };

  return (
    <>
      <SEO
        title="Рути — Гранд Партнер АС"
        description="Креирање, уредување и следење на рути и стопови."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/ruti"
      />
      
      <PageHeader 
        title="Рути" 
        subtitle="Креирање и управување со рути и стопови"
      >
        <Button asChild>
          <Link to="/ruti/new">
            <Plus className="w-4 h-4 mr-2" />
            Нова рута
          </Link>
        </Button>
      </PageHeader>

      <main className="mobile-container mobile-content md:desktop-container md:desktop-content py-4 md:py-8">

      {/* Create Route Form */}
      <section className="mobile-card mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Креирај нова рута</h2>
        <div className="mobile-spacing md:grid md:gap-4 md:grid-cols-4">
          <div className="mobile-form-group">
            <label className="mobile-form-label">Датум</label>
            <input
              type="date"
              className="mobile-input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          
          <div className="mobile-form-group">
            <label className="mobile-form-label">Возач</label>
            <select
              className="mobile-input"
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
            >
              <option value="">— Изберете возач —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ime}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mobile-form-group">
            <label className="mobile-form-label">Статус</label>
            <select
              className="mobile-input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Нацрт</option>
              <option value="aktivna">Активна</option>
              <option value="zavrsena">Завршена</option>
            </select>
          </div>
          
          <div className="mobile-form-group md:flex md:items-end">
            <Button onClick={createRoute} className="mobile-button-primary w-full">
              <Plus className="w-4 h-4 mr-2" />
              Креирај рута
            </Button>
          </div>
        </div>
      </section>

      {/* Add Orders to Route */}
      <section className="mobile-card mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Додади нарачки во рута</h2>
        <div className="mobile-spacing md:grid md:gap-4 md:grid-cols-3">
          <div className="mobile-form-group">
            <label className="mobile-form-label">Изберете рута</label>
            <select
              className="mobile-input"
              value={assign.routeId}
              onChange={(e) => setAssign({ ...assign, routeId: e.target.value })}
            >
              <option value="">— Изберете рута —</option>
              {routes.filter(r => r.status !== "zavrsena").map((r) => (
                <option key={r.id} value={r.id}>
                  {new Date(r.datum).toLocaleDateString("mk-MK")} — {driverMap.get(r.vozac_id || "") || "—"} ({getStatusText(r.status)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mobile-form-group md:col-span-2">
            <label className="mobile-form-label">Изберете нарачки (држете Ctrl за повеќе)</label>
            <select
              multiple
              className="mobile-input min-h-32 md:min-h-40"
              value={assign.orderIds}
              onChange={(e) =>
                setAssign({
                  ...assign,
                  orderIds: Array.from(e.target.selectedOptions).map((o) => o.value),
                })
              }
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id} className="py-1">
                  📅 {new Date(o.datum).toLocaleDateString("mk-MK")} — 👤 {o.klient_ime} — 💰 {Number(o.suma).toLocaleString()} ден.
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Изберете {assign.orderIds.length} нарачки
            </p>
          </div>
          
          <div className="mobile-form-group md:col-span-3">
            <Button 
              onClick={addOrdersToRoute} 
              className="mobile-button-primary w-full"
              disabled={!assign.routeId || assign.orderIds.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Додади {assign.orderIds.length} нарачки во рута
            </Button>
          </div>
        </div>
      </section>

      {/* Routes List */}
      <section className="mobile-card">
        <h2 className="text-lg font-semibold mb-4">Листа на рути</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Се вчитува...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-8">
            <MapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нема рути</h3>
            <p className="text-muted-foreground">Креирајте прва рута за да започнете.</p>
          </div>
        ) : (
          <div className="mobile-spacing">
            {routes.map((route) => (
              <div key={route.id} className="mobile-card-interactive">
                <div className="flex flex-col gap-3">
                  {/* Header with date and driver */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-lg">
                        {new Date(route.datum).toLocaleDateString("mk-MK")}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(route.status)} flex items-center gap-1`}>
                      {getStatusIcon(route.status)}
                      <span>{getStatusText(route.status)}</span>
                      </span>
                    </div>
                    
                  {/* Driver and stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {driverMap.get(route.vozac_id || "") || "Нема возач"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>🛑 {route.stops_count || 0} стопови</span>
                      <span>💰 {Number(route.total_amount || 0).toLocaleString()} ден.</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                      {route.status === "draft" && (
                        <Button 
                          size="sm" 
                          onClick={() => updateRouteStatus(route.id, "aktivna")}
                        className="flex-1"
                        >
                        ▶️ Активирај
                        </Button>
                      )}
                      
                      {route.status === "aktivna" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateRouteStatus(route.id, "zavrsena")}
                        className="flex-1"
                        >
                        ✅ Заврши
                        </Button>
                      )}
                      
                    <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/ruti/${route.id}`}>
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Детали
                        </Link>
                      </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </main>
    </>
  );
};

export default RoutesPage;
