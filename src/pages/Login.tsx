import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Login = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Поврзете Supabase за автентикација, па ќе го активираме логирањето.");
  };

  return (
    <main className="container py-8 max-w-md">
      <SEO
        title="Најава — Гранд Партнер АС"
        description="Најава за диспечери и возачи (Supabase ќе се додаде)."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/najava"
      />
      <h1 className="text-3xl font-semibold mb-4">Најава</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Е-пошта</span>
          <input type="email" className="h-10 rounded-md border bg-background px-3" required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Лозинка</span>
          <input type="password" className="h-10 rounded-md border bg-background px-3" required />
        </label>
        <Button type="submit">Најави се</Button>
      </form>
    </main>
  );
};

export default Login;
