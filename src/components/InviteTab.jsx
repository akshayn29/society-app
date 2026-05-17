import { useState } from "react";
import { useInvites } from "../hooks/useInvites";
import { useAuth } from "../context/AuthContext";
import { Plus, X, Copy, Check, CheckCircle, XCircle, Clock, Mail, UserCheck, Trash2, BanIcon, CalendarClock } from "lucide-react";
import emailjs from "@emailjs/browser";

emailjs.init("4P9cukBqhfMvQ4uKY");

const EMAILJS_SERVICE_ID  = "service_da1nguc";
const EMAILJS_TEMPLATE_ID = "template_txo6p2d";

export default function InviteTab({ inviteRole }) {
  const { userProfile } = useAuth();
  const { invites, pendingApprovals, loading, createInvite, approveUser, rejectUser, deleteInvite, deactivateInvite } = useInvites();

  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState("");
  const [error, setError]               = useState("");
  const [copiedId, setCopiedId]         = useState(null);
  const [form, setForm]                 = useState({ email: "", flatNumber: "", leaseExpiry: "" });
  const [deactivateId, setDeactivateId] = useState(null);
  const [comment, setComment]           = useState("");
  const [deletingId, setDeletingId]     = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const roleLabel = inviteRole === "owner" ? "Owner" : "Tenant";
  const today = new Date().toISOString().split("T")[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!form.email || !form.flatNumber) { setError("Email and flat number are required."); return; }
    setSubmitting(true); setError("");
    try {
      const { token } = await createInvite({
        email:       form.email,
        flatNumber:  form.flatNumber.toUpperCase(),
        role:        inviteRole,
        leaseExpiry: form.leaseExpiry || null,
      });
      const inviteLink = window.location.origin + "/invite?token=" + token;
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:     form.email,
        to_flat:      form.flatNumber.toUpperCase(),
        from_name:    userProfile.name,
        society:      userProfile.societyName || userProfile.societyCode,
        role:         roleLabel,
        invite_link:  inviteLink,
        lease_expiry: form.leaseExpiry ? formatDate(form.leaseExpiry) : "Open-ended",
      });
      setForm({ email: "", flatNumber: "", leaseExpiry: "" });
      setShowForm(false);
      setSuccess("Invite sent to " + form.email + "!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("Failed: " + (err?.text || err?.message || JSON.stringify(err)));
    }
    setSubmitting(false);
  };

  const copyLink = async (token, id) => {
    const link = window.location.origin + "/invite?token=" + token;
    await navigator.clipboard.writeText(link);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pending invite? This cannot be undone.")) return;
    setDeletingId(id);
    try { await deleteInvite(id); setSuccess("Invite deleted."); setTimeout(() => setSuccess(""), 3000); }
    catch (err) { setError("Failed to delete."); }
    setDeletingId(null);
  };

  const handleDeactivate = async () => {
    if (!comment.trim()) { setError("Please add a comment before deactivating."); return; }
    setDeactivating(true);
    try {
      await deactivateInvite(deactivateId, comment.trim());
      setSuccess("Invite deactivated."); setTimeout(() => setSuccess(""), 3000);
      setDeactivateId(null); setComment("");
    } catch (err) { setError("Failed to deactivate."); }
    setDeactivating(false);
  };

  const statusBadge = (status) => {
    if (status === "accepted")  return "bg-green-100 text-green-700";
    if (status === "expired")   return "bg-red-100 text-red-700";
    if (status === "inactive")  return "bg-slate-100 text-slate-500";
    return "bg-amber-100 text-amber-700";
  };

  const expiryBadge = (inv) => {
    const expDate = inv.leaseExpiry?.toDate?.() ?? (inv.leaseExpiry ? new Date(inv.leaseExpiry) : null);
    if (!expDate) return null;
    const isExpired = expDate < new Date();
    const label = expDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return (
      <span className={"flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit " + (isExpired ? "bg-red-100 text-red-700" : "bg-teal-50 text-teal-700")}>
        <CalendarClock className="w-3 h-3" />
        {isExpired ? "Expired " : "Until "}{label}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <h4 className="font-display font-semibold text-slate-900">Pending Approvals</h4>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{pendingApprovals.length}</span>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((u) => (
              <div key={u.id} className="card border-2 border-amber-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {u.name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">Flat {u.flatNumber} Â· {u.email} Â· <span className="capitalize">{u.role}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveUser(u.id)} className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-all"><CheckCircle className="w-5 h-5" /></button>
                  <button onClick={() => rejectUser(u.id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-all"><XCircle className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            <h4 className="font-display font-semibold text-slate-900">Invite {roleLabel}</h4>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Invite " + roleLabel}
          </button>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">âœ“ {success}</div>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">âš  {error}</div>}

        {showForm && (
          <div className="card border-2 border-primary-100">
            <form onSubmit={handleSendInvite} className="space-y-3">
              <input type="text" placeholder="Flat Number e.g. A-201 *" required value={form.flatNumber}
                onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 uppercase" />
              <input type="email" placeholder={roleLabel + "'s Email *"} required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
              {inviteRole === "tenant" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Lease Expiry Date
                    <span className="ml-1 font-normal text-slate-400">(optional â€” leave blank for open-ended)</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.leaseExpiry}
                    onChange={(e) => setForm({ ...form, leaseExpiry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800"
                  />
                  {form.leaseExpiry && (
                    <p className="text-xs text-teal-600 mt-1 px-1">
                      Tenant credentials will be marked expired after {formatDate(form.leaseExpiry)}
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-400 px-1">Invite link valid for 7 days. You can also copy the link manually after sending.</p>
              <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail className="w-4 h-4" />Send Invite Email</>}
              </button>
            </form>
          </div>
        )}
      </div>

      {deactivateId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display font-bold text-slate-900">Deactivate Invite</h4>
            <p className="text-sm text-slate-500">This invite is accepted and cannot be deleted. Add a comment to mark it inactive â€” this keeps a history record.</p>
            <textarea rows={3} placeholder="Reason for deactivation e.g. Tenant vacated, lease ended..."
              value={comment} onChange={e => setComment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 text-sm resize-none" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <div onClick={() => { setDeactivateId(null); setComment(""); setError(""); }}
                className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 select-none">
                Cancel
              </div>
              <div onClick={handleDeactivate}
                className={"flex-1 text-center py-2.5 rounded-xl text-sm font-medium cursor-pointer select-none transition-colors " + (deactivating ? "bg-slate-200 text-slate-400" : "bg-red-500 text-white hover:bg-red-600")}>
                {deactivating ? "Saving..." : "Deactivate"}
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="card text-center py-10"><div className="text-3xl mb-2">ðŸ“¨</div><p className="text-slate-500 text-sm">No invites sent yet.</p></div>
        ) : (
          <div className="space-y-2">
            {invites.filter(i => i.role === inviteRole).map((inv) => (
              <div key={inv.id} className={"card flex items-center gap-3 " + (inv.status === "inactive" ? "opacity-60" : "")}>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {inv.flatNumber?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">Flat {inv.flatNumber}</div>
                  <div className="text-xs text-slate-500 truncate">{inv.email}</div>
                  {inviteRole === "tenant" && <div className="mt-1">{expiryBadge(inv)}</div>}
                  {inv.status === "inactive" && inv.deactivationComment && (
                    <div className="text-xs text-slate-400 mt-0.5 italic">"{inv.deactivationComment}"</div>
                  )}
                </div>
                <span className={"text-xs font-medium px-2 py-0.5 rounded-full capitalize " + statusBadge(inv.status)}>
                  {inv.status}
                </span>
                {inv.status === "pending" && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div onClick={() => copyLink(inv.token, inv.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-all cursor-pointer">
                      {copiedId === inv.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </div>
                    <div onClick={() => handleDelete(inv.id)}
                      className={"p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-all cursor-pointer " + (deletingId === inv.id ? "opacity-50 pointer-events-none" : "")}>
                      <Trash2 className="w-4 h-4" />
                    </div>
                  </div>
                )}
                {inv.status === "accepted" && (
                  <div onClick={() => { setDeactivateId(inv.id); setError(""); }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer flex-shrink-0"
                    title="Deactivate with comment">
                    <BanIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
