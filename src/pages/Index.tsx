import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Truck, Users, Map, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen">
      <SEO
        title="Гранд Партнер АС — Интерна логистика"
        description="Внатрешна апликација за достава и управување со рути за диспечери и возачи."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="mobile-container text-center relative z-10">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Гранд Партнер АС
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Логистика
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ефикасни рути, јасни статуси и точна наплата — се на едно место за
              вашите диспечери и возачи.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/najava" className="flex items-center gap-2">
                Започнете
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/dispecer">Диспечерски панел</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Функционалности</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Современа платформа за управување со логистика со фокус на ефикасност и прецизност
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="mobile-card text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Управување со рути</h3>
              <p className="text-muted-foreground">
                Создавајте и управувајте со оптимални рути за вашите возачи
              </p>
            </div>
            
            <div className="mobile-card text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Следење во реално време</h3>
              <p className="text-muted-foreground">
                Следете ги вашите возачи и статусот на доставите во реално време
              </p>
            </div>
            
            <div className="mobile-card text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Управување со клиенти</h3>
              <p className="text-muted-foreground">
                Организирајте ги вашите клиенти и нивните нарачки ефикасно
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="mobile-container text-center">
          <h2 className="text-3xl font-bold mb-4">Готови сте да започнете?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Приклучете се на нашата платформа и започнете да управувате со вашата логистика на професионален начин.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/najava">Најавете се сега</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dispecer">Преглед на панелот</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
