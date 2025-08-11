import { NavLink } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Truck, 
  MapPin, 
  User,
  Route
} from "lucide-react";

export const BottomNav = () => {
  const isMobile = useIsMobile();
  const { isDriver, user } = useAuth();

  // Only show for mobile drivers
  if (!isMobile || !isDriver || !user) return null;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `mobile-nav-item ${isActive ? "active" : ""}`;

  const iconCls = ({ isActive }: { isActive: boolean }) =>
    `mobile-nav-icon ${isActive ? "text-primary" : "text-muted-foreground"}`;

  return (
    <nav className="mobile-nav">
      <div className="mobile-container">
        <div className="flex justify-around">
          <NavLink to="/vozac" className={linkCls}>
            {({ isActive }) => (
              <>
                <Truck className={iconCls({ isActive })} />
                <span className="mobile-nav-text">Денешна тура</span>
              </>
            )}
          </NavLink>
          
          <NavLink to="/vozac/ruti" className={linkCls}>
            {({ isActive }) => (
              <>
                <Route className={iconCls({ isActive })} />
                <span className="mobile-nav-text">Мои рути</span>
              </>
            )}
          </NavLink>
          
          <NavLink to="/vozac/map" className={linkCls}>
            {({ isActive }) => (
              <>
                <MapPin className={iconCls({ isActive })} />
                <span className="mobile-nav-text">Мапа</span>
              </>
            )}
          </NavLink>
          
          <NavLink to="/vozac/profile" className={linkCls}>
            {({ isActive }) => (
              <>
                <User className={iconCls({ isActive })} />
                <span className="mobile-nav-text">Профил</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
