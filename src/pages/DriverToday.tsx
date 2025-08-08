import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockStops = [
  {
    id: "1",
    klient: "Маркет Нова",
    adresa: "Бул. Илинден 12, Скопје",
    suma: 2450,
    maps: "Бул. Илинден 12, Скопје",
  },
  {
    id: "2",
    klient: "Пекара Слатко",
    adresa: "Ул. Партизанска 4, Карпош",
    suma: 1630,
    maps: "Партизанска 4, Скопје",
  },
];

const toMaps = (q: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(q)}`;

const DriverToday = () => {
  return (
    <main className="container py-6 max-w-xl">
      <SEO
        title="Возач — Денешна тура"
        description="Листа на клиенти по редослед со навигација и наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac"
      />
      <h1 className="text-2xl font-semibold mb-4">Денешна тура</h1>
      <ol className="grid gap-3">
        {mockStops.map((s, i) => (
          <li key={s.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">#{i + 1}</p>
                <h2 className="text-lg font-medium">{s.klient}</h2>
                <p className="text-sm text-muted-foreground">{s.adresa}</p>
                <p className="text-sm mt-1">За наплата: {s.suma.toLocaleString()} ден.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" variant="secondary">
                  <a href={toMaps(s.maps)} target="_blank" rel="noreferrer">
                    Навигација
                  </a>
                </Button>
                <Button
                  size="sm"
                  onClick={() => toast.success("Доставата е означена како завршена")}
                >
                  Готово
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-lg border p-4 bg-secondary/30">
        <p className="text-sm text-muted-foreground">Вкупно треба да имате до вас</p>
        <p className="text-2xl font-bold">5.080 денари</p>
      </div>
    </main>
  );
};

export default DriverToday;
