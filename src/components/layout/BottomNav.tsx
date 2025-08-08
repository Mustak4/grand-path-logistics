import { NavLink } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNav = () => {
  const isMobile = useIsMobile();
  const { isDriver } = useAuth();

  if (!isMobile || !isDriver) return null;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex-1 grid place-items-center text-sm py-2 ${
      isActive ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-xl flex">
        <NavLink to="/vozac" end className={linkCls}>
          Мојата тура
        </NavLink>
      </div>
    </nav>
  );
};
