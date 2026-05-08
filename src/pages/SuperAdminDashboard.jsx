import {
  Shield, Users, Building2, Calendar, Bell,
  LogOut, Menu, TrendingUp, CheckCircle,
  XCircle, Eye, X
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSuperAdmin } from "../hooks/useSuperAdmin";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { societies, allUsers, allEntries, allBookings, loading, stats, toggleSocietyStatus } = useSuperAdmin();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [toggling, setToggling] = useState(null);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleToggle = async (uid, status) => {
    setToggling(uid);
    try { await toggleSocietyStatus(uid, status); }
    catch (err) { console.error(err); }
    setToggling(null);
  };

  const navItems = [
    { id: "overview",   label: "Overview",     icon: TrendingUp },
    { id: "societies",  label: "All Societies", icon: Building2 },
    { id: "members",    label: "All Members",   icon: Users },
    { id: "entries",    label: "All Entries",   icon: CheckCircle },
    { id: "bookings",   label: "All Bookings",  icon: Calendar },
  ];

  const getMembersForSociety = (societyName) =>
    allUsers.filter(u => u.societyName === societyName || u.societyCode === societyName);

  const getEntriesForSociety = (societyName) =>
    allEntries.filter(e => e.societyCode === societyName);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-white">Super Admin</div>
              <div className="text-xs text-slate-400">Platform Control</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => { const Icon = item.icon; return (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id
                  ? "bg-accent-500 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <Icon className="w-4 h-4" />{item.label}
            </button>
          );})}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userProfile?.name?.[0] || "S"}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{userProfile?.name}</div>
              <div className="text-xs text-slate-400">Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 px-2 py-1.5">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-900 capitalize">{activeTab}</h1>
              <p className="text-xs text-slate-400">Platform Overview · {new Date().toDateString()}</p>
            </div>
          </div>
          <button className="relative p-2 rounded-xl hover:bg-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        <main className="p-6">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Total Societies",  value: stats.totalSocieties,  icon: Building2,  color: "bg-blue-50 text-blue-600",   change: `${stats.activeSocieties} active` },
                  { label: "Total Members",    value: stats.totalMembers,    icon: Users,      color: "bg-green-50 text-green-600", change: "Owners + Tenants" },
                  { label: "Security Guards",  value: stats.totalGuards,     icon: Shield,     color: "bg-purple-50 text-purple-600", change: "Across all societies" },
                  { label: "Total Entries",    value: stats.totalEntries,    icon: CheckCircle,color: "bg-amber-50 text-amber-600", change: "All time" },
                  { label: "Total Bookings",   value: stats.totalBookings,   icon: Calendar,   color: "bg-teal-50 text-teal-600",   change: "Facility bookings" },
                  { label: "Platform Users",   value: allUsers.length,       icon: Users,      color: "bg-rose-50 text-rose-600",   change: "All roles" },
                ].map((s) => { const Icon = s.icon; return (
                  <div key={s.label} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-slate-400">{s.change}</span>
                    </div>
                    <div className="font-display font-bold text-3xl text-slate-900">{s.value}</div>
                    <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                  </div>
                );})}
              </div>

              {/* Recent Societies */}
              <div className="card">
                <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Recently Registered Societies</h2>
                {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> :
                 societies.length === 0 ? <div className="text-center py-8 text-slate-400">No societies yet.</div> :
                 <div className="space-y-3">
                  {societies.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                        {s.name?.[0] || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.totalFlats} flats · Admin: {s.adminName}</div>
                      </div>
                      <span className={`badge text-xs ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                 </div>}
              </div>
            </div>
          )}

          {/* SOCIETIES */}
          {activeTab === "societies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-slate-900">All Societies ({societies.length})</h2>
              </div>

              {loading ? <div className="card text-center py-12 text-slate-400">Loading...</div> :
               societies.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-2">🏢</div>
                  <p className="text-slate-500">No societies registered yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {societies.map((s) => (
                    <div key={s.id} className={`card border-2 ${s.status === "active" ? "border-slate-100" : "border-red-100 bg-red-50/20"}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0">
                          {s.name?.[0] || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-slate-900">{s.name}</span>
                            <span className={`badge text-xs ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {s.status}
                            </span>
                          </div>
                          {s.address && <div className="text-sm text-slate-500 mt-0.5">📍 {s.address}</div>}
                          <div className="text-sm text-slate-500">🏠 {s.totalFlats} flats · Admin: {s.adminName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">📞 {s.adminPhone} · ✉️ {s.adminEmail}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Registered: {s.createdAt}</div>

                          {/* Society Stats */}
                          <div className="flex gap-4 mt-3">
                            {[
                              { label: "Members", value: getMembersForSociety(s.name).length },
                              { label: "Entries",  value: getEntriesForSociety(s.name).length },
                            ].map((stat) => (
                              <div key={stat.label} className="text-center">
                                <div className="font-display font-bold text-lg text-slate-900">{stat.value}</div>
                                <div className="text-xs text-slate-400">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedSociety(selectedSociety?.id === s.id ? null : s)}
                            className="p-2 hover:bg-primary-50 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            disabled={toggling === s.uid}
                            onClick={() => handleToggle(s.uid, s.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              s.status === "active"
                                ? "hover:bg-red-50 text-slate-400 hover:text-red-500"
                                : "hover:bg-green-50 text-slate-400 hover:text-green-500"}`}>
                            {toggling === s.uid
                              ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                              : s.status === "active" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Society Details */}
                      {selectedSociety?.id === s.id && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-display font-bold text-slate-900">Society Members</h4>
                            <button onClick={() => setSelectedSociety(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {getMembersForSociety(s.name).length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-4">No members yet.</p>
                            ) : getMembersForSociety(s.name).map((m) => (
                              <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                  {m.name?.[0] || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
                                  <div className="text-xs text-slate-400">{m.role} {m.flatNumber ? `· Flat ${m.flatNumber}` : ""}</div>
                                </div>
                                <span className={`badge text-xs ${
                                  m.role === "owner"  ? "bg-blue-100 text-blue-700" :
                                  m.role === "tenant" ? "bg-purple-100 text-purple-700" :
                                  "bg-slate-100 text-slate-600"}`}>
                                  {m.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALL MEMBERS */}
          {activeTab === "members" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">All Platform Members ({allUsers.length})</h2>
              {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> :
               allUsers.length === 0 ? <div className="text-center py-12 text-slate-400">No members yet.</div> :
               <div className="space-y-2">
                {allUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-400">
                        {u.email} · {u.societyName || u.societyCode || "—"}
                        {u.flatNumber ? ` · Flat ${u.flatNumber}` : ""}
                      </div>
                    </div>
                    <span className={`badge text-xs ${
                      u.role === "admin"      ? "bg-blue-100 text-blue-700" :
                      u.role === "owner"      ? "bg-green-100 text-green-700" :
                      u.role === "tenant"     ? "bg-purple-100 text-purple-700" :
                      u.role === "guard"      ? "bg-amber-100 text-amber-700" :
                      u.role === "superadmin" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600"}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
               </div>}
            </div>
          )}

          {/* ALL ENTRIES */}
          {activeTab === "entries" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">All Platform Entries ({allEntries.length})</h2>
              {allEntries.length === 0 ? <div className="text-center py-12 text-slate-400">No entries yet.</div> :
               <div className="space-y-2">
                {allEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {e.visitorName?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">{e.visitorName}</div>
                      <div className="text-xs text-slate-400">
                        {e.purpose} · Flat {e.flatNumber} · {e.societyCode}
                      </div>
                    </div>
                    <span className={`badge text-xs ${
                      e.status === "approved" ? "bg-green-100 text-green-700" :
                      e.status === "denied"   ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"}`}>
                      {e.status}
                    </span>
                  </div>
                ))}
               </div>}
            </div>
          )}

          {/* ALL BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">All Platform Bookings ({allBookings.length})</h2>
              {allBookings.length === 0 ? <div className="text-center py-12 text-slate-400">No bookings yet.</div> :
               <div className="space-y-2">
                {allBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">
                      🏊
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">{b.facilityName}</div>
                      <div className="text-xs text-slate-400">
                        {b.date} · {b.slot} · {b.bookedBy} · Flat {b.flatNumber}
                      </div>
                    </div>
                    <span className="badge bg-green-100 text-green-700 text-xs">confirmed</span>
                  </div>
                ))}
               </div>}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}