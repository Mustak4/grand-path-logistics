import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const RoutesPage = () => {
  return (
    <main className="container py-8">
      <SEO
        title="Рути — Гранд Партнер АС"
        description="Креирање, уредување и следење на рути и стопови."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/ruti"
      />
      <h1 className="text-3xl font-semibold mb-4">Рути</h1>
      <ul className="grid gap-3">
        <li className="rounded-lg border p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">2025-08-08</p>
            <p className="font-medium">Возач: Стојан Петров</p>
            <p className="text-sm">Статус: активна</p>
          </div>
          <Link to="/ruti/1" className="text-primary underline-offset-4 hover:underline">
            Детали
          </Link>
        </li>
      </ul>
    </main>
  );
};

export default RoutesPage;
