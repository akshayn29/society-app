import { useState } from "react";
import { useInvites } from "../hooks/useInvites";
import { useAuth } from "../context/AuthContext";
import { Plus, X, Copy, Check, CheckCircle, XCircle, Clock, Mail, UserCheck } from "lucide-react";
import emailjs from "@emailjs/browser";

emailjs.init("4P9cukBqhfMvQ4uKY");

const EMAILJS_SERVICE_ID  = "service_da1nguc";
const EMAILJS_TEMPLATE_ID = "template_txo6p2d";

export default function InviteTab({ inviteRole }) {
  const { userProfile } = useAuth();
  const { invites, pendingApprovals, loading, createInvite, approveUser, rejectUser } = useInvites();
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");
  const [copiedId, setCopiedId]     = useState(null);
  const [form, setForm] = useState({ email: "", flatNumber: "" });

  const roleLabel = inviteRole === "owner" ? "Owner" : "Tenant";

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!form.email || !form.flatNumber) {
      setError("Email and flat number are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { token } = await createInvite({
        email: form.email,
        flatNumber: form.flatNumber.toUpperCase(),
        role: inviteRole,
      });

      const inviteLink = `${window.location.origin}/invite?token=${token}`;

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:    form.email,
          to_flat:     form.flatNumber.toUpperCase(),
          from_name:   userProfile.name,
          society:     userProfile.societyName || userProfile.societyCode,
          role:        roleLabel,
          invite_link: inviteLink,
        }
      );

      console.log("EmailJS result:", result);
      setForm({ email: "", flatNumber: "" });
      setShowForm(false);
      setSuccess(`Invite sent to ${form.email}!`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("EmailJS Error:", err);
      setError(`Failed: ${err?.text || err?.message || JSON.stringify(err)}`);
    }
    setSubmitting(false);
  };

  const copyLink = async (token, id) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status) => {
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "expired")  return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-6">

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <h4 className="font-display font-semibold text-slate-900">Pending Approvals</h4>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {pendingApprovals.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((u) => (
              <div key={u.id} className="card border-2 border-amber-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {u.name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">Flat {u.flatNumber} · {u.email} · <span className="capitalize">{u.role}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveUser(u.id)} title="Approve"
                    className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-all">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => rejectUser(u.id)} title="Reject"
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-all">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Invite */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            <h4 className="font-display font-semibold text-slate-900">Invite {roleLabel}</h4>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : `Invite ${roleLabel}`}
          </button>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">✓ {success}</div>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">⚠ {error}</div>}

        {showForm && (
          <div className="card border-2 border-primary-100">
            <form onSubmit={handleSendInvite} className="space-y-3">
              <input type="text" placeholder="Flat Number e.g. A-201 *" required
                value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 uppercase" />
              <input type="email" placeholder={`${roleLabel}'s Email *`} required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
              <p className="text-xs text-slate-400 px-1">
                An invite link valid for 7 days will be emailed. You can also copy the link manually after sending.
              </p>
              <button type="submit" disabled={submitting}
                className="w-full btn-primary flex items-center justify-center gap-2">
                {submitting
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Mail className="w-4 h-4" />Send Invite Email</>}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Sent Invites list */}
      <div className="space-y-3">
        <h4 className="font-display font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Sent Invites
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {invites.filter(i => i.role === inviteRole).length}
          </span>
        </h4>
        {loading ? (
          <div className="card text-center py-8 text-slate-400">Loading...</div>
        ) : invites.filter(i => i.role === inviteRole).length === 0 ? (
          <div className="card text-center py-10">
            <div className="text-3xl mb-2">📨</div>
            <p className="text-slate-500 text-sm">No invites sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invites.filter(i => i.role === inviteRole).map((inv) => (
              <div key={inv.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {inv.flatNumber?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">Flat {inv.flatNumber}</div>
                  <div className="text-xs text-slate-500 truncate">{inv.email}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge(inv.status)}`}>
                  {inv.status}
                </span>
                {inv.status === "pending" && (
                  <button onClick={() => copyLink(inv.token, inv.id)} title="Copy invite link"
                    className="p-2 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-all">
                    {copiedId === inv.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
