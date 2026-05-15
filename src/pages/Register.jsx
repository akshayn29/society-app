import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight, Check, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const fieldLabels = {
  societyName:    { label: "Society Name",    placeholder: "e.g. Green Valley CHS" },
  societyAddress: { label: "Society Address", placeholder: "Full address of society" },
  totalFlats:     { label: "Total Flats",     placeholder: "e.g. 200" },
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep]               = useState(2); // skip role selection, go straight to form
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    societyName: "", societyAddress: "", totalFlats: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.societyName || !form.societyAddress || !form.totalFlats) {
      setError("Please fill in all society details.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, {
        name:           form.name,
        phone:          form.phone,
        role:           "admin",
        status:         "active",
        societyName:    form.societyName,
        societyAddress: form.societyAddress,
        totalFlats:     form.totalFlats,
      });
      setStep(3);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("This email is already registered.");
      else if (err.code === "auth/weak-password")   setError("Password must be at least 6 characters.");
      else if (err.code === "auth/invalid-email")   setError("Please enter a valid email address.");
      else setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  // Step 3 - Success
  if (step === 3) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Society Registered!</h2>
            <p className="text-slate-500 mb-2">
              Your society is set up. You can now login and invite owners and guards.
            </p>
            <p className="text-sm text-slate-400 mb-8">Registered as <strong>{form.email}</strong></p>
            <button onClick={() => navigate("/login")} className="btn-primary w-full flex items-center justify-center gap-2">
              Go to Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 - Admin Registration Form
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

          {/* Role badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-4">
            <Building2 className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Society Admin</span>
          </div>

          <h1 className="font-display font-bold text-3xl text-slate-900">Register Your Society</h1>
          <p className="text-slate-500 text-sm mt-2">
            Owners and tenants will be invited by you after setup.
          </p>
        </div>

        <div className="card shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Personal Details */}
            <div className="pb-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Your Details</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input type="text" placeholder="Your full name"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                  <input type="email" placeholder="you@example.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
                  <input type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Society Details */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Society Details</p>
              <div className="space-y-3">
                {["societyName", "societyAddress", "totalFlats"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{fieldLabels[field].label} *</label>
                    <input type={field === "totalFlats" ? "number" : "text"}
                      placeholder={fieldLabels[field].placeholder}
                      value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Register Society <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 text-center">
              Owners, tenants and guards will receive invite links from you after you log in.
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
