import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  Receipt,
  FileText,
  X,
  Map
} from "lucide-react";
import { optimizeRoute, WAREHOUSE_COORDINATES } from "@/lib/route-optimization";

interface OrderVM {
  id: string;
  datum: string;
  suma: number;
  klient_ime: string;
  klient_id: string;
  tip_napalata: "fiskalna" | "faktura";
  napomena?: string;
  status: "aktivna" | "zavrsena" | "otkazana";
  selected?: boolean; // For route selection
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderVM[]>([]);
  const [clients, setClients] = useState<{ id: string; ime: string }[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, { ime: string; edinica: string; kolicina: number }[]>>({});
  const [drivers, setDrivers] = useState<{ id: string; ime: string }[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderVM | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showRouteModal, setShowRouteModal] = useState(false);

  const [form, setForm] = useState({
    datum: new Date().toISOString().slice(0, 10),
    klient_id: "",
    tip_napalata: "fiskalna" as "fiskalna" | "faktura",
    suma: "",
    stavki: [] as Array<{ id: string; kolicina: string; edinica: "pak" | "par" | "kg"; vid: string }>,
    napomena: ""
  });

  useEffect(() => {
    loadOrders();
    loadClients();
    loadDrivers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          datum,
          suma,
          tip_naplata,
          zabeleshka,
          klient_id,
          clients:klient_id(ime)
        `)
        .order("datum", { ascending: false })
        .limit(200);

      if (error) throw error;

      const mapped: OrderVM[] = (data || []).map((o: any) => ({
        id: o.id,
        datum: o.datum,
        suma: Number(o.suma || 0),
        klient_ime: o.clients?.ime || "—",
        klient_id: o.klient_id,
        tip_napalata: o.tip_naplata as "fiskalna" | "faktura",
        napomena: o.zabeleshka || undefined,
        status: "aktivna"
      }));

      setOrders(mapped);

      // Load order items for listed orders
      const orderIds = mapped.map((m) => m.id);
      if (orderIds.length > 0) {
        const { data: items, error: itemsErr } = await supabase
          .from("order_items")
          .select(`naracka_id, kolicina, products:produkt_id(ime, edinica)`) // join products
          .in("naracka_id", orderIds);
        if (itemsErr) throw itemsErr;
        const map: Record<string, { ime: string; edinica: string; kolicina: number }[]> = {};
        (items || []).forEach((row: any) => {
          const key = row.naracka_id as string;
          if (!map[key]) map[key] = [];
          map[key].push({
            ime: row.products?.ime || "—",
            edinica: row.products?.edinica || "",
            kolicina: Number(row.kolicina || 0)
          });
        });
        setItemsByOrder(map);
      } else {
        setItemsByOrder({});
      }
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error("Грешка при вчитување на нарачките");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, ime")
        .order("ime");
      if (error) throw error;
      setClients((data || []).map((c: any) => ({ id: c.id, ime: c.ime })));
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast.error("Грешка при вчитување на клиентите");
    }
  };

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, ime")
        .eq("uloga", "vozac");
      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error loading drivers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.klient_id) {
      toast.error("Изберете клиент");
      return;
    }
    if (form.tip_napalata === "fiskalna" && !form.suma) {
      toast.error("Внесете сума за фискална наплата");
      return;
    }
    try {
      const payload = {
        datum: form.datum,
        klient_id: form.klient_id,
        tip_naplata: form.tip_napalata,
        suma: form.tip_napalata === "fiskalna" ? Number(form.suma) : 0,
        metod_plakanje: 'gotovo',
        zabeleshka: form.napomena || null
      } as const;

      // Insert or update order and capture ID
      let orderId: string;
      if (editingOrder) {
        const { data, error } = await supabase
          .from("orders")
          .update(payload)
          .eq("id", editingOrder.id)
          .select("id")
          .single();
        if (error) throw error;
        orderId = data.id;
        toast.success("Нарачката е ажурирана");
      } else {
        const { data, error } = await supabase
          .from("orders")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        orderId = data.id;
        toast.success("Нарачката е креирана");
      }

      // Persist order items (stavki)
      // Prepare clean items (skip empty rows)
      const items = form.stavki
        .map((s) => ({
          kolicina: parseFloat(s.kolicina || '0'),
          edinica: s.edinica,
          vid: (s.vid || '').trim(),
        }))
        .filter((s) => s.kolicina > 0 && s.vid.length > 0);

      // Delete previous items on update
      if (editingOrder) {
        const { error: delErr } = await supabase.from("order_items").delete().eq("naracka_id", orderId);
        if (delErr) throw delErr;
      }

      if (items.length > 0) {
        // Ensure products exist and collect product ids
        const productRows: { naracka_id: string; produkt_id: string; kolicina: number }[] = [];
        for (const it of items) {
          // Try find existing product by name + unit
          const { data: existing, error: findErr } = await supabase
            .from("products")
            .select("id")
            .eq("ime", it.vid)
            .eq("edinica", it.edinica)
            .limit(1);
          if (findErr) throw findErr;
          let productId = existing?.[0]?.id as string | undefined;
          if (!productId) {
            const { data: prod, error: insErr } = await supabase
              .from("products")
              .insert({ ime: it.vid, edinica: it.edinica, cena_po_edinica: 0 })
              .select("id")
              .single();
            if (insErr) throw insErr;
            productId = prod.id;
          }
          productRows.push({ naracka_id: orderId, produkt_id: productId!, kolicina: it.kolicina });
        }
        const { error: itemsErr } = await supabase.from("order_items").insert(productRows);
        if (itemsErr) throw itemsErr;
      }

      resetForm();
      loadOrders();
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error(error.message || "Грешка при зачувување на нарачката");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Дали сте сигурни дека сакате да ја избришете нарачката?")) return;
    try {
      // Delete dependent stops first (stops has RESTRICT FK to orders)
      const { error: stopsErr } = await supabase.from("stops").delete().eq("naracka_id", id);
      if (stopsErr) throw stopsErr;
      // order_items has ON DELETE CASCADE, no need to delete explicitly
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      toast.success("Нарачката е избришана");
      loadOrders();
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast.error("Грешка при бришење на нарачката");
    }
  };

  const editOrder = async (order: OrderVM) => {
    setEditingOrder(order);
    // Load items for this order to prefill the form
    const { data: items } = await supabase
      .from("order_items")
      .select(`kolicina, products:produkt_id(ime, edinica)`) // join products
      .eq("naracka_id", order.id);
    const stavki = (items || []).map((row: any) => ({
      id: crypto.randomUUID(),
      kolicina: String(row.kolicina || ''),
      edinica: (row.products?.edinica as "pak" | "par" | "kg") || "pak",
      vid: row.products?.ime || ""
    }));

    setForm({
      datum: order.datum,
      klient_id: order.klient_id,
      tip_napalata: order.tip_napalata,
      suma: order.suma.toString(),
      stavki,
      napomena: order.napomena || ""
    });
    setShowForm(true);
  };

  const addStavka = () => {
    const newStavka = { id: Date.now().toString(), kolicina: "", edinica: "pak" as "pak" | "par" | "kg", vid: "" };
    setForm({ ...form, stavki: [...form.stavki, newStavka] });
  };

  const updateStavka = (id: string, field: string, value: string | "pak" | "kg" | "par") => {
    setForm({ ...form, stavki: form.stavki.map((stavka) => (stavka.id === id ? { ...stavka, [field]: value } : stavka)) });
  };

  const removeStavka = (id: string) => {
    setForm({ ...form, stavki: form.stavki.filter((stavka) => stavka.id !== id) });
  };

  const resetForm = () => {
    setForm({ datum: new Date().toISOString().slice(0, 10), klient_id: "", tip_napalata: "fiskalna", suma: "", stavki: [], napomena: "" });
    setEditingOrder(null);
    setShowForm(false);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]));
  };

  const createRouteFromSelectedOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Изберете нарачки за рутата");
      return;
    }
    try {
      // Load full order + client data for selected orders
      const { data: ordersWithClients, error: joinError } = await supabase
        .from("orders")
        .select(`id, datum, suma, klient_id, clients(id, ime, adresa, naseleno_mesto, lat, lng)`) // relation
        .in("id", selectedOrders);
      if (joinError) throw joinError;

      // Prepare for optimization
      const ordersForOptimization = (ordersWithClients || []).map((o: any) => ({
        id: o.id,
        klient_id: o.klient_id,
        suma: o.suma || 0,
        datum: o.datum,
        tip_napalata: "fiskalna" as const, // not needed for routing but typed
        client: {
          lat: o.clients?.lat ?? undefined,
          lng: o.clients?.lng ?? undefined,
          adresa: o.clients?.adresa || "",
          naseleno_mesto: o.clients?.naseleno_mesto || ""
        }
      }));

      const optimized = optimizeRoute(ordersForOptimization);

      // Create route
      const { data: routeData, error: routeError } = await supabase
        .from("routes")
        .insert({
          datum: new Date().toISOString().slice(0, 10),
          vozac_id: selectedDriver || null,
          status: "aktivna",
          vozilo: null
        })
        .select()
        .single();
      if (routeError) throw routeError;

      // Create stops in optimized order
      const stopsToCreate = optimized.map((o, index) => ({
        ruta_id: routeData.id,
        naracka_id: o.id,
        redosled: index + 1,
        status: "na_cekane" as "na_cekane",
        suma_za_naplata: o.suma || 0
      }));
      const { error: stopsError } = await supabase.from("stops").insert(stopsToCreate);
      if (stopsError) throw stopsError;

      toast.success(`Рутата е креирана со ${optimized.length} нарачки. Старт: ${WAREHOUSE_COORDINATES.lat.toFixed(4)}, ${WAREHOUSE_COORDINATES.lng.toFixed(4)}`);
      setSelectedOrders([]);
      setSelectedDriver("");
      setShowRouteModal(false);
      loadOrders();
    } catch (error: any) {
      console.error("Error creating route:", error);
      toast.error(error.message || "Грешка при креирање на рутата");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aktivna":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "zavrsena":
        return "bg-green-100 text-green-800 border-green-200";
      case "otkazana":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "aktivna":
        return "Активна";
      case "zavrsena":
        return "Завршена";
      case "otkazana":
        return "Откажана";
      default:
        return status;
    }
  };

  const getTipText = (tip: string) => {
    switch (tip) {
      case "fiskalna":
        return "Фискална";
      case "faktura":
        return "Фактура";
      default:
        return tip;
    }
  };

  const filteredOrders = orders.filter((order) => order.klient_ime.toLowerCase().includes(searchTerm.toLowerCase()) || order.datum.includes(searchTerm) || order.suma.toString().includes(searchTerm));
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.suma, 0);

  return (
    <>
      <SEO title="Нарачки — Гранд Партнер АС" description="Список на нарачки со износ, клиент и тип на наплата." canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/naracki" />

      <PageHeader title="Нарачки" subtitle={`Управување со нарачки • Вкупно: ${totalAmount.toLocaleString()} денари`}>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <Button variant="outline" onClick={() => setShowRouteModal(true)} className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
              <Map className="w-4 h-4 mr-2" />
              Креирај рута ({selectedOrders.length})
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Нова нарачка
          </Button>
        </div>
      </PageHeader>

      <main className="mobile-container mobile-content md:desktop-container md:desktop-content py-4 md:py-8">
        {/* Search and Filter */}
        <div className="mobile-card mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Пребарај нарачки..." className="mobile-input pl-10 pr-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{filteredOrders.length} нарачки</span>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-8 md:pt-4 overflow-y-auto">
            <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">{editingOrder ? "Уреди нарачка" : "Нова нарачка"}</h2>
              <form onSubmit={handleSubmit} className="mobile-spacing">
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Датум (dd/mm/yyyy)</label>
                  <input
                    type="date"
                    className="mobile-input"
                    value={form.datum}
                    onChange={(e) => setForm({ ...form, datum: e.target.value })}
                    required
                    lang="mk"
                  />
                </div>
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Клиент</label>
                  <select className="mobile-input" value={form.klient_id} onChange={(e) => setForm({ ...form, klient_id: e.target.value })} required>
                    <option value="">— Изберете клиент —</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.ime}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Тип наплата</label>
                  <select className="mobile-input" value={form.tip_napalata} onChange={(e) => setForm({ ...form, tip_napalata: e.target.value as any })}>
                    <option value="fiskalna">Фискална</option>
                    <option value="faktura">Фактура</option>
                  </select>
                </div>
                {/* Only show Сума if Фискална is selected */}
                {form.tip_napalata === "fiskalna" && (
                  <div className="mobile-form-group">
                    <label className="mobile-form-label">Сума (ден.)</label>
                    <input type="number" className="mobile-input" value={form.suma} onChange={(e) => setForm({ ...form, suma: e.target.value })} placeholder="0" required={form.tip_napalata === "fiskalna"} />
                  </div>
                )}
                {/* Dynamic items list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Ставки за достава</label>
                    <Button type="button" variant="outline" size="sm" onClick={addStavka}>
                      <Plus className="w-4 h-4 mr-2" />
                      Додај ставка
                    </Button>
                  </div>
                  {form.stavki.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                      <p className="text-muted-foreground text-sm">
                        Додајте ставки за достава (пр: 5бр. - копан, 70кг. - свински пафлак, 2пар. - ракавици)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.stavki.map((stavka) => (
                        <div key={stavka.id} className="border rounded-lg p-3 bg-muted/20">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            {/* Количина */}
                            <div className="col-span-3">
                              <input type="number" className="w-full h-8 rounded border bg-background px-2 text-sm" value={stavka.kolicina} onChange={(e) => updateStavka(stavka.id, "kolicina", e.target.value)} placeholder="Кол." min="0" step="0.1" />
                            </div>
                            {/* Единица */}
                            <div className="col-span-2">
                              <select className="w-full h-8 rounded border bg-background px-1 text-sm" value={stavka.edinica} onChange={(e) => updateStavka(stavka.id, "edinica", e.target.value as "pak" | "kg" | "par")}>
                               <option value="pak">пак.</option>
                               <option value="par">пар.</option>
                               <option value="kg">кг.</option>
                              </select>
                            </div>
                            {/* Вид роба */}
                            <div className="col-span-6">
                              <input type="text" className="w-full h-8 rounded border bg-background px-2 text-sm" value={stavka.vid} onChange={(e) => updateStavka(stavka.id, "vid", e.target.value)} placeholder="Опиши го производот..." />
                            </div>
                            {/* Remove button */}
                            <div className="col-span-1">
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeStavka(stavka.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Preview */}
                          {stavka.kolicina && stavka.vid && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <strong>Преглед:</strong> {stavka.kolicina}{stavka.edinica} - {stavka.vid}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Напомена</label>
                  <textarea className="mobile-input h-20 resize-none" value={form.napomena} onChange={(e) => setForm({ ...form, napomena: e.target.value })} placeholder="Дополнителни информации..." />
                </div>
                <div className="mobile-action-row">
                  <Button type="submit" className="mobile-button-primary">
                    {editingOrder ? "Ажурирај" : "Креирај"}
                  </Button>
                  <Button type="button" className="mobile-button-outline" onClick={resetForm}>
                    Откажи
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Route Creation Modal */}
        {showRouteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-8 md:pt-4 overflow-y-auto">
            <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Креирај рута од избрани нарачки</h2>
              <div className="mobile-spacing">
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Возач</label>
                  <select className="mobile-input" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                    <option value="">— Изберете возач —</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.ime}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Избрани нарачки</label>
                  <div className="border rounded-lg p-3 bg-muted/30 max-h-40 overflow-y-auto">
                    {orders
                      .filter((order) => selectedOrders.includes(order.id))
                      .map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <span className="font-medium">{order.klient_ime}</span>
                            <span className="text-sm text-muted-foreground ml-2">{Number(order.suma).toLocaleString()} ден.</span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => toggleOrderSelection(order.id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Вкупно: {selectedOrders.length} нарачки •
                    {orders
                      .filter((order) => selectedOrders.includes(order.id))
                      .reduce((sum, order) => sum + order.suma, 0)
                      .toLocaleString()}{" "}
                    денари
                  </p>
                </div>
                <div className="mobile-action-row">
                  <Button onClick={createRouteFromSelectedOrders} className="mobile-button-primary flex-1" disabled={selectedOrders.length === 0}>
                    <Map className="w-4 h-4 mr-2" />
                    Креирај рута
                  </Button>
                  <Button onClick={() => setShowRouteModal(false)} className="mobile-button-outline flex-1">
                    Откажи
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="mobile-card">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Се вчитува...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Нема нарачки</h3>
              <p className="text-muted-foreground">{searchTerm ? "Нема резултати за пребарувањето." : "Креирајте прва нарачка за да започнете."}</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Вкупно сума:</span>
                  <span className="font-semibold">{Number(totalAmount).toLocaleString()} денари</span>
                </div>
              </div>

              {/* Orders */}
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      {/* Selection checkbox */}
                      <input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrderSelection(order.id)} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />

                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{new Date(order.datum).toLocaleDateString("mk-MK")}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.klient_ime}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{Number(order.suma).toLocaleString()} ден.</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                          <span className="text-muted-foreground">{getTipText(order.tip_napalata)}</span>
                          {order.napomena && <span className="text-muted-foreground italic">{order.napomena}</span>}
                        </div>
              {/* Items preview */}
              {itemsByOrder[order.id] && itemsByOrder[order.id].length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {itemsByOrder[order.id].map((it, idx) => (
                    <div key={idx}>
                      - {it.kolicina} {it.edinica}. — {it.ime}
                    </div>
                  ))}
                </div>
              )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editOrder(order)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Orders;
