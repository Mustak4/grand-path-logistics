import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import DriverToday from "./pages/DriverToday";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { BottomNav } from "./components/layout/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/najava" element={<Login />} />

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
              path="/produkti"
              element={
                <ProtectedRoute allowRoles={["dispecer"]}>
                  <Products />
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
              path="/vozac"
              element={
                <ProtectedRoute allowRoles={["vozac"]}>
                  <DriverToday />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
