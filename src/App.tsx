import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import DriverToday from "./pages/DriverToday";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import RoutePrint from "./pages/RoutePrint";
import Login from "./pages/Login";
import DriverMap from "./pages/DriverMap";
import DriverProfile from "./pages/DriverProfile";
import DriverRoutes from "./pages/DriverRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { BottomNav } from "./components/layout/BottomNav";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Component to handle default routing based on user role
const DefaultRoute = () => {
  const { user, isDispatcher, isDriver } = useAuth();
  
  if (!user) {
    return <Navigate to="/najava" replace />;
  }
  
  if (isDispatcher) {
    return <Navigate to="/dispecer" replace />;
  }
  
  if (isDriver) {
    return <Navigate to="/vozac" replace />;
  }
  
  return <Navigate to="/najava" replace />;
};



const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <div className="pt-0 md:pt-16">
              <Routes>
                <Route path="/" element={<DefaultRoute />} />
                <Route path="/najava" element={<Login />} />

                {/* Dispatcher Routes */}
                <Route
                  path="/dispecer"
                  element={
                    <ProtectedRoute allowRoles={["dispecer"]}>
                      <DispatcherDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/klienti"
                  element={
                    <ProtectedRoute allowRoles={["dispecer"]}>
                      <Clients />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/naracki"
                  element={
                    <ProtectedRoute allowRoles={["dispecer"]}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ruti"
                  element={
                    <ProtectedRoute allowRoles={["dispecer"]}>
                      <RoutesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ruti/:id"
                  element={
                    <ProtectedRoute allowRoles={["dispecer"]}>
                      <RouteDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ruti/:id/pecati"
                  element={
                    <ProtectedRoute allowRoles={["dispecer"]}>
                      <RoutePrint />
                    </ProtectedRoute>
                  }
                />

                {/* Driver Routes */}
                <Route
                  path="/vozac"
                  element={
                    <ProtectedRoute allowRoles={["vozac"]}>
                      <DriverToday />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vozac/map"
                  element={
                    <ProtectedRoute allowRoles={["vozac"]}>
                      <DriverMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vozac/profile"
                  element={
                    <ProtectedRoute allowRoles={["vozac"]}>
                      <DriverProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vozac/ruti"
                  element={
                    <ProtectedRoute allowRoles={["vozac"]}>
                      <DriverRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <BottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
