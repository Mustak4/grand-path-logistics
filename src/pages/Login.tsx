import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Truck, Users } from "lucide-react";

const Login = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.uloga === "dispecer") navigate("/dispecer", { replace: true });
    if (profile?.uloga === "vozac") navigate("/vozac", { replace: true });
  }, [profile, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Најавата е успешна.");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast.success("Регистрацијата е успешна. Проверете е-пошта за потврда.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Грешка при најава/регистрација");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <SEO
        title="Најава — Гранд Партнер АС"
        description="Најава и регистрација за диспечери и возачи."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/najava"
      />
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Гранд Партнер АС — Логистика
            </h1>
          </div>
          <div className="flex justify-center gap-1 mb-6">
            <Button 
              variant={mode === "login" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMode("login")}
              className="rounded-full"
            >
              Најава
            </Button>
            <Button 
              variant={mode === "signup" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMode("signup")}
              className="rounded-full"
            >
              Регистрација
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <div className="mobile-card bg-white/80 backdrop-blur-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Е-пошта
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Внесете ја вашата е-пошта"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Лозинка
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Внесете ја вашата лозинка"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-base font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Се праќа...
                </div>
              ) : (
                mode === "login" ? "Најави се" : "Регистрирај се"
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  По најава, интерфејсот ќе се прилагоди според вашата улога (возач/диспечер).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
