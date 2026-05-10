import {
  Shield, Users, Building2, Calendar, Bell,
  LogOut, Menu, TrendingUp, CheckCircle, Clock, Plus, X, Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../hooks/useEntries";
import { useFacilities } from "../hooks/useFacilities";

const FACILITY_ICONS = { "Swimming Pool": "🏊", "Gym": "💪", "Banquet Hall": "🏛️", "Ground": "⚽", "Club House": "🏠", "Tennis Court": "🎾", "Other": "🏢" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { entries, loading: entriesLoading } = useEntries();
  const { facilities, bookings, loading: facilitiesLoading, addFacility, deleteFacility } = useFacilities();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [facilityForm, setFacilityForm] = useState({ name: "", capacity: "", price: "", description: "" });

  const handleLogout = async () => { await logout(); navigate("/login"); };
  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    if (!facilityForm.name || !facilityForm.capacity) return;
    setSubmitting(true);
    try {
      await addFacility(facilityForm);
      setFacilityForm({ name: "", capacity: "", price: "", description: "" });
      setShowForm(false);
      showSuccess("Facility added successfully!");
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const navItems = [
    { id: "overview",    label: "Overview",      icon: TrendingUp },
    { id: "entries",     label: "Entry Logs",    icon: CheckCircle },
    { id: "approvals",   label: "Approvals",     icon: Clock, badge: entries.filter(e => e.status === "pending").length },
    { id: "facilities",  label: "Facilities",    icon: Calendar },
    { id: "bookings",    label: "All Bookings",  icon: Building2 },
    { id: "members",     label: "Members",       icon: Users },
  ];

  const statusColor = (s) => s === "approved" ? "bg-green-100 text-green-700" : s === "denied" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div><div className="font-display font-bold text-slate-900">SocietyApp</div><div className="text-xs text-slate-400">Admin Panel</div></div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => { const Icon = item.icon; return (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <Icon className="w-4 h-4" />{item.label}
              {item.badge > 0 && <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          );})}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userProfile?.name?.[0] || "A"}
            </div>
            <div><div className="text-sm font-semibold text-slate-900">{userProfile?.name}</div><div className="text-xs text-slate-400">{userProfile?.societyName}</div></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 px-2 py-1.5">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100"><Menu className="w-5 h-5" /></button>
            <div><h1 className="font-display font-bold text-xl text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-xs text-slate-400">{userProfile?.societyName} · {new Date().toDateString()}</p></div>
          </div>
          <button className="relative p-2 rounded-xl hover:bg-slate-100"><Bell className="w-5 h-5 text-slate-600" />
            {entries.filter(e => e.status === "pending").length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </header>

        <main className="p-6">
          {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">✓ {success}</div>}

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Entries",  value: entries.length,                                       icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
                  { label: "Pending",        value: entries.filter(e => e.status === "pending").length,   icon: Clock,      color: "bg-amber-50 text-amber-600" },
                  { label: "Facilities",     value: facilities.length,                                    icon: Building2,  color: "bg-green-50 text-green-600" },
                  { label: "Bookings Today", value: bookings.filter(b => b.date === new Date().toISOString().split("T")[0]).length, icon: Calendar, color: "bg-purple-50 text-purple-600" },
                ].map((s) => { const Icon = s.icon; return (
                  <div key={s.label} className="card">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><Icon className="w-5 h-5" /></div>
                    <div className="font-display font-bold text-3xl text-slate-900">{s.value}</div>
                    <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                  </div>
                );})}
              </div>
              <div className="card">
                <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Recent Entries</h2>
                {entriesLoading ? <div className="text-center py-8 text-slate-400">Loading...</div> :
                 entries.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{e.visitorName?.[0] || "?"}</div>
                    <div className="flex-1"><div className="font-semibold text-slate-800 text-sm">{e.visitorName}</div><div className="text-xs text-slate-400">{e.purpose} · Flat {e.flatNumber}</div></div>
                    <span className={`badge text-xs ${statusColor(e.status)}`}>{e.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENTRIES */}
          {activeTab === "entries" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">All Entry Logs</h2>
              {entriesLoading ? <div className="text-center py-8 text-slate-400">Loading...</div> :
               entries.length === 0 ? <div className="text-center py-12 text-slate-400">No entries yet.</div> :
               <div className="space-y-3">{entries.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{e.visitorName?.[0] || "?"}</div>
                  <div className="flex-1"><div className="font-semibold text-slate-800 text-sm">{e.visitorName}</div><div className="text-xs text-slate-400">{e.purpose} · Flat {e.flatNumber} · {e.createdAt}</div></div>
                  <span className={`badge text-xs ${statusColor(e.status)}`}>{e.status}</span>
                </div>
               ))}</div>}
            </div>
          )}

          {/* APPROVALS */}
          {activeTab === "approvals" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Pending Entries</h2>
              {entries.filter(e => e.status === "pending").length === 0 ? (
                <div className="text-center py-12"><div className="text-4xl mb-2">✅</div><p className="text-slate-500">No pending approvals!</p></div>
              ) : entries.filter(e => e.status === "pending").map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">{e.visitorName?.[0] || "?"}</div>
                  <div className="flex-1"><div className="font-semibold text-slate-800 text-sm">{e.visitorName}</div><div className="text-xs text-slate-400">{e.purpose} · Flat {e.flatNumber} · Added by {e.addedBy}</div></div>
                  <span className="badge bg-amber-100 text-amber-700 text-xs">pending</span>
                </div>
              ))}
            </div>
          )}

          {/* FACILITIES */}
          {activeTab === "facilities" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-slate-900">Manage Facilities</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                  {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Facility"}
                </button>
              </div>
              {showForm && (
                <div className="card border-2 border-primary-100">
                  <h4 className="font-display font-bold text-slate-900 mb-4">Add New Facility</h4>
                  <form onSubmit={handleAddFacility} className="space-y-3">
                    <select required value={facilityForm.name} onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 bg-white">
                      <option value="">Select Facility Type *</option>
                      {Object.keys(FACILITY_ICONS).map(f => <option key={f}>{f}</option>)}
                    </select>
                    <input type="number" placeholder="Capacity (max people) *" required value={facilityForm.capacity}
                      onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                    <input type="number" placeholder="Price per slot (₹) — leave blank if free" value={facilityForm.price}
                      onChange={(e) => setFacilityForm({ ...facilityForm, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                    <input type="text" placeholder="Description (optional)" value={facilityForm.description}
                      onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                    <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                      {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Add Facility</>}
                    </button>
                  </form>
                </div>
              )}
              {facilitiesLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> :
               facilities.length === 0 ? (
                <div className="card text-center py-12"><div className="text-4xl mb-2">🏊</div><p className="text-slate-500">No facilities added yet. Add your first facility above!</p></div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {facilities.map((f) => (
                    <div key={f.id} className="card">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{FACILITY_ICONS[f.name] || "🏢"}</div>
                          <div>
                            <div className="font-display font-bold text-slate-900">{f.name}</div>
                            <div className="text-sm text-slate-500">Capacity: {f.capacity} people</div>
                            {f.price ? <div className="text-sm text-primary-600 font-semibold">₹{f.price}/slot</div> : <div className="text-sm text-green-600 font-semibold">Free</div>}
                          </div>
                        </div>
                        <button onClick={() => deleteFacility(f.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-400">Bookings today: {bookings.filter(b => b.facilityId === f.id && b.date === new Date().toISOString().split("T")[0]).length}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALL BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">All Bookings ({bookings.length})</h2>
              {bookings.length === 0 ? <div className="text-center py-12 text-slate-400">No bookings yet.</div> :
               <div className="space-y-3">{bookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="text-2xl">{FACILITY_ICONS[b.facilityName] || "🏢"}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 text-sm">{b.facilityName}</div>
                    <div className="text-xs text-slate-400">{b.date} · {b.slot} · Flat {b.flatNumber} · {b.bookedBy}</div>
                  </div>
                  <span className="badge bg-green-100 text-green-700 text-xs">confirmed</span>
                </div>
               ))}</div>}
            </div>
          )}

          {/* MEMBERS */}
          {activeTab === "members" && (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">Member Management</h3>
              <p className="text-slate-500">Coming in Phase 7!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
