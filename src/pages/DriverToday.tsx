import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StopVM {
  id: string;
  redosled: number;
  status: "na_cekane" | "zavrseno" | "preskoknato";
  suma: number;
  klient: string;
  adresa: string;
  naseleno_mesto: string;
}

const toMaps = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}`;

const DriverToday = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<StopVM[]>([]);

  const total = useMemo(() => stops.reduce((acc, s) => acc + (s.suma || 0), 0), [stops]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const { data: routes, error: routeErr } = await supabase
          .from("routes")
          .select("id, status")
          .eq("datum", today)
          .eq("vozac_id", user.id)
          .limit(1);
        if (routeErr) throw routeErr;
        const route = routes?.[0];
        if (!route) {
          setStops([]);
          setLoading(false);
          return;
        }
        const { data: rawStops, error: stopErr } = await supabase
          .from("stops")
          .select("id, redosled, status, suma_za_naplata, naracka_id")
          .eq("ruta_id", route.id)
          .order("redosled", { ascending: true });
        if (stopErr) throw stopErr;
        const orderIds = (rawStops || []).map((s) => s.naracka_id);
        if (orderIds.length === 0) {
          setStops([]);
          setLoading(false);
          return;
        }
        const { data: orders, error: ordersErr } = await supabase
          .from("orders")
          .select("id, suma, klient_id")
          .in("id", orderIds);
        if (ordersErr) throw ordersErr;
        const clientIds = Array.from(new Set((orders || []).map((o) => o.klient_id)));
        const { data: clients, error: clientsErr } = await supabase
          .from("clients")
          .select("id, ime, adresa, naseleno_mesto")
          .in("id", clientIds);
        if (clientsErr) throw clientsErr;
        const clientMap = new Map(clients?.map((c) => [c.id, c] as const));
        const orderMap = new Map(orders?.map((o) => [o.id, o] as const));
        const vm: StopVM[] = (rawStops || []).map((s) => {
          const o = orderMap.get(s.naracka_id);
          const c = o ? clientMap.get(o.klient_id) : undefined;
          return {
            id: s.id,
            redosled: s.redosled,
            status: s.status as any,
            suma: s.suma_za_naplata,
            klient: c?.ime || "—",
            adresa: c?.adresa || "",
            naseleno_mesto: c?.naseleno_mesto || "",
          };
        });
        setStops(vm);
      } catch (e: any) {
        toast.error(e.message ?? "Грешка при вчитување на турата");
      } finally {
        setLoading(false);
      }
    };
    load();
    // optional: subscribe to changes
  }, [user]);

  const markDone = async (id: string) => {
    const { error } = await supabase.from("stops").update({ status: "zavrseno" }).eq("id", id);
    if (error) {
      toast.error("Неуспешно означување");
      return;
    }
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, status: "zavrseno" } : s)));
    toast.success("Доставата е означена како завршена");
  };

  return (
    <main className="container py-6 max-w-xl pb-24">
      <SEO
        title="Возач — Денешна тура"
        description="Листа на клиенти по редослед со навигација и наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac"
      />
      <h1 className="text-2xl font-semibold mb-4">Денешна тура</h1>
      {loading ? (
        <p className="text-muted-foreground">Се вчитува...</p>
      ) : stops.length === 0 ? (
        <p className="text-muted-foreground">Немате доделена тура за денес.</p>
      ) : (
        <ol className="grid gap-3">
          {stops.map((s, i) => (
            <li key={s.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">#{i + 1}</p>
                  <h2 className="text-lg font-medium">{s.klient}</h2>
                  <p className="text-sm text-muted-foreground">{s.adresa}, {s.naseleno_mesto}</p>
                  <p className="text-sm mt-1">За наплата: {Number(s.suma || 0).toLocaleString()} ден.</p>
                </div>
                <div className="flex flex-col gap-2 min-w-28">
                  <Button asChild size="sm" variant="secondary">
                    <a href={toMaps(`${s.adresa}, ${s.naseleno_mesto}`)} target="_blank" rel="noreferrer">
                      Навигација
                    </a>
                  </Button>
                  <Button size="sm" disabled={s.status === "zavrseno"} onClick={() => markDone(s.id)}>
                    {s.status === "zavrseno" ? "Завршено" : "Готово"}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-6 rounded-lg border p-4 bg-secondary/30">
        <p className="text-sm text-muted-foreground">Вкупно треба да имате до вас</p>
        <p className="text-2xl font-bold">{Number(total).toLocaleString()} денари</p>
      </div>
    </main>
  );
};

export default DriverToday;
