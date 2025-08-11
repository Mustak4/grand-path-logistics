import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface StopRow {
  id: string;
  redosled: number;
  naracka_id: string;
}

interface OrderRow {
  id: string;
  suma: number;
  klient_id: string;
}

interface ClientRow {
  id: string;
  ime: string;
  adresa: string;
  naseleno_mesto: string;
  telefon: string | null;
}

interface ItemRow {
  naracka_id: string;
  kolicina: number;
  produkt_ime: string;
  edinica: string;
}

const RoutePrint = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [datum, setDatum] = useState<string>("");
  const [driver, setDriver] = useState<string>("");
  const [stops, setStops] = useState<StopRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const orderMap = useMemo(() => new Map(orders.map(o => [o.id, o])), [orders]);
  const itemsByOrder = useMemo(() => {
    const map = new Map<string, ItemRow[]>();
    items.forEach(it => {
      if (!map.has(it.naracka_id)) map.set(it.naracka_id, []);
      map.get(it.naracka_id)!.push(it);
    });
    return map;
  }, [items]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data: routeRow } = await supabase
          .from("routes")
          .select("datum, vozac_id")
          .eq("id", id)
          .single();
        if (routeRow) {
          setDatum(routeRow.datum);
          if (routeRow.vozac_id) {
            const { data: prof } = await supabase
              .from("profiles")
              .select("ime")
              .eq("id", routeRow.vozac_id)
              .single();
            setDriver(prof?.ime || "");
          }
        }

        const { data: stopRows } = await supabase
          .from("stops")
          .select("id, redosled, naracka_id")
          .eq("ruta_id", id)
          .order("redosled");
        setStops(stopRows || []);
        const orderIds = (stopRows || []).map(s => s.naracka_id);
        if (orderIds.length === 0) return;

        const { data: orderRows } = await supabase
          .from("orders")
          .select("id, suma, klient_id")
          .in("id", orderIds);
        setOrders(orderRows || []);
        const clientIds = Array.from(new Set((orderRows || []).map(o => o.klient_id)));
        const { data: clientRows } = await supabase
          .from("clients")
          .select("id, ime, adresa, naseleno_mesto, telefon")
          .in("id", clientIds);
        setClients(clientRows || []);

        // Load items for all orders
        const { data: itemsRows } = await supabase
          .from("order_items")
          .select("naracka_id, kolicina, products:produkt_id(ime, edinica)")
          .in("naracka_id", orderIds);
        setItems(
          (itemsRows || []).map((r: any) => ({
            naracka_id: r.naracka_id,
            kolicina: Number(r.kolicina || 0),
            produkt_ime: r.products?.ime || "",
            edinica: r.products?.edinica || "",
          }))
        );

        // Trigger print after a short delay so the DOM is ready
        setTimeout(() => window.print(), 500);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return null;

  return (
    <div className="print-container" style={{ padding: 24 }}>
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
        }
        .manifest-title { font-size: 20px; font-weight: 700; }
        .manifest-meta { color: #666; font-size: 12px; }
        .section-title { font-weight: 600; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; vertical-align: top; }
        th { background: #f8fafc; text-align: left; }
        .items { color: #374151; font-size: 12px; }
      `}</style>

      <div className="no-print" style={{ marginBottom: 12 }}>
        <button onClick={() => window.print()} className="px-3 py-2 rounded border">Печати</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="manifest-title">Манифест за испорака</div>
        <div className="manifest-meta">
          Датум: {new Date(datum).toLocaleDateString("mk-MK")} • Возач: {driver || "—"}
        </div>
      </div>

      <div className="section-title">Стопови</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Клиент</th>
            <th>Адреса</th>
            <th>Телефон</th>
            <th>Ставки</th>
            <th style={{ width: 90 }}>Сума</th>
          </tr>
        </thead>
        <tbody>
          {stops.map((s) => {
            const o = orderMap.get(s.naracka_id);
            const c = o ? clientMap.get(o.klient_id) : undefined;
            const its = itemsByOrder.get(s.naracka_id) || [];
            return (
              <tr key={s.id}>
                <td>{s.redosled}</td>
                <td>{c?.ime || "—"}</td>
                <td>{c ? `${c.adresa}, ${c.naseleno_mesto}` : "—"}</td>
                <td>{c?.telefon || "—"}</td>
                <td className="items">
                  {its.length === 0 ? (
                    <span>—</span>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {its.map((it, idx) => (
                        <li key={idx}>{it.kolicina} {it.edinica}. — {it.produkt_ime}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{o ? Number(o.suma || 0).toLocaleString() : 0} ден.</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoutePrint;


