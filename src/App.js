import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import GuardDashboard from "./pages/GuardDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const APP_NAME = "SocietyApp";

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar appName={APP_NAME} />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer appName={APP_NAME} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/guard-dashboard" element={
            <ProtectedRoute allowedRoles={["guard"]}>
              <GuardDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner-dashboard" element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tenant-dashboard" element={
            <ProtectedRoute allowedRoles={["tenant"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={
            <div className="min-h-screen hero-pattern flex items-center justify-center">
              <div className="card text-center py-16 max-w-md">
                <div className="text-5xl mb-4">🚫</div>
                <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Access Denied</h2>
                <p className="text-slate-500 mb-6">You don't have permission to view this page.</p>
                <a href="/login" className="btn-primary">Go to Login</a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
