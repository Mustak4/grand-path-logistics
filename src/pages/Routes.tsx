import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RouteRow { id: string; datum: string; vozac_id: string | null; status: string }
interface Profile { id: string; ime: string | null }
interface OrderRow { id: string; datum: string; suma: number }

const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), driver: "", status: "draft" });
  const [assign, setAssign] = useState<{ routeId: string; orderIds: string[] }>({ routeId: "", orderIds: [] });

  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.id, d.ime || "Возач"])), [drivers]);

  useEffect(() => {
    const load = async () => {
      const { data: rts, error } = await supabase
        .from("routes")
        .select("id, datum, vozac_id, status")
        .order("datum", { ascending: false });
      if (!error) setRoutes((rts as any) || []);

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, ime, uloga")
        .eq("uloga", "vozac");
      setDrivers((profs as any) || []);

      const { data: ords } = await supabase
        .from("orders")
        .select("id, datum, suma")
        .order("datum", { ascending: false })
        .limit(200);
      setOrders((ords as any) || []);
    };
    load();
  }, []);

  const createRoute = async () => {
    if (!form.driver) {
      toast.error("Изберете возач");
      return;
    }
    const { error } = await supabase
      .from("routes")
      .insert({ datum: form.date, vozac_id: form.driver, status: form.status });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Рутата е креирана");
    const { data: rts } = await supabase
      .from("routes")
      .select("id, datum, vozac_id, status")
      .order("datum", { ascending: false });
    setRoutes((rts as any) || []);
  };

  const addOrdersToRoute = async () => {
    if (!assign.routeId || assign.orderIds.length === 0) {
      toast.error("Изберете рута и нарачки");
      return;
    }
    const { data: existing } = await supabase
      .from("stops")
      .select("redosled")
      .eq("ruta_id", assign.routeId)
      .order("redosled", { ascending: false })
      .limit(1);
    let start = existing?.[0]?.redosled ? Number(existing[0].redosled) + 1 : 1;
    const toInsert: any[] = [];
    for (const oid of assign.orderIds) {
      const ord = orders.find((o) => o.id === oid);
      toInsert.push({
        ruta_id: assign.routeId,
        naracka_id: oid,
        redosled: start++,
        status: "na_cekane",
        suma_za_naplata: ord?.suma || 0,
      });
    }
    const { error } = await supabase.from("stops").insert(toInsert);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Нарачките се додадени во рутата");
  };

  return (
    <main className="container py-8">
      <SEO
        title="Рути — Гранд Партнер АС"
        description="Креирање, уредување и следење на рути и стопови."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/ruti"
      />
      <h1 className="text-3xl font-semibold mb-4">Рути</h1>

      <section className="rounded-lg border p-4 mb-6">
        <h2 className="font-medium mb-3">Нова рута</h2>
        <div className="grid gap-2 sm:grid-cols-4">
          <label className="grid gap-1">
            <span className="text-sm">Датум</span>
            <input
              type="date"
              className="h-10 rounded-md border bg-background px-3"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Возач</span>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
            >
              <option value="">— Изберете —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ime}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Статус</span>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">draft</option>
              <option value="aktivna">aktivna</option>
              <option value="zavrsena">zavrsena</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button onClick={createRoute}>Креирај</Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4 mb-6">
        <h2 className="font-medium mb-3">Додади нарачки во рута</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-sm">Рута</span>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={assign.routeId}
              onChange={(e) => setAssign({ ...assign, routeId: e.target.value })}
            >
              <option value="">— Изберете —</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.datum} — {driverMap.get(r.vozac_id || "") || "—"} ({r.status})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm">Нарачки</span>
            <select
              multiple
              className="min-h-40 rounded-md border bg-background px-3 py-2"
              value={assign.orderIds}
              onChange={(e) =>
                setAssign({
                  ...assign,
                  orderIds: Array.from(e.target.selectedOptions).map((o) => o.value),
                })
              }
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {new Date(o.datum).toLocaleDateString()} — {Number(o.suma).toLocaleString()} ден.
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-3">
            <Button onClick={addOrdersToRoute}>Додади</Button>
          </div>
        </div>
      </section>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Датум</th>
              <th className="p-3">Возач</th>
              <th className="p-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.datum}</td>
                <td className="p-3">{driverMap.get(r.vozac_id || "") || "—"}</td>
                <td className="p-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default RoutesPage;
