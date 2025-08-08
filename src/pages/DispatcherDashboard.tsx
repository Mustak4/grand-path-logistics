import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DispatcherDashboard = () => {
  return (
    <main className="container py-8">
      <SEO
        title="Диспечерски панел — Гранд Партнер АС"
        description="Управувајте со клиенти, производи, нарачки, рути и стопови."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/dispecer"
      />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Диспечерски панел</h1>
        <p className="text-muted-foreground">
          Брз преглед на денешни нарачки и рути.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Денешни нарачки</p>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Рути активни</p>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Возачи на тура</p>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Вкупно наплата</p>
          <p className="text-2xl font-bold">— ден.</p>
        </div>
      </section>
      <section className="mt-8 grid gap-3 sm:flex">
        <Button asChild>
          <Link to="/klienti">Клиенти</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/produkti">Производи</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/naracki">Нарачки</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/ruti">Рути</Link>
        </Button>
      </section>
    </main>
  );
};

export default DispatcherDashboard;
