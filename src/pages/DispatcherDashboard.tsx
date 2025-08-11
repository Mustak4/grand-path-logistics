import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Map, 
  Truck, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

interface DashboardStats {
  todayOrders: number;
  activeRoutes: number;
  activeDrivers: number;
  totalRevenue: number;
}

const DispatcherDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 24,
    activeRoutes: 8,
    activeDrivers: 12,
    totalRevenue: 245600
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Today's date (date-only, compare by date part of timestamptz)
        const todayIso = new Date().toISOString().slice(0, 10);

        // Orders today
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("id, suma, datum")
          .gte("datum", `${todayIso} 00:00`)
          .lte("datum", `${todayIso} 23:59:59`);
        if (ordersError) throw ordersError;

        // Active routes
        const { data: routesData, error: routesError } = await supabase
          .from("routes")
          .select("id")
          .eq("status", "aktivna");
        if (routesError) throw routesError;

        // All drivers (vozac)
        const { data: driversData, error: driversError } = await supabase
          .from("profiles")
          .select("id")
          .eq("uloga", "vozac");
        if (driversError) throw driversError;

        const totalRevenue = (ordersData || []).reduce((sum: number, o: any) => sum + Number(o.suma || 0), 0);

        setStats({
          todayOrders: ordersData?.length || 0,
          activeRoutes: routesData?.length || 0,
          activeDrivers: driversData?.length || 0,
          totalRevenue
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        toast.error("Грешка при вчитување на статистики");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Realtime: refresh stats on any change to orders/routes/stops
    const chOrders: RealtimeChannel = supabase
      .channel('rt-dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadStats())
      .subscribe();

    const chRoutes: RealtimeChannel = supabase
      .channel('rt-dashboard-routes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, () => loadStats())
      .subscribe();

    const chStops: RealtimeChannel = supabase
      .channel('rt-dashboard-stops')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stops' }, () => loadStats())
      .subscribe();

    return () => {
      supabase.removeChannel(chOrders);
      supabase.removeChannel(chRoutes);
      supabase.removeChannel(chStops);
    };
  }, []);

  return (
    <>
      <SEO
        title="Диспечерски панел — Гранд Партнер АС"
        description="Управувајте со клиенти, производи, нарачки, рути и стопови."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/dispecer"
      />
      
      <PageHeader 
        title="Диспечерски панел" 
        subtitle="Преглед на денешни активности и управување со логистика"
        showBackButton={false}
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Денес
          </Button>
          <Button size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Извештај
          </Button>
        </div>
      </PageHeader>

      <main className="mobile-container mobile-content md:desktop-container md:desktop-content py-4 md:py-8">

      {/* Stats Grid */}
      <section className="mobile-grid-2 md:grid md:gap-6 mb-6 md:mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="mobile-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Денешни нарачки</p>
              <p className="text-3xl font-bold text-blue-700">
                {loading ? "..." : stats.todayOrders}
              </p>
              <p className="text-xs text-blue-600 mt-1">за денес</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="mobile-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Активни рути</p>
              <p className="text-3xl font-bold text-green-700">
                {loading ? "..." : stats.activeRoutes}
              </p>
              <p className="text-xs text-green-600 mt-1">во тек</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Map className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="mobile-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Возачи на тура</p>
              <p className="text-3xl font-bold text-purple-700">
                {loading ? "..." : stats.activeDrivers}
              </p>
              <p className="text-xs text-purple-600 mt-1">активни</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="mobile-card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Вкупно наплата</p>
              <p className="text-3xl font-bold text-orange-700">
                {loading ? "..." : stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-orange-600 mt-1">ден.</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Брзи акции</h2>
        <div className="mobile-grid-1 md:grid md:gap-4 md:grid-cols-3">
          <Button asChild className="mobile-button-primary h-16 md:h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
            <Link to="/klienti">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base">Клиенти</span>
            </Link>
          </Button>
          
          <Button asChild className="mobile-button-primary h-16 md:h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
            <Link to="/naracki">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base">Нарачки</span>
            </Link>
          </Button>
          
          <Button asChild className="mobile-button-primary h-16 md:h-20 flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
            <Link to="/ruti">
              <Map className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base">Рути</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick Route Creation */}
      <section className="mobile-card mb-6">
        <h3 className="text-lg font-semibold mb-4">Брзо креирање на рута</h3>
        <div className="mobile-spacing">
          <div className="mobile-form-group">
            <label className="mobile-form-label">Изберете возач</label>
            <select className="mobile-input" id="driver-select">
              <option value="">— Изберете возач —</option>
              {/* Will be populated with real drivers */}
            </select>
          </div>
          
          <div className="mobile-form-group">
            <label className="mobile-form-label">Изберете нарачки за денес</label>
            <div className="border rounded-lg p-3 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">
                💡 Изберете нарачки од листата на нарачки и креирајте рута
              </p>
              <Button asChild className="mobile-button-primary w-full">
                <Link to="/naracki">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Изберете нарачки
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mobile-action-row">
            <Button className="mobile-button-primary w-full">
              <Map className="w-4 h-4 mr-2" />
              Креирај рута
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="mobile-card">
          <h3 className="text-lg font-semibold mb-4">Неодамнешни активности</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Достава завршена</p>
                <p className="text-xs text-muted-foreground">Марко Петровски - Клиент АБЦ</p>
              </div>
              <span className="text-xs text-muted-foreground">2 мин</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Нова рута создадена</p>
                <p className="text-xs text-muted-foreground">Рута #2024-001 за денес</p>
              </div>
              <span className="text-xs text-muted-foreground">15 мин</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Закаснување</p>
                <p className="text-xs text-muted-foreground">Возач Петар - 30 мин закаснување</p>
              </div>
              <span className="text-xs text-muted-foreground">1 час</span>
            </div>
          </div>
        </div>
        
        <div className="mobile-card">
          <h3 className="text-lg font-semibold mb-4">Статистика за денес</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Завршени достави</span>
              <span className="font-semibold">
                {loading ? "..." : `${Math.round((stats.activeRoutes / Math.max(stats.todayOrders, 1)) * 100)}%`}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: loading ? '0%' : `${Math.round((stats.activeRoutes / Math.max(stats.todayOrders, 1)) * 100)}%` 
                }} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Просечно време</span>
              <span className="font-semibold">45 мин</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Успешност</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
};

export default DispatcherDashboard;
