import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { MapPin, Navigation } from "lucide-react";

const DriverMap = () => {
  return (
    <>
      <SEO
        title="Мапа — Гранд Партнер АС"
        description="Мапа со рути и навигација за возачи."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac/map"
      />
      
      <PageHeader 
        title="Мапа" 
        subtitle="Навигација и рути"
        customBackPath="/vozac"
      />

      <main className="mobile-container mobile-content">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Мапа во развој
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Интерактивната мапа со навигација и следење на рути ќе биде достапна наскоро.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4" />
            <span>GPS навигација</span>
          </div>
        </div>
      </main>
    </>
  );
};

export default DriverMap;
