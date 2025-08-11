import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;

const Header = () => {
  const { user, isDispatcher, signOut } = useAuth();
  
  // Only show header for dispatchers
  if (!isDispatcher) return null;
  
  return (
    <header className="app-header hidden md:block">
      <div className="desktop-container flex h-16 items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Гранд Партнер АС — Логистика
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/dispecer" className={navLinkClass}>Диспечер</NavLink>
          <NavLink to="/klienti" className={navLinkClass}>Клиенти</NavLink>
          <NavLink to="/naracki" className={navLinkClass}>Нарачки</NavLink>
          <NavLink to="/ruti" className={navLinkClass}>Рути</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {!user ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/najava">Најава</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={signOut}>Одјава</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
