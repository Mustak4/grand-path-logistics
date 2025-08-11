import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createNavigationUrl, formatCoordinates } from "@/lib/navigation";
  import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  User,
  MapPin,
  Phone,
  Receipt,
  FileText,
  Navigation,
  Crosshair
} from "lucide-react";

interface ClientVM {
  id: string;
  ime: string;
  naseleno_mesto: string;
  adresa: string;
  lat?: number;
  lng?: number;
  telefon?: string;
  napomena?: string;
}

const Clients = () => {
  const [clients, setClients] = useState<ClientVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientVM | null>(null);
  const [searchTerm, setSearchTerm] = useState("");



  const [form, setForm] = useState({
    ime: "",
    naseleno_mesto: "",
    adresa: "",
    lat: "",
    lng: "",
    telefon: "",
    napomena: ""
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("clients")
        .select("id, ime, naseleno_mesto, adresa, lat, lng, telefon, zabeleshka")
        .order("ime");
        
      if (error) throw error;
      
      setClients(data || []);
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast.error("Грешка при вчитување на клиентите");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.ime || !form.naseleno_mesto || !form.adresa) {
      toast.error("Пополнете ги сите задолжителни полиња");
      return;
    }
    
    try {
      const clientData = {
        ime: form.ime,
        naseleno_mesto: form.naseleno_mesto,
        adresa: form.adresa,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        telefon: form.telefon || null,
        zabeleshka: form.napomena || null
      };
      
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", editingClient.id);
          
        if (error) throw error;
        toast.success("Клиентот е ажуриран");
      } else {
        // Create new client
        const { error } = await supabase
          .from("clients")
          .insert(clientData);
          
        if (error) throw error;
        toast.success("Клиентот е креиран");
      }
      
      // Reset form and reload
      resetForm();
      loadClients();
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast.error(error.message || "Грешка при зачувување на клиентот");
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Дали сте сигурни дека сакате да го избришете клиентот?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
      toast.success("Клиентот е избришан");
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error("Грешка при бришење на клиентот");
    }
  };

  const editClient = (client: ClientVM) => {
    setEditingClient(client);
            setForm({
          ime: client.ime,
          naseleno_mesto: client.naseleno_mesto,
          adresa: client.adresa,
          lat: client.lat ? client.lat.toString() : "",
          lng: client.lng ? client.lng.toString() : "",
          telefon: client.telefon || "",
          napomena: client.napomena || ""
        });
    setShowForm(true);
  };

  const resetForm = () => {
            setForm({
          ime: "",
          naseleno_mesto: "",
          adresa: "",
          lat: "",
          lng: "",
          telefon: "",
          napomena: ""
        });
    setEditingClient(null);
    setShowForm(false);
  };



  const filteredClients = clients.filter(client =>
    client.ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.naseleno_mesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.adresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEO
        title="Клиенти — Гранд Партнер АС"
        description="Список на клиенти со адреси, контакт и тип на наплата."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/klienti"
      />
      
      <PageHeader 
        title="Клиенти" 
        subtitle="Управување со клиенти и нивните податоци"
      >
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Нов клиент
        </Button>
      </PageHeader>

      <main className="mobile-container mobile-content md:desktop-container md:desktop-content py-4 md:py-8">

      {/* Search */}
      <div className="mobile-card mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Пребарај клиенти..."
              className="mobile-input pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredClients.length} клиенти
            </span>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-4 pt-8 md:pt-4 overflow-y-auto">
          <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingClient ? "Уреди клиент" : "Нов клиент"}
            </h2>
            
            <form onSubmit={handleSubmit} className="mobile-spacing">
              <div className="mobile-form-group">
                <label className="mobile-form-label">Име на клиент</label>
                <input
                  type="text"
                  className="mobile-input"
                  value={form.ime}
                  onChange={(e) => setForm({ ...form, ime: e.target.value })}
                  placeholder="Внесете име на клиент"
                  required
                />
              </div>
              
              <div className="mobile-form-group">
                <label className="mobile-form-label">Населено место</label>
                <input
                  type="text"
                  className="mobile-input"
                  value={form.naseleno_mesto}
                  onChange={(e) => setForm({ ...form, naseleno_mesto: e.target.value })}
                  placeholder="Внесете населено место"
                  required
                />
              </div>
              
              <div className="mobile-form-group">
                <label className="mobile-form-label">Адреса</label>
                <input
                  type="text"
                  className="mobile-input"
                  value={form.adresa}
                  onChange={(e) => setForm({ ...form, adresa: e.target.value })}
                  placeholder="Внесете адреса"
                  required
                />
              </div>
              
              <div className="mobile-form-group">
                <label className="mobile-form-label">GPS Координати (препорачано)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      step="any"
                      className="mobile-input text-sm"
                      value={form.lat}
                      onChange={(e) => setForm({ ...form, lat: e.target.value })}
                      placeholder="41.9981"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Ширина (Latitude)</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      className="mobile-input text-sm"
                      value={form.lng}
                      onChange={(e) => setForm({ ...form, lng: e.target.value })}
                      placeholder="21.4254"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Должина (Longitude)</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="mb-2">
                    💡 Препорачуваме да додавате GPS координати за точна навигација до клиентот
                  </p>
                  <p className="text-xs">
                    <strong>Примери за главни градови:</strong><br/>
                    🏛️ Скопје: 41.9981, 21.4254<br/>
                    🏰 Битола: 41.0297, 21.3347<br/>
                    🌊 Охрид: 41.1171, 20.8016<br/>
                    ⛰️ Тетово: 42.0069, 20.9714
                  </p>
                </div>
              </div>
              
              <div className="mobile-form-group">
                <label className="mobile-form-label">Телефон</label>
                <input
                  type="tel"
                  className="mobile-input"
                  value={form.telefon}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  placeholder="Внесете телефон"
                />
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
                  {editingClient ? "Ажурирај" : "Креирај"}
                </Button>
                <Button type="button" className="mobile-button-outline" onClick={resetForm}>
                  Откажи
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients List */}
      <div className="mobile-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Се вчитува...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нема клиенти</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Нема резултати за пребарувањето." : "Креирајте прв клиент за да започнете."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{client.ime}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{client.naseleno_mesto}</span>
                      </div>
                      
                      {client.telefon && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{client.telefon}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="text-muted-foreground">{client.adresa}</span>

                      {client.napomena && (
                        <span className="text-muted-foreground italic">
                          {client.napomena}
                        </span>
                      )}
                    </div>
                    
                    {/* Coordinate info and navigation */}
                    <div className="flex items-center gap-4 text-xs">
                      {client.lat && client.lng ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Crosshair className="w-3 h-3" />
                          <span>GPS: {formatCoordinates(client.lat, client.lng)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600">
                          <MapPin className="w-3 h-3" />
                          <span>Нема GPS координати</span>
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        asChild
                      >
                        <a
                          href={createNavigationUrl(client)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Навигација
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editClient(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteClient(client.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>
    </>
  );
};

export default Clients;
