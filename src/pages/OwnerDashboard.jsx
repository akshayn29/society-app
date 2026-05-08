import { Shield, Plus, Car, Users, Bell, LogOut, Home, Calendar, ClipboardList, X, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../hooks/useEntries";
import { useTenants } from "../hooks/useTenants";
import { useVehicles } from "../hooks/useVehicles";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { entries, loading: entriesLoading, addVisitor } = useEntries();
  const { tenants, loading: tenantsLoading, addTenant, removeTenant } = useTenants();
  const { vehicles, loading: vehiclesLoading, addVehicle, removeVehicle } = useVehicles();

  const [activeTab, setActiveTab] = useState("overview");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [visitorForm, setVisitorForm] = useState({ visitorName: "", visitorPhone: "", purpose: "", expectedTime: "" });
  const [tenantForm, setTenantForm]   = useState({ name: "", email: "", phone: "", expiryDate: "" });
  const [vehicleForm, setVehicleForm] = useState({ numberPlate: "", type: "", model: "", color: "" });

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "visitors", label: "Visitors", icon: ClipboardList },
    { id: "tenants",  label: "Tenants",  icon: Users },
    { id: "vehicles", label: "Vehicles", icon: Car },
    { id: "bookings", label: "Bookings", icon: Calendar },
  ];

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addVisitor(visitorForm);
      setVisitorForm({ visitorName: "", visitorPhone: "", purpose: "", expectedTime: "" });
      setShowForm(false);
      showSuccess("Visitor pre-approved!");
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    if (!tenantForm.name || !tenantForm.phone || !tenantForm.expiryDate) return;
    setSubmitting(true);
    try {
      await addTenant(tenantForm);
      setTenantForm({ name: "", email: "", phone: "", expiryDate: "" });
      setShowForm(false);
      showSuccess("Tenant added successfully!");
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.numberPlate || !vehicleForm.type) return;
    setSubmitting(true);
    try {
      await addVehicle({ ...vehicleForm, numberPlate: vehicleForm.numberPlate.toUpperCase().replace(/\s/g, "") });
      setVehicleForm({ numberPlate: "", type: "", model: "", color: "" });
      setShowForm(false);
      showSuccess("Vehicle registered!");
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const statusColor = (s) =>
    s === "approved" ? "bg-green-100 text-green-700" :
    s === "denied"   ? "bg-red-100 text-red-700" :
    "bg-amber-100 text-amber-700";

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900">Flat {userProfile?.flatNumber || "—"}</div>
            <div className="text-xs text-slate-400">{userProfile?.societyCode} · {userProfile?.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-slate-100"><Bell className="w-5 h-5 text-slate-600" /></button>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-slate-100"><LogOut className="w-5 h-5 text-slate-600" /></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setShowForm(false); }}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${activeTab === t.id ? "border-primary-500 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">✓ {success}</div>}

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div className="card">
              <h3 className="font-display font-bold text-slate-900">Welcome, {userProfile?.name}! 👋</h3>
              <p className="text-sm text-slate-500 mt-1">Flat {userProfile?.flatNumber} · {userProfile?.societyCode}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Visitors", value: entries.length, color: "bg-blue-50 text-blue-600" },
                { label: "Tenants",  value: tenants.length, color: "bg-purple-50 text-purple-600" },
                { label: "Vehicles", value: vehicles.length, color: "bg-orange-50 text-orange-600" },
              ].map((s) => (
                <div key={s.label} className={`card text-center py-4 ${s.color}`}>
                  <div className="font-display font-bold text-3xl">{s.value}</div>
                  <div className="text-xs font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Add Visitor",   emoji: "👤", tab: "visitors" },
                { label: "Add Tenant",    emoji: "🏠", tab: "tenants" },
                { label: "Add Vehicle",   emoji: "🚗", tab: "vehicles" },
                { label: "Book Facility", emoji: "🏊", tab: "bookings" },
              ].map((a) => (
                <button key={a.label} onClick={() => { setActiveTab(a.tab); setShowForm(true); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 transition-all text-left card">
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{a.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* VISITORS */}
        {activeTab === "visitors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-slate-900">Visitors</h3>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? "Cancel" : "Add Visitor"}
              </button>
            </div>
            {showForm && (
              <div className="card border-2 border-primary-100">
                <h4 className="font-display font-bold text-slate-900 mb-4">Pre-approve Visitor</h4>
                <form onSubmit={handleAddVisitor} className="space-y-3">
                  <input type="text" placeholder="Visitor Name *" required value={visitorForm.visitorName}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="tel" placeholder="Visitor Phone" value={visitorForm.visitorPhone}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <select required value={visitorForm.purpose} onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 bg-white">
                    <option value="">Select Purpose *</option>
                    <option>Guest Visit</option><option>Delivery</option><option>Maintenance</option>
                    <option>Cab / Driver</option><option>Domestic Help</option><option>Other</option>
                  </select>
                  <input type="datetime-local" value={visitorForm.expectedTime}
                    onChange={(e) => setVisitorForm({ ...visitorForm, expectedTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800" />
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Pre-approve</>}
                  </button>
                </form>
              </div>
            )}
            {entriesLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> :
             entries.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">👤</div><p className="text-slate-500">No visitors yet.</p></div>
            ) : (
              <div className="space-y-3">
                {entries.map((e) => (
                  <div key={e.id} className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {e.visitorName?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">{e.visitorName}</div>
                        <div className="text-sm text-slate-500">{e.purpose} · {e.createdAt}</div>
                      </div>
                      <span className={`badge text-xs ${statusColor(e.status)}`}>{e.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TENANTS */}
        {activeTab === "tenants" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-slate-900">Tenants</h3>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? "Cancel" : "Add Tenant"}
              </button>
            </div>
            {showForm && (
              <div className="card border-2 border-primary-100">
                <h4 className="font-display font-bold text-slate-900 mb-4">Add New Tenant</h4>
                <form onSubmit={handleAddTenant} className="space-y-3">
                  <input type="text" placeholder="Tenant Full Name *" required value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="email" placeholder="Tenant Email" value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="tel" placeholder="Tenant Phone *" required value={tenantForm.phone}
                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lease Expiry Date *</label>
                    <input type="date" required value={tenantForm.expiryDate}
                      onChange={(e) => setTenantForm({ ...tenantForm, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Add Tenant</>}
                  </button>
                </form>
              </div>
            )}
            {tenantsLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> :
             tenants.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">👥</div><p className="text-slate-500">No tenants added yet.</p></div>
            ) : (
              <div className="space-y-3">
                {tenants.map((t) => {
                  const expired = isExpired(t.expiryDate);
                  return (
                    <div key={t.id} className={`card border-2 ${expired ? "border-red-100 bg-red-50/30" : "border-slate-100"}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {t.name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{t.name}</span>
                            {expired && <span className="badge bg-red-100 text-red-700 text-xs">Expired</span>}
                            {!expired && <span className="badge bg-green-100 text-green-700 text-xs">Active</span>}
                          </div>
                          <div className="text-sm text-slate-500">📞 {t.phone}</div>
                          {t.email && <div className="text-sm text-slate-500">✉️ {t.email}</div>}
                          <div className={`text-xs mt-1 flex items-center gap-1 ${expired ? "text-red-500" : "text-slate-400"}`}>
                            {expired && <AlertCircle className="w-3 h-3" />}
                            Lease expires: {t.expiryDate}
                          </div>
                        </div>
                        <button onClick={() => removeTenant(t.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VEHICLES */}
        {activeTab === "vehicles" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-slate-900">Vehicles</h3>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? "Cancel" : "Add Vehicle"}
              </button>
            </div>
            {showForm && (
              <div className="card border-2 border-primary-100">
                <h4 className="font-display font-bold text-slate-900 mb-4">Register Vehicle</h4>
                <form onSubmit={handleAddVehicle} className="space-y-3">
                  <input type="text" placeholder="Number Plate e.g. MH12AB1234 *" required value={vehicleForm.numberPlate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, numberPlate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 uppercase" />
                  <select required value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 bg-white">
                    <option value="">Vehicle Type *</option>
                    <option>Car</option><option>Bike / Scooter</option><option>Other</option>
                  </select>
                  <input type="text" placeholder="Make & Model e.g. Honda City" value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="text" placeholder="Color" value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Register Vehicle</>}
                  </button>
                </form>
              </div>
            )}
            {vehiclesLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> :
             vehicles.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">🚗</div><p className="text-slate-500">No vehicles registered yet.</p></div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
                        {v.type === "Car" ? "🚗" : "🏍️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-slate-900 tracking-wide">{v.numberPlate}</div>
                        <div className="text-sm text-slate-500">{v.type}{v.model ? ` · ${v.model}` : ""}{v.color ? ` · ${v.color}` : ""}</div>
                      </div>
                      <button onClick={() => removeVehicle(v.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🏊</div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-2">Facility Booking</h3>
            <p className="text-slate-500">Coming in Phase 6!</p>
          </div>
        )}
      </main>
    </div>
  );
}
