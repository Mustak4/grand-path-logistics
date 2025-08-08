import { SEO } from "@/components/SEO";

const Clients = () => {
  return (
    <main className="container py-8">
      <SEO
        title="Клиенти — Гранд Партнер АС"
        description="Список на клиенти со адреси, контакт и тип на наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/klienti"
      />
      <h1 className="text-3xl font-semibold mb-4">Клиенти</h1>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Име</th>
              <th className="p-3">Населено место</th>
              <th className="p-3">Адреса</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Тип на наплата</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Маркет Нова</td>
              <td className="p-3">Скопје</td>
              <td className="p-3">Бул. Илинден 12</td>
              <td className="p-3">070 000 000</td>
              <td className="p-3">Фискална</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Clients;
