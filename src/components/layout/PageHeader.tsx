import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  customBackPath?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  customBackPath,
  children 
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDispatcher, isDriver } = useAuth();

  const handleBack = () => {
    if (customBackPath) {
      navigate(customBackPath);
    } else {
      // Smart back navigation based on current route and user role
      const currentPath = location.pathname;
      
      if (currentPath.includes('/ruti/') && currentPath !== '/ruti') {
        // Route detail page -> back to routes list
        navigate('/ruti');
      } else if (currentPath.startsWith('/vozac') && currentPath !== '/vozac') {
        // Driver sub-pages -> back to main driver page
        navigate('/vozac');
      } else {
        // Default: go back to dashboard
        if (isDispatcher) {
          navigate('/dispecer');
        } else if (isDriver) {
          navigate('/vozac');
        } else {
          navigate('/');
        }
      }
    }
  };

  const handleHome = () => {
    if (isDispatcher) {
      navigate('/dispecer');
    } else if (isDriver) {
      navigate('/vozac');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="mobile-container md:desktop-container">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 flex-1">
            {showBackButton && (
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mobile-button text-muted-foreground hover:text-foreground h-8 px-2 md:h-9 md:px-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Назад</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHome}
                  className="mobile-button text-muted-foreground hover:text-foreground h-8 px-2 md:h-9 md:px-3"
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Почетна</span>
                </Button>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-1 md:gap-2 ml-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
