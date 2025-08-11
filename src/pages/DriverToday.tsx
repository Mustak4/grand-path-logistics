import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Truck, 
  DollarSign,
  Clock,
  AlertCircle
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

const toMaps = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}`;

const DriverToday = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<StopVM[]>([]);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => stops.reduce((acc, s) => acc + (s.suma || 0), 0), [stops]);
  const completedStops = useMemo(() => stops.filter(s => s.status === "zavrseno").length, [stops]);
  const progress = stops.length > 0 ? (completedStops / stops.length) * 100 : 0;

  useEffect(() => {
    const loadTodayRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For testing, create some mock data
        const mockStops: StopVM[] = [
          {
            id: "1",
            redosled: 1,
            status: "na_cekane",
            suma: 2500,
            klient: "Маркет Нова",
            adresa: "Бул. Илинден 12",
            naseleno_mesto: "Скопје",
            napomena: "Достава до 14:00"
          },
          {
            id: "2",
            redosled: 2,
            status: "zavrseno",
            suma: 1800,
            klient: "Ресторан Стар",
            adresa: "Ул. Македонија 45",
            naseleno_mesto: "Скопје",
            napomena: "Внимателно со пакетот"
          },
          {
            id: "3",
            redosled: 3,
            status: "na_cekane",
            suma: 3200,
            klient: "Кафе Бар Централ",
            adresa: "Плоштад Македонија 8",
            naseleno_mesto: "Скопје",
            napomena: "Термички пакет"
          }
        ];
        
        setStops(mockStops);
        setRouteId("test-route");
        
        // Comment out the real Supabase call for now
        // if (!user) return;
        // const today = new Date().toISOString().slice(0, 10);
        // ... rest of the original code
        
      } catch (e: any) {
        console.error("Error loading route:", e);
        setError(e.message || "Грешка при вчитување на турата");
        toast.error("Грешка при вчитување на турата");
      } finally {
        setLoading(false);
      }
    };
    
    loadTodayRoute();
  }, [user]);

  const markDone = async (id: string) => {
    try {
      // For testing, just update local state
      setStops((prev) => prev.map((s) => 
        s.id === id ? { ...s, status: "zavrseno" } : s
      ));
      
      toast.success("Доставата е означена како завршена");
    } catch (error: any) {
      console.error("Error marking stop as done:", error);
      toast.error("Неуспешно означување");
    }
  };

  const markSkipped = async (id: string) => {
    try {
      // For testing, just update local state
      setStops((prev) => prev.map((s) => 
        s.id === id ? { ...s, status: "preskoknato" } : s
      ));
      
      toast.success("Доставата е означена како прескокната");
    } catch (error: any) {
      console.error("Error marking stop as skipped:", error);
      toast.error("Неуспешно означување");
    }
  };

  if (error) {
    return (
      <div className="mobile-container mobile-content md:desktop-content">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Грешка</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Возач — Денешна тура"
        description="Листа на клиенти по редослед со навигација и наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac"
      />
      
      <PageHeader 
        title="Денешна тура" 
        subtitle={`${stops.length} дестинации • ${completedStops} завршени`}
        showBackButton={false}
      >
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Truck className="w-6 h-6 text-primary" />
        </div>
      </PageHeader>

      <main className="mobile-container mobile-content md:desktop-content">
        
        {/* Progress Bar */}
        {stops.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Напредок</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Се вчитува...</p>
          </div>
        </div>
      ) : stops.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Немате доделена тура</h3>
          <p className="text-muted-foreground">Проверете подоцна за нови задачи.</p>
        </div>
      ) : (
        <>
          {/* Stops List */}
          <div className="space-y-4 mb-6">
            {stops.map((stop, index) => (
              <div 
                key={stop.id} 
                className={`mobile-card-interactive ${
                  stop.status === "zavrseno" 
                    ? "bg-green-50 border-green-200" 
                    : stop.status === "preskoknato"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stop.status === "zavrseno" 
                        ? "bg-green-100 text-green-600" 
                        : stop.status === "preskoknato"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {stop.status === "zavrseno" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : stop.status === "preskoknato" ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {stop.klient}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {stop.adresa}, {stop.naseleno_mesto}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>{Number(stop.suma || 0).toLocaleString()} ден.</span>
                        </div>
                        {stop.napomena && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {stop.napomena}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          asChild 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-3"
                        >
                          <a 
                            href={toMaps(`${stop.adresa}, ${stop.naseleno_mesto}`)} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Навигација
                          </a>
                        </Button>
                        
                        {stop.status === "na_cekane" && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => markDone(stop.id)}
                              className="h-8 px-3"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Готово
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markSkipped(stop.id)}
                              className="h-8 px-3"
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Прескокни
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Card */}
          <div className="mobile-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Вкупно треба да имате до вас</p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(total).toLocaleString()} денари
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
    </>
  );
};

export default DriverToday;
