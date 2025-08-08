import { SEO } from "@/components/SEO";
import { useParams, Link } from "react-router-dom";

const RouteDetail = () => {
  const { id } = useParams();
  return (
    <main className="container py-8">
      <SEO
        title={`Рута #${id} — Гранд Партнер АС`}
        description="Стопови, статуси и наплата за конкретна рута."
        canonical={`https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/ruti/${id}`}
      />
      <h1 className="text-3xl font-semibold mb-4">Рута #{id}</h1>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Адреса</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Сума</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">1</td>
              <td className="p-3">Маркет Нова</td>
              <td className="p-3">Бул. Илинден 12</td>
              <td className="p-3">на чекање</td>
              <td className="p-3">2.450</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Link to="/ruti" className="text-primary underline-offset-4 hover:underline">
          Назад кон рути
        </Link>
      </div>
    </main>
  );
};

export default RouteDetail;
