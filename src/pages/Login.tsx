import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <main className="container py-8 max-w-md">
      <SEO
        title="Најава — Гранд Партнер АС"
        description="Најава и регистрација за диспечери и возачи."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/najava"
      />
      <h1 className="text-3xl font-semibold mb-4">{mode === "login" ? "Најава" : "Регистрација"}</h1>
      <div className="mb-4 flex gap-2">
        <Button variant={mode === "login" ? "default" : "outline"} size="sm" onClick={() => setMode("login")}>
          Најава
        </Button>
        <Button variant={mode === "signup" ? "default" : "outline"} size="sm" onClick={() => setMode("signup")}>
          Регистрација
        </Button>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Е-пошта</span>
          <input
            type="email"
            className="h-10 rounded-md border bg-background px-3"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Лозинка</span>
          <input
            type="password"
            className="h-10 rounded-md border bg-background px-3"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? "Се праќа..." : mode === "login" ? "Најави се" : "Регистрирај се"}
        </Button>
      </form>
      <p className="mt-3 text-sm text-muted-foreground">
        По најава, интерфејсот ќе се прилагоди според вашата улога (возач/диспечер).
      </p>
    </main>
  );
};

export default Login;
