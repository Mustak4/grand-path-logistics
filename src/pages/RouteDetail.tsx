import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus
} from "lucide-react";

interface StopVM {
  id: string;
  redosled: number;
  status: "na_cekane" | "zavrseno" | "preskoknato";
  suma: number;
  klient: string;
  adresa: string;
  naseleno_mesto: string;
  napomena?: string;
}

interface RouteVM {
  id: string;
  datum: string;
  vozac_id: string | null;
  status: string;
  vozac_ime?: string;
}

const RouteDetail = () => {
  const { id } = useParams();
  const [route, setRoute] = useState<RouteVM | null>(null);
  const [stops, setStops] = useState<StopVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRouteDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load route with driver info
        const { data: routeData, error: routeError } = await supabase
          .from("routes")
          .select(`
            id, 
            datum, 
            vozac_id, 
            status,
            profiles!inner(ime)
          `)
          .eq("id", id)
          .single();
          
        if (routeError) throw routeError;
        
        const routeVM: RouteVM = {
          id: routeData.id,
          datum: routeData.datum,
          vozac_id: routeData.vozac_id,
          status: routeData.status,
          vozac_ime: routeData.profiles?.ime || "—"
        };
        
        setRoute(routeVM);
        
        // Load stops for this route
        const { data: rawStops, error: stopError } = await supabase
          .from("stops")
          .select("id, redosled, status, suma_za_naplata, naracka_id")
          .eq("ruta_id", id)
          .order("redosled", { ascending: true });
          
        if (stopError) throw stopError;
        
        const orderIds = (rawStops || []).map((s) => s.naracka_id);
        if (orderIds.length === 0) {
          setStops([]);
          setLoading(false);
          return;
        }
        
        // Load orders
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, suma, klient_id, napomena")
          .in("id", orderIds);
          
        if (ordersError) throw ordersError;
        
        const clientIds = Array.from(new Set((orders || []).map((o) => o.klient_id)));
        
        // Load clients with coordinates
        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .select("id, ime, adresa, naseleno_mesto, lat, lng")
          .in("id", clientIds);
          
        if (clientsError) throw clientsError;
        
        const clientMap = new Map(clients?.map((c) => [c.id, c] as const));
        const orderMap = new Map(orders?.map((o) => [o.id, o] as const));
        
        const vm: StopVM[] = (rawStops || []).map((s) => {
          const o = orderMap.get(s.naracka_id);
          const c = o ? clientMap.get(o.klient_id) : undefined;
          return {
            id: s.id,
            redosled: s.redosled,
            status: s.status as any,
            suma: s.suma_za_naplata,
            klient: c?.ime || "—",
            adresa: c?.adresa || "",
            naseleno_mesto: c?.naseleno_mesto || "",
            napomena: o?.napomena || "",
          };
        });
        
        setStops(vm);
      } catch (error: any) {
        console.error("Error loading route details:", error);
        toast.error("Грешка при вчитување на деталите на рутата");
      } finally {
        setLoading(false);
      }
    };
    
    loadRouteDetails();
  }, [id]);

  const moveStop = async (stopId: string, direction: "up" | "down") => {
    const currentIndex = stops.findIndex(s => s.id === stopId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= stops.length) return;
    
    try {
      const newStops = [...stops];
      const temp = newStops[currentIndex];
      newStops[currentIndex] = newStops[newIndex];
      newStops[newIndex] = temp;
      
      // Update order numbers
      newStops.forEach((stop, index) => {
        stop.redosled = index + 1;
      });
      
      setStops(newStops);
      
      // Update in database
      const updates = newStops.map(stop => ({
        id: stop.id,
        redosled: stop.redosled
      }));
      
      const { error } = await supabase
        .from("stops")
        .upsert(updates);
        
      if (error) throw error;
      
      toast.success("Редоследот е променет");
    } catch (error: any) {
      console.error("Error reordering stops:", error);
      toast.error("Грешка при промена на редоследот");
    }
  };

  const deleteStop = async (stopId: string) => {
    try {
      const { error } = await supabase
        .from("stops")
        .delete()
        .eq("id", stopId);
        
      if (error) throw error;
      
      setStops(prev => prev.filter(s => s.id !== stopId));
      toast.success("Стопот е избришан");
    } catch (error: any) {
      console.error("Error deleting stop:", error);
      toast.error("Грешка при бришење на стопот");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "zavrseno":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "preskoknato":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "na_cekane":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "zavrseno":
        return "Завршено";
      case "preskoknato":
        return "Прескокнато";
      case "na_cekane":
        return "На чекање";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "zavrseno":
        return "bg-green-100 text-green-800 border-green-200";
      case "preskoknato":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "na_cekane":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalAmount = stops.reduce((sum, stop) => sum + (stop.suma || 0), 0);

  return (
    <>
      <SEO
        title={`Рута #${id} — Гранд Партнер АС`}
        description="Стопови, статуси и наплата за конкретна рута."
        canonical={`https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/ruti/${id}`}
      />
      
      <PageHeader 
        title={`Рута #${id}`}
        subtitle={route ? `${new Date(route.datum).toLocaleDateString("mk-MK")} • ${route.vozac_ime}` : "Се вчитува..."}
        customBackPath="/ruti"
      >
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(route?.status || "")}`}>
            {getStatusText(route?.status || "")}
          </span>
        </div>
      </PageHeader>

      <main className="desktop-container desktop-content py-8">

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Се вчитува...</p>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="mobile-card mb-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Вкупно стопови</p>
                <p className="text-2xl font-bold">{stops.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Вкупно сума</p>
                <p className="text-2xl font-bold">{Number(totalAmount).toLocaleString()} ден.</p>
              </div>
            </div>
          </div>

          {/* Stops List */}
          <div className="mobile-card">
            <h2 className="text-lg font-semibold mb-4">Стопови</h2>
            
            {stops.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нема стопови</h3>
                <p className="text-muted-foreground">Додадете нарачки во рутата.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stops.map((stop, index) => (
                  <div 
                    key={stop.id} 
                    className={`border rounded-lg p-4 ${
                      stop.status === "zavrseno" 
                        ? "bg-green-50 border-green-200" 
                        : stop.status === "preskoknato"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveStop(stop.id, "up")}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveStop(stop.id, "down")}
                            disabled={index === stops.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{stop.redosled}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-medium">{stop.klient}</h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {stop.adresa}, {stop.naseleno_mesto}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {Number(stop.suma).toLocaleString()} ден.
                            </span>
                          </div>
                          
                          {stop.napomena && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {stop.napomena}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(stop.status)}`}>
                          {getStatusIcon(stop.status)}
                          <span className="ml-1">{getStatusText(stop.status)}</span>
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteStop(stop.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </main>
    </>
  );
};

export default RouteDetail;
