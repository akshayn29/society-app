import { useState, useMemo } from "react";
import { Users, Search, Mail, Phone, Home, Shield, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import useMembers from "../hooks/useMembers";

const ROLE_STYLES = {
  admin:  { badge: "bg-blue-100 text-blue-700",    avatar: "from-blue-400 to-blue-600" },
  owner:  { badge: "bg-green-100 text-green-700",  avatar: "from-green-400 to-green-600" },
  tenant: { badge: "bg-purple-100 text-purple-700", avatar: "from-purple-400 to-purple-600" },
  guard:  { badge: "bg-amber-100 text-amber-700",  avatar: "from-amber-400 to-amber-600" },
};

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-700",
  pending:  "bg-amber-100 text-amber-700",
  denied:   "bg-red-100 text-red-700",
};

function MemberRow({ member }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const role = member.role?.toLowerCase() || "owner";
  const styles = ROLE_STYLES[role] || ROLE_STYLES.owner;
  const initials = member.name ? member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const flatLabel = [member.wing, member.flatNumber].filter(Boolean).join("-") || "—";

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", member.id), { status });
    } catch (err) { console.error(err); }
    setUpdating(false);
  };

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
        <div className={"w-10 h-10 bg-gradient-to-br " + styles.avatar + " rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm truncate">{member.name || "—"}</span>
            <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + styles.badge}>{member.role || "—"}</span>
            {member.status && (
              <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (STATUS_STYLES[member.status] || "bg-slate-100 text-slate-500")}>
                {member.status}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Flat {flatLabel} · {member.societyName || "—"}</div>
        </div>

        {/* Approve / Deny buttons — only show if pending */}
        {member.status === "pending" && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {updating ? (
              <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div
                  onClick={() => updateStatus("approved")}
                  title="Approve"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer select-none font-medium transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </div>
                <div
                  onClick={() => updateStatus("denied")}
                  title="Deny"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer select-none font-medium transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Deny
                </div>
              </>
            )}
          </div>
        )}

        {/* Re-open denied — reset to pending */}
        {member.status === "approved" && (
          <div
            onClick={() => updateStatus("pending")}
            title="Revoke approval"
            className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer select-none font-medium transition-colors flex-shrink-0"
          >
            Revoke
          </div>
        )}

        <div onClick={() => setExpanded((v) => !v)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100 grid sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /><span className="truncate">{member.email || "—"}</span></div>
          <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{member.phone || "—"}</span></div>
          <div className="flex items-center gap-2 text-slate-600"><Home className="w-3.5 h-3.5 text-slate-400" /><span>Wing: {member.wing || "—"} · Flat: {member.flatNumber || "—"}</span></div>
          <div className="flex items-center gap-2 text-slate-600"><Shield className="w-3.5 h-3.5 text-slate-400" /><span>Gate: {member.gateNumber || "—"}</span></div>
          {member.societyAddress && <div className="sm:col-span-2 text-xs text-slate-400">{member.societyAddress}</div>}
        </div>
      )}
    </div>
  );
}

export default function AdminMembersTab() {
  const { members, loading } = useMembers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = useMemo(() => ({
    all: members.length,
    owner: members.filter((m) => m.role?.toLowerCase() === "owner").length,
    tenant: members.filter((m) => m.role?.toLowerCase() === "tenant").length,
    admin: members.filter((m) => m.role?.toLowerCase() === "admin").length,
    guard: members.filter((m) => m.role?.toLowerCase() === "guard").length,
  }), [members]);

  const filtered = useMemo(() => members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name?.toLowerCase().includes(q) || m.flatNumber?.toLowerCase().includes(q) || m.wing?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.includes(q);
    const matchRole = roleFilter === "all" || m.role?.toLowerCase() === roleFilter;
    const matchStatus = statusFilter === "all" || m.status?.toLowerCase() === statusFilter;
    return matchSearch && matchRole && matchStatus;
  }), [members, search, roleFilter, statusFilter]);

  const pendingCount = members.filter(m => m.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Users className="w-5 h-5 text-primary-600" />
        <h2 className="font-display font-bold text-lg text-slate-900">All Members</h2>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{members.length} total</span>
        {pendingCount > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{pendingCount} pending approval</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Owners",  count: counts.owner,  color: "bg-green-50 text-green-700 border-green-100" },
          { label: "Tenants", count: counts.tenant, color: "bg-purple-50 text-purple-700 border-purple-100" },
          { label: "Admins",  count: counts.admin,  color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "Guards",  count: counts.guard,  color: "bg-amber-50 text-amber-700 border-amber-100" },
        ].map((s) => (
          <div key={s.label} className={"rounded-xl border px-4 py-3 " + s.color}>
            <div className="font-display font-bold text-2xl">{s.count}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, flat, wing, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All (" + counts.all + ")" },
            { value: "owner", label: "Owners (" + counts.owner + ")" },
            { value: "tenant", label: "Tenants (" + counts.tenant + ")" },
            { value: "admin", label: "Admins (" + counts.admin + ")" },
            { value: "guard", label: "Guards (" + counts.guard + ")" },
          ].map((f) => (
            <div key={f.value} onClick={() => setRoleFilter(f.value)}
              className={"text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer select-none " + (roleFilter === f.value ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
              {f.label}
            </div>
          ))}
          {["all", "approved", "pending", "denied"].map((s) => (
            <div key={s} onClick={() => setStatusFilter(s)}
              className={"text-xs px-3 py-1.5 rounded-full border font-medium capitalize cursor-pointer select-none " + (statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
              {s === "all" ? "Any status" : s}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="card text-center py-12 text-slate-400">Loading members...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12"><Users className="w-10 h-10 text-slate-200 mx-auto mb-2" /><p className="text-slate-400 text-sm">No members found.</p></div>
        ) : (
          <>
            <p className="text-xs text-slate-400 px-1">Showing {filtered.length} of {members.length} members</p>
            {filtered.map((m) => <MemberRow key={m.id} member={m} />)}
          </>
        )}
      </div>
    </div>
  );
}
