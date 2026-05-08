import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roles = [
  { id: "admin",  label: "Society Admin", emoji: "🏢", desc: "Register and manage your entire society",    fields: ["societyName", "societyAddress", "totalFlats"] },
  { id: "owner",  label: "Flat Owner",    emoji: "🏠", desc: "Manage your flat, tenants and vehicles",     fields: ["societyCode", "flatNumber", "wing"] },
  { id: "tenant", label: "Tenant",        emoji: "👤", desc: "Access added by your flat owner",            fields: ["societyCode", "flatNumber"] },
  { id: "guard",  label: "Security Guard",emoji: "🛡️", desc: "Manage gate entry and visitor approvals",   fields: ["societyCode", "gateNumber"] },
];

const fieldLabels = {
  societyName:    { label: "Society Name",    placeholder: "e.g. Green Valley CHS" },
  societyAddress: { label: "Society Address", placeholder: "Full address of society" },
  totalFlats:     { label: "Total Flats",     placeholder: "e.g. 200" },
  societyCode:    { label: "Society Code",    placeholder: "Get this from your admin" },
  flatNumber:     { label: "Flat Number",     placeholder: "e.g. A-201" },
  wing:           { label: "Wing / Block",    placeholder: "e.g. A, B, C" },
  gateNumber:     { label: "Gate",            placeholder: "e.g. Main Gate" },
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    societyName: "", societyAddress: "", totalFlats: "",
    societyCode: "", flatNumber: "", wing: "", gateNumber: "",
  });

  const role = roles.find((r) => r.id === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, {
        name: form.name,
        phone: form.phone,
        role: selectedRole,
        societyName:    form.societyName,
        societyAddress: form.societyAddress,
        totalFlats:     form.totalFlats,
        societyCode:    form.societyCode,
        flatNumber:     form.flatNumber,
        wing:           form.wing,
        gateNumber:     form.gateNumber,
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

  // Step 1 - Role Selection
  if (step === 1) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-slate-900">SocietyApp</span>
            </Link>
            <h1 className="font-display font-bold text-3xl text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-2">Who are you registering as?</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {roles.map((r) => (
              <button key={r.id} onClick={() => { setSelectedRole(r.id); setStep(2); }}
                className="card text-left hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-2 border-slate-100 hover:border-primary-200">
                <div className="text-4xl mb-3">{r.emoji}</div>
                <h3 className="font-display font-bold text-slate-900 mb-1">{r.label}</h3>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 3 - Success
  if (step === 3) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Registration Successful!</h2>
            <p className="text-slate-500 mb-2">
              {selectedRole === "admin"
                ? "Your society is registered! You can now login and set up your society."
                : "Your account is created and pending approval from your society admin."}
            </p>
            <p className="text-sm text-slate-400 mb-8">Confirmation sent to <strong>{form.email}</strong></p>
            <button onClick={() => navigate("/login")} className="btn-primary w-full flex items-center justify-center gap-2">
              Go to Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 - Form
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
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-4">
            <span className="text-lg">{role?.emoji}</span>
            <span className="text-sm font-semibold text-primary-700">{role?.label}</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Create Account</h1>
        </div>

        <div className="card shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {role?.fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{fieldLabels[field].label} *</label>
                <input type={field === "totalFlats" ? "number" : "text"}
                  placeholder={fieldLabels[field].placeholder}
                  value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex items-center gap-2 py-3 px-4">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
