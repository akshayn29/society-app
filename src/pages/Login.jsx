import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, fetchUserProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      const profile = result.profile || await fetchUserProfile(result.user.uid);
      if (profile?.role === "superadmin")       navigate("/super-admin");
      else if (profile?.role === "admin")       navigate("/admin-dashboard");
      else if (profile?.role === "owner")       navigate("/owner-dashboard");
      else if (profile?.role === "tenant")      navigate("/tenant-dashboard");
      else if (profile?.role === "guard")       navigate("/guard-dashboard");
      else setError("Role not found. Please contact admin.");
    } catch (err) {
      if (err.code === "auth/user-not-found")        setError("No account found with this email.");
      else if (err.code === "auth/wrong-password")   setError("Incorrect password.");
      else if (err.code === "auth/invalid-email")    setError("Please enter a valid email.");
      else if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
      else setError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen hero-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">SocietyApp</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        <div className="card shadow-xl border border-slate-100">

          <div className="mb-6 p-3 bg-primary-50 border border-primary-100 rounded-xl">
            <p className="text-sm text-primary-700 text-center">
              Your role is detected automatically after login
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 SocietyApp · Made with ❤️ in India
        </p>
      </div>
    </div>
  );
}

