import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight">
          Гранд Партнер АС — Логистика
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>
            Почетна
          </NavLink>
          <NavLink to="/dispecer" className={navLinkClass}>
            Диспечер
          </NavLink>
          <NavLink to="/vozac" className={navLinkClass}>
            Возач
          </NavLink>
          <NavLink to="/ruti" className={navLinkClass}>
            Рути
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/najava">Најава</Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link to="/dispecer">Отвори панел</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
