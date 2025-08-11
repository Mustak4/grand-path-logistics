import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone, Mail, Truck, Settings, LogOut } from "lucide-react";

const DriverProfile = () => {
  const { user, signOut } = useAuth();

  return (
    <>
      <SEO
        title="Профил — Гранд Партнер АС"
        description="Профил и поставки за возач."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac/profile"
      />
      
      <PageHeader 
        title="Мојот профил" 
        subtitle="Лични податоци и поставки"
        customBackPath="/vozac"
      />

      <main className="mobile-container mobile-content">
        {/* Profile Card */}
        <div className="mobile-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {user?.email?.split('@')[0] || 'Возач'}
              </h2>
              <p className="text-sm text-muted-foreground">Активен возач</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user?.email || 'Не е поставен'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">+389 XX XXX XXX</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Возило: MK-XX-XXX</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="mobile-card mb-6">
          <h3 className="text-lg font-semibold mb-4">Поставки</h3>
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-3" />
              Нотификации
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <User className="w-4 h-4 mr-3" />
              Уреди профил
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="mobile-card">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Одјава
          </Button>
        </div>

        {/* Development Note */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Детални поставки и уредување на профил ќе бидат достапни наскоро.
          </p>
        </div>
      </main>
    </>
  );
};

export default DriverProfile;
