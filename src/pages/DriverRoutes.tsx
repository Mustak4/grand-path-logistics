import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, MapPin, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RouteVM {
  id: string;
  datum: string;
  status: "draft" | "aktivna" | "zavrsena";
  stops_count: number;
  total_amount: number;
}

const DriverRoutes = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriverRoutes = async () => {
      try {
        setLoading(true);
        // Mock data for testing - only routes assigned to this driver
        const mockRoutes: RouteVM[] = [
          { id: "1", datum: "2025-08-08", status: "aktivna", stops_count: 5, total_amount: 12500 },
          { id: "2", datum: "2025-08-07", status: "zavrsena", stops_count: 4, total_amount: 9200 },
          { id: "3", datum: "2025-08-06", status: "zavrsena", stops_count: 3, total_amount: 7800 }
        ];
        setRoutes(mockRoutes);
        // In real implementation, this would fetch routes where vozac_id = user.id
      } catch (error: any) {
        console.error("Error loading driver routes:", error);
        toast.error("Грешка при вчитување на рутите");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDriverRoutes();
    }
  }, [user]);

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

  return (
    <>
      <SEO
        title="Мои рути — Гранд Партнер АС"
        description="Преглед на доделени рути за возач."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac/ruti"
      />
      
      <PageHeader 
        title="Мои рути" 
        subtitle="Преглед на вашите доделени рути"
        customBackPath="/vozac"
      />

      <main className="mobile-container mobile-content md:desktop-content">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Се вчитува...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нема рути</h3>
            <p className="text-muted-foreground">
              Тренутно немате доделени рути.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="mobile-card-interactive">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(route.datum).toLocaleDateString("mk-MK")}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(route.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(route.status)}
                        {getStatusText(route.status)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{route.stops_count} стопови</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{route.total_amount.toLocaleString()} ден.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default DriverRoutes;
