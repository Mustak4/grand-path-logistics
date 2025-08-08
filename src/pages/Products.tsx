import { SEO } from "@/components/SEO";

const Products = () => {
  return (
    <main className="container py-8">
      <SEO
        title="Производи — Гранд Партнер АС"
        description="Каталог на производи со единица мерка, цена и тежина."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/produkti"
      />
      <h1 className="text-3xl font-semibold mb-4">Производи</h1>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Име</th>
              <th className="p-3">Ед. мерка</th>
              <th className="p-3">Цена/ед.</th>
              <th className="p-3">Тежина (кг)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Производ А</td>
              <td className="p-3">пакет</td>
              <td className="p-3">120</td>
              <td className="p-3">0.75</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Products;
