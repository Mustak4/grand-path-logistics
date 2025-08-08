import { SEO } from "@/components/SEO";

const Orders = () => {
  return (
    <main className="container py-8">
      <SEO
        title="Нарачки — Гранд Партнер АС"
        description="Список на нарачки со износ, клиент и тип на наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/naracki"
      />
      <h1 className="text-3xl font-semibold mb-4">Нарачки</h1>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Датум</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Тип</th>
              <th className="p-3">Метод</th>
              <th className="p-3">Сума</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">2025-08-08</td>
              <td className="p-3">Маркет Нова</td>
              <td className="p-3">Фискална</td>
              <td className="p-3">Готово</td>
              <td className="p-3">2.450</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Orders;
