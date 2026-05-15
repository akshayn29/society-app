import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function InviteRegister() {
  const [searchParams] = useSearchParams();
  const _navigate = useNavigate();
  const { register } = useAuth();
  const token = searchParams.get("token");

  const [invite, setInvite]           = useState(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });

  // Validate invite token
  useEffect(() => {
    if (!token) { setInviteError("Invalid invite link."); setInviteLoading(false); return; }
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "invites"), where("token", "==", token))
        );
        if (snap.empty) { setInviteError("Invite link not found or already used."); setInviteLoading(false); return; }
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (data.status !== "pending") { setInviteError("This invite link has already been used."); setInviteLoading(false); return; }
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        if (expiresAt < new Date()) { setInviteError("This invite link has expired. Please contact your admin."); setInviteLoading(false); return; }
        setInvite(data);
      } catch (e) { setInviteError("Failed to validate invite. Please try again."); }
      setInviteLoading(false);
    })();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.password) { setError("Please fill all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(invite.email, form.password, {
        name:        form.name,
        phone:       form.phone,
        role:        invite.role,
        societyCode: invite.societyCode,
        societyName: invite.societyName || "",
        flatNumber:  invite.flatNumber,
        status:      "pending",          // needs approval
        approverUid: invite.invitedBy,   // admin or owner who invited
        inviteToken: token,
      });
      // Mark invite as accepted
      await updateDoc(doc(db, "invites", invite.id), { status: "accepted" });
      setSuccess(true);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("This email is already registered. Please login instead.");
      else setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  // ── Loading invite ──
  if (inviteLoading) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // ── Invalid invite ──
  if (inviteError) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900 mb-2">Invalid Invite</h2>
          <p className="text-slate-500 mb-6">{inviteError}</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">Go to Login</Link>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 mb-2">
            Your account is pending approval from <strong>{invite.invitedByName}</strong>.
          </p>
          <p className="text-sm text-slate-400 mb-8">You'll be able to login once approved.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Registration form ──
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

          {/* Invite info banner */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl px-5 py-4 mb-4 text-left">
            <p className="text-xs text-primary-500 font-semibold uppercase tracking-wide mb-1">You're invited!</p>
            <p className="text-sm text-slate-700">
              <strong>{invite.invitedByName}</strong> has invited you to join{" "}
              <strong>{invite.societyName || invite.societyCode}</strong> as a{" "}
              <span className="capitalize font-semibold text-primary-700">{invite.role}</span> for{" "}
              <strong>Flat {invite.flatNumber}</strong>.
            </p>
          </div>

          <h1 className="font-display font-bold text-3xl text-slate-900">Complete Registration</h1>
          <p className="text-slate-400 text-sm mt-1">{invite.email}</p>
        </div>

        <div className="card shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
              <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email <span className="text-slate-400 font-normal">(pre-filled from invite)</span>
              </label>
              <input type="email" value={invite.email} disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed" />
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

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
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
