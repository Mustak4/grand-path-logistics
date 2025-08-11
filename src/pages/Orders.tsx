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
  X
} from "lucide-react";

interface OrderVM {
  id: string;
  datum: string;
  suma: number;
  klient_ime: string;
  tip_napalata: "fiskalna" | "faktura";
  napomena?: string;
  status: "aktivna" | "zavrsena" | "otkazana";
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderVM[]>([]);
  const [clients, setClients] = useState<{ id: string; ime: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderVM | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    datum: new Date().toISOString().slice(0, 10),
    klient_id: "",
    tip_napalata: "fiskalna" as "fiskalna" | "faktura",
    suma: "",
    stavki: [] as Array<{id: string, kolicina: string, edinica: "br" | "kg" | "par", vid: string}>,
    napomena: ""
  });

  useEffect(() => {
    loadOrders();
    loadClients();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Mock data for testing
      const mockOrders: OrderVM[] = [
        {
          id: "1",
          datum: "2025-08-08",
          suma: 2500,
          klient_ime: "Маркет Нова",
          tip_napalata: "fiskalna",
          napomena: "Достава до 14:00",
          status: "aktivna"
        },
        {
          id: "2",
          datum: "2025-08-08",
          suma: 1800,
          klient_ime: "Ресторан Стар",
          tip_napalata: "faktura",
          napomena: "Внимателно со пакетот",
          status: "zavrsena"
        },
        {
          id: "3",
          datum: "2025-08-08",
          suma: 3200,
          klient_ime: "Кафе Бар Централ",
          tip_napalata: "fiskalna",
          napomena: "Термички пакет",
          status: "aktivna"
        }
      ];
      
      setOrders(mockOrders);
      
      // Comment out real Supabase calls for now
      // const { data, error } = await supabase...
      
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error("Грешка при вчитување на нарачките");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      // Mock clients for testing
      const mockClients = [
        { id: "client1", ime: "Маркет Нова" },
        { id: "client2", ime: "Ресторан Стар" },
        { id: "client3", ime: "Кафе Бар Централ" },
        { id: "client4", ime: "Пицерија Италија" },
        { id: "client5", ime: "Супермаркет Македонија" }
      ];
      
      setClients(mockClients);
      
      // Comment out real Supabase calls for now
      // const { data, error } = await supabase...
      
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast.error("Грешка при вчитување на клиентите");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check required fields based on payment type
    if (!form.klient_id) {
      toast.error("Изберете клиент");
      return;
    }
    
    if (form.tip_napalata === "fiskalna" && !form.suma) {
      toast.error("Внесете сума за фискална наплата");
      return;
    }
    
    try {
      const selectedClient = clients.find(c => c.id === form.klient_id);
      
      if (editingOrder) {
        // Update existing order
        setOrders(prev => prev.map(order => 
          order.id === editingOrder.id 
            ? {
                ...order,
                datum: form.datum,
                suma: form.tip_napalata === "fiskalna" ? Number(form.suma) : 0,
                klient_ime: selectedClient?.ime || "—",
                tip_napalata: form.tip_napalata,
                napomena: form.napomena || undefined,
                status: "aktivna"
              }
            : order
        ));
        toast.success("Нарачката е ажурирана");
      } else {
        // Create new order
        const newOrder: OrderVM = {
          id: Date.now().toString(),
          datum: form.datum,
          suma: form.tip_napalata === "fiskalna" ? Number(form.suma) : 0,
          klient_ime: selectedClient?.ime || "—",
          tip_napalata: form.tip_napalata,
          napomena: form.napomena || undefined,
          status: "aktivna"
        };
        
        setOrders(prev => [newOrder, ...prev]);
        toast.success("Нарачката е креирана");
      }
      
      // Reset form and reload
      resetForm();
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error(error.message || "Грешка при зачувување на нарачката");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Дали сте сигурни дека сакате да ја избришете нарачката?")) {
      return;
    }
    
    try {
      setOrders(prev => prev.filter(order => order.id !== id));
      toast.success("Нарачката е избришана");
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast.error("Грешка при бришење на нарачката");
    }
  };

  const editOrder = (order: OrderVM) => {
    setEditingOrder(order);
    setForm({
      datum: order.datum,
      klient_id: "", // Will be set from clients lookup
      tip_napalata: order.tip_napalata,
      suma: order.suma.toString(),
      stavki: [], // These would come from database in real implementation
      napomena: order.napomena || ""
    });
    setShowForm(true);
  };

  const addStavka = () => {
    const newStavka = {
      id: Date.now().toString(),
      kolicina: "",
      edinica: "br" as "br" | "kg" | "par",
      vid: ""
    };
    setForm({ ...form, stavki: [...form.stavki, newStavka] });
  };

  const updateStavka = (id: string, field: string, value: string | "br" | "kg" | "par") => {
    setForm({
      ...form,
      stavki: form.stavki.map(stavka =>
        stavka.id === id ? { ...stavka, [field]: value } : stavka
      )
    });
  };

  const removeStavka = (id: string) => {
    setForm({
      ...form,
      stavki: form.stavki.filter(stavka => stavka.id !== id)
    });
  };

  const resetForm = () => {
    setForm({
      datum: new Date().toISOString().slice(0, 10),
      klient_id: "",
      tip_napalata: "fiskalna",
      suma: "",
      stavki: [],
      napomena: ""
    });
    setEditingOrder(null);
    setShowForm(false);
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

  const filteredOrders = orders.filter(order =>
    order.klient_ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.datum.includes(searchTerm) ||
    order.suma.toString().includes(searchTerm)
  );

  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.suma, 0);

  return (
    <>
      <SEO
        title="Нарачки — Гранд Партнер АС"
        description="Список на нарачки со износ, клиент и тип на наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/naracki"
      />
      
      <PageHeader 
        title="Нарачки" 
        subtitle={`Управување со нарачки • Вкупно: ${totalAmount.toLocaleString()} денари`}
      >
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Нова нарачка
        </Button>
      </PageHeader>

      <main className="mobile-container mobile-content md:desktop-container md:desktop-content py-4 md:py-8">

      {/* Search and Filter */}
      <div className="mobile-card mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Пребарај нарачки..."
              className="mobile-input pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredOrders.length} нарачки
            </span>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-8 md:pt-4 overflow-y-auto">
          <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingOrder ? "Уреди нарачка" : "Нова нарачка"}
            </h2>
            
            <form onSubmit={handleSubmit} className="mobile-spacing">
              <div className="mobile-form-group">
                <label className="mobile-form-label">Датум</label>
                <input
                  type="date"
                  className="mobile-input"
                  value={form.datum}
                  onChange={(e) => setForm({ ...form, datum: e.target.value })}
                  required
                />
              </div>
              
              <div className="mobile-form-group">
                <label className="mobile-form-label">Клиент</label>
                <select
                  className="mobile-input"
                  value={form.klient_id}
                  onChange={(e) => setForm({ ...form, klient_id: e.target.value })}
                  required
                >
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
                <select
                  className="mobile-input"
                  value={form.tip_napalata}
                  onChange={(e) => setForm({ ...form, tip_napalata: e.target.value as any })}
                >
                  <option value="fiskalna">Фискална</option>
                  <option value="faktura">Фактура</option>
                </select>
              </div>
              
              {/* Only show Сума if Фискална is selected */}
              {form.tip_napalata === "fiskalna" && (
                <div className="mobile-form-group">
                  <label className="mobile-form-label">Сума (ден.)</label>
                  <input
                    type="number"
                    className="mobile-input"
                    value={form.suma}
                    onChange={(e) => setForm({ ...form, suma: e.target.value })}
                    placeholder="0"
                    required={form.tip_napalata === "fiskalna"}
                  />
                </div>
              )}
              
              {/* Dynamic items list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ставки за достава</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStavka}
                  >
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
                            <input
                              type="number"
                              className="w-full h-8 rounded border bg-background px-2 text-sm"
                              value={stavka.kolicina}
                              onChange={(e) => updateStavka(stavka.id, "kolicina", e.target.value)}
                              placeholder="Кол."
                              min="0"
                              step="0.1"
                            />
                          </div>
                          
                          {/* Единица */}
                          <div className="col-span-2">
                            <select
                              className="w-full h-8 rounded border bg-background px-1 text-sm"
                              value={stavka.edinica}
                              onChange={(e) => updateStavka(stavka.id, "edinica", e.target.value as "br" | "kg" | "par")}
                            >
                              <option value="br">бр.</option>
                              <option value="kg">кг.</option>
                              <option value="par">пар.</option>
                            </select>
                          </div>
                          
                          {/* Вид роба */}
                          <div className="col-span-6">
                            <input
                              type="text"
                              className="w-full h-8 rounded border bg-background px-2 text-sm"
                              value={stavka.vid}
                              onChange={(e) => updateStavka(stavka.id, "vid", e.target.value)}
                              placeholder="Опиши го производот..."
                            />
                          </div>
                          
                          {/* Remove button */}
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStavka(stavka.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
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
                <textarea
                  className="mobile-input h-20 resize-none"
                  value={form.napomena}
                  onChange={(e) => setForm({ ...form, napomena: e.target.value })}
                  placeholder="Дополнителни информации..."
                />
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
            <p className="text-muted-foreground">
              {searchTerm ? "Нема резултати за пребарувањето." : "Креирајте прва нарачка за да започнете."}
            </p>
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
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(order.datum).toLocaleDateString("mk-MK")}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{order.klient_ime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {Number(order.suma).toLocaleString()} ден.
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-muted-foreground">
                          {getTipText(order.tip_napalata)}
                        </span>
                        {order.napomena && (
                          <span className="text-muted-foreground italic">
                            {order.napomena}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editOrder(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteOrder(order.id)}
                        className="text-red-600 hover:text-red-700"
                      >
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
