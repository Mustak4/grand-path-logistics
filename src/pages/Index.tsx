import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main>
      <SEO
        title="Гранд Партнер АС — Интерна логистика"
        description="Внатрешна апликација за достава и управување со рути за диспечери и возачи."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/"
      />
      <section className="relative min-h-[70vh] grid place-items-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent)/0.15)]" />
        <div className="container mx-auto grid gap-6 text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Интерна логистика за „Гранд Партнер АС“
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Ефикасни рути, јасни статуси и точна наплата — се на едно место за
            вашите диспечери и возачи.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <Button asChild variant="hero" size="lg">
              <Link to="/dispecer">Отвори диспечерски панел</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/vozac">Отвори апликација за возач</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Напомена: Автентикација и база преку Supabase (ќе се додаде подоцна)
          </p>
        </div>
      </section>
    </main>
  );
};

export default Index;
