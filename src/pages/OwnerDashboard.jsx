/* eslint-disable no-unused-vars */
import DomesticHelpTab from "../components/DomesticHelpTab";
import ChatTab from "../components/ChatTab";
import {
  Shield, Plus, Car, Users, Bell, LogOut, Home,
  Calendar, ClipboardList, X, Trash2, AlertCircle, AlertTriangle, Clock, HeartHandshake, MessageCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../hooks/useEntries";
import { useTenants } from "../hooks/useTenants";
import { useVehicles } from "../hooks/useVehicles";
import { useFacilities } from "../hooks/useFacilities";
import ComplaintsTab from "../components/ComplaintsTab";

const TABS = [
  { id: "overview",  label: "Overview",  icon: Home },
  { id: "visitors",  label: "Visitors",  icon: ClipboardList },
  { id: "tenants",   label: "Tenants",   icon: Users },
  { id: "vehicles",  label: "Vehicles",  icon: Car },
  { id: "bookings",  label: "Bookings",  icon: Calendar },
  { id: "complaints", label: "My Complaints", icon: AlertTriangle },
  { id: "chat",      label: "Chat",      icon: MessageCircle },
  { id: "domestic",  label: "Help",      icon: HeartHandshake },
];

const TIME_SLOTS = [
  "06:00 AM - 08:00 AM", "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM", "08:00 PM - 10:00 PM",
];

const FACILITY_ICONS = {
  "Swimming Pool": "🏊", "Gym": "💪", "Banquet Hall": "🏛️",
  "Ground": "⚽", "Club House": "🏠", "Tennis Court": "🎾", "Other": "🏢"
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { entries, loading: entriesLoading, addVisitor } = useEntries();
  const { tenants, loading: tenantsLoading, addTenant, removeTenant } = useTenants();
  const { vehicles, loading: vehiclesLoading, addVehicle, removeVehicle } = useVehicles();
  const { facilities, myBookings, loading: facilitiesLoading, bookFacility, cancelBooking, getSlotBookings } = useFacilities();




  const [activeTab, setActiveTab] = useState("overview");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ title: "", description: "", category: "" });

  const [visitorForm, setVisitorForm] = useState({ visitorName: "", visitorPhone: "", purpose: "", expectedTime: "" });
  const [tenantForm, setTenantForm]   = useState({ name: "", email: "", phone: "", expiryDate: "" });
  const [vehicleForm, setVehicleForm] = useState({ numberPlate: "", type: "", model: "", color: "" });

  const showSuccess = (msg) => { setSuccess(msg); setError(""); setTimeout(() => setSuccess(""), 3000); };
  const showError   = (msg) => { setError(msg);   setSuccess(""); setTimeout(() => setError(""), 4000); };
  const handleLogout = async () => { await logout(); navigate("/login"); };
  const isExpired = (date) => date && new Date(date) < new Date();
  const statusColor = (s) => s === "approved" ? "bg-green-100 text-green-700" : s === "denied" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  const today = new Date().toISOString().split("T")[0];

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await addVisitor(visitorForm); setVisitorForm({ visitorName: "", visitorPhone: "", purpose: "", expectedTime: "" }); setShowForm(false); showSuccess("Visitor pre-approved!"); }
    catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await addTenant(tenantForm); setTenantForm({ name: "", email: "", phone: "", expiryDate: "" }); setShowForm(false); showSuccess("Tenant added!"); }
    catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await addVehicle({ ...vehicleForm, numberPlate: vehicleForm.numberPlate.toUpperCase().replace(/\s/g, "") }); setVehicleForm({ numberPlate: "", type: "", model: "", color: "" }); setShowForm(false); showSuccess("Vehicle registered!"); }
    catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleBookFacility = async () => {
    if (!selectedFacility || !bookingDate || !bookingSlot) { showError("Please select facility, date and slot."); return; }
    setSubmitting(true);
    try {
      await bookFacility(selectedFacility.id, selectedFacility.name, bookingDate, bookingSlot);
      showSuccess(`${selectedFacility.name} booked for ${bookingDate} · ${bookingSlot}`);
      setSelectedFacility(null); setBookingDate(""); setBookingSlot("");
    } catch (err) {
      showError(err?.message === "Slot already booked" ? "This slot is already booked. Please choose another." : "Booking failed. Try again.");
    }
    setSubmitting(false);
  };



  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
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
          <NotificationBell />
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-slate-100"><LogOut className="w-5 h-5 text-slate-600" /></button>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-white border-b border-slate-100 px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setShowForm(false); setSelectedFacility(null); }}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                ${activeTab === t.id ? "border-primary-500 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );})}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">✓ {success}</div>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">⚠ {error}</div>}

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div className="card"><h3 className="font-display font-bold text-slate-900">Welcome, {userProfile?.name}! 👋</h3><p className="text-sm text-slate-500 mt-1">Flat {userProfile?.flatNumber} · {userProfile?.societyCode}</p></div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Visitors", value: entries.length,    color: "bg-blue-50 text-blue-600" },
                { label: "Tenants",  value: tenants.length,    color: "bg-purple-50 text-purple-600" },
                { label: "Raise Complaint", emoji: "📢", action: () => setShowComplaintForm(true) },
                { label: "Chat with Admin", emoji: "💬", tab: "chat" },
                { label: "Domestic Help",  emoji: "🧹", tab: "domestic" },
              ].map((a) => (
                <button key={a.label} onClick={a.tab ? () => { setActiveTab(a.tab); setShowForm(false); } : a.action}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-primary-50 transition-all text-left card">
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{a.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Add Visitor",    emoji: "👤", tab: "visitors" },
                { label: "Add Tenant",     emoji: "🏠", tab: "tenants" },
                { label: "Add Vehicle",    emoji: "🚗", tab: "vehicles" },
                { label: "Book Facility",  emoji: "🏊", tab: "bookings" },
                { label: "Raise Complaint", emoji: "📢", action: () => setShowComplaintForm(true) },
                { label: "Chat with Admin", emoji: "💬", tab: "chat" },
                { label: "Domestic Help",  emoji: "🧹", tab: "domestic" },
              ].map((a) => (
                <button key={a.label} onClick={a.tab ? () => { setActiveTab(a.tab); setShowForm(false); } : a.action}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-primary-50 transition-all text-left card">
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
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Visitor"}
              </button>
            </div>
            {showForm && (
              <div className="card border-2 border-primary-100">
                <form onSubmit={handleAddVisitor} className="space-y-3">
                  <input type="text" placeholder="Visitor Name *" required value={visitorForm.visitorName} onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="tel" placeholder="Visitor Phone" value={visitorForm.visitorPhone} onChange={(e) => setVisitorForm({ ...visitorForm, visitorPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <select required value={visitorForm.purpose} onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 bg-white">
                    <option value="">Select Purpose *</option><option>Guest Visit</option><option>Delivery</option><option>Maintenance</option><option>Cab / Driver</option><option>Domestic Help</option><option>Other</option>
                  </select>
                  <input type="datetime-local" value={visitorForm.expectedTime} onChange={(e) => setVisitorForm({ ...visitorForm, expectedTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800" />
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Pre-approve</>}
                  </button>
                </form>
              </div>
            )}
            {entriesLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> : entries.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">👤</div><p className="text-slate-500">No visitors yet.</p></div>
            ) : (
              <div className="space-y-3">{entries.map((e) => (
                <div key={e.id} className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{e.visitorName?.[0] || "?"}</div>
                    <div className="flex-1"><div className="font-semibold text-slate-900">{e.visitorName}</div><div className="text-sm text-slate-500">{e.purpose} · {e.createdAt}</div></div>
                    <span className={`badge text-xs ${statusColor(e.status)}`}>{e.status}</span>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* TENANTS */}
        {activeTab === "tenants" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-slate-900">Tenants</h3>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Tenant"}
              </button>
            </div>
            {showForm && (
              <div className="card border-2 border-primary-100">
                <form onSubmit={handleAddTenant} className="space-y-3">
                  <input type="text" placeholder="Tenant Full Name *" required value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="email" placeholder="Tenant Email" value={tenantForm.email} onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="tel" placeholder="Tenant Phone *" required value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Lease Expiry Date *</label>
                  <input type="date" required value={tenantForm.expiryDate} onChange={(e) => setTenantForm({ ...tenantForm, expiryDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800" /></div>
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Add Tenant</>}
                  </button>
                </form>
              </div>
            )}
            {tenantsLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> : tenants.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">👥</div><p className="text-slate-500">No tenants added yet.</p></div>
            ) : (
              <div className="space-y-3">{tenants.map((t) => {
                const expired = isExpired(t.expiryDate);
                return (
                  <div key={t.id} className={`card border-2 ${expired ? "border-red-100 bg-red-50/30" : "border-slate-100"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{t.name?.[0] || "?"}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-slate-900">{t.name}</span>
                          {expired ? <span className="badge bg-red-100 text-red-700 text-xs">Expired</span> : <span className="badge bg-green-100 text-green-700 text-xs">Active</span>}
                        </div>
                        <div className="text-sm text-slate-500">📞 {t.phone}</div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${expired ? "text-red-500" : "text-slate-400"}`}>
                          {expired && <AlertCircle className="w-3 h-3" />}Lease expires: {t.expiryDate}
                        </div>
                      </div>
                      <button onClick={() => removeTenant(t.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}</div>
            )}
          </div>
        )}

        {/* VEHICLES */}
        {activeTab === "vehicles" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-slate-900">Vehicles</h3>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Vehicle"}
              </button>
            </div>
            {showForm && (
              <div className="card border-2 border-primary-100">
                <form onSubmit={handleAddVehicle} className="space-y-3">
                  <input type="text" placeholder="Number Plate e.g. MH12AB1234 *" required value={vehicleForm.numberPlate} onChange={(e) => setVehicleForm({ ...vehicleForm, numberPlate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 uppercase" />
                  <select required value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 bg-white">
                    <option value="">Vehicle Type *</option><option>Car</option><option>Bike / Scooter</option><option>Other</option>
                  </select>
                  <input type="text" placeholder="Make & Model e.g. Honda City" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <input type="text" placeholder="Color" value={vehicleForm.color} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400" />
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Register Vehicle</>}
                  </button>
                </form>
              </div>
            )}
            {vehiclesLoading ? <div className="card text-center py-8 text-slate-400">Loading...</div> : vehicles.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">🚗</div><p className="text-slate-500">No vehicles registered yet.</p></div>
            ) : (
              <div className="space-y-3">{vehicles.map((v) => (
                <div key={v.id} className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{v.type === "Car" ? "🚗" : "🏍️"}</div>
                    <div className="flex-1"><div className="font-display font-bold text-slate-900 tracking-wide">{v.numberPlate}</div><div className="text-sm text-slate-500">{v.type}{v.model ? ` · ${v.model}` : ""}{v.color ? ` · ${v.color}` : ""}</div></div>
                    <button onClick={() => removeVehicle(v.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-slate-900">Facility Booking</h3>
            {facilitiesLoading ? <div className="card text-center py-8 text-slate-400">Loading facilities...</div> :
             facilities.length === 0 ? (
              <div className="card text-center py-12"><div className="text-4xl mb-2">🏊</div><p className="text-slate-500">No facilities added by admin yet.</p></div>
            ) : (
              <>
                <div className="card">
                  <h4 className="font-display font-semibold text-slate-900 mb-3">Select Facility</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {facilities.map((f) => (
                      <button key={f.id} onClick={() => { setSelectedFacility(f); setBookingSlot(""); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedFacility?.id === f.id ? "border-primary-500 bg-primary-50" : "border-slate-100 hover:border-primary-200"}`}>
                        <div className="text-3xl mb-2">{FACILITY_ICONS[f.name] || "🏢"}</div>
                        <div className="font-semibold text-slate-900 text-sm">{f.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Capacity: {f.capacity}</div>
                        {f.price && <div className="text-xs text-primary-600 font-semibold mt-0.5">₹{f.price}/slot</div>}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedFacility && (
                  <div className="card border-2 border-primary-100">
                    <h4 className="font-display font-semibold text-slate-900 mb-4">
                      Book {selectedFacility.name} {FACILITY_ICONS[selectedFacility.name] || "🏢"}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Date</label>
                        <input type="date" min={today} value={bookingDate} onChange={(e) => { setBookingDate(e.target.value); setBookingSlot(""); }}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800" />
                      </div>
                      {bookingDate && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Time Slot</label>
                          <div className="grid grid-cols-2 gap-2">
                            {TIME_SLOTS.map((slot) => {
                              const slotBookings = getSlotBookings(selectedFacility.id, bookingDate);
                              const isBooked = slotBookings.some(b => b.slot === slot);
                              const isMyBooking = slotBookings.some(b => b.slot === slot && b.bookedByUid === userProfile?.uid);
                              return (
                                <button key={slot} disabled={isBooked} onClick={() => setBookingSlot(slot)}
                                  className={`p-2.5 rounded-xl text-xs font-medium border-2 transition-all text-left
                                    ${isMyBooking ? "border-primary-500 bg-primary-50 text-primary-700" :
                                      isBooked ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed" :
                                      bookingSlot === slot ? "border-primary-500 bg-primary-50 text-primary-700" :
                                      "border-slate-200 hover:border-primary-300 text-slate-700"}`}>
                                  <Clock className="w-3 h-3 inline mr-1" />{slot}
                                  {isBooked && <span className="block text-xs mt-0.5 text-slate-400">{isMyBooking ? "Your booking" : "Booked"}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {bookingSlot && (
                        <button onClick={handleBookFacility} disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                          {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Calendar className="w-4 h-4" />Confirm Booking</>}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {myBookings.length > 0 && (
                  <div>
                    <h4 className="font-display font-semibold text-slate-900 mb-3">My Bookings ({myBookings.length})</h4>
                    <div className="space-y-3">
                      {myBookings.map((b) => (
                        <div key={b.id} className="card border-2 border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{FACILITY_ICONS[b.facilityName] || "🏢"}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{b.facilityName}</div>
                              <div className="text-sm text-slate-500">{b.date} · {b.slot}</div>
                            </div>
                            <button onClick={() => cancelBooking(b.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* COMPLAINTS */}
        {activeTab === "complaints" && <ComplaintsTab />}

                {/* DOMESTIC HELP */}
        {activeTab === "domestic" && (
          <DomesticHelpTab
            societyCode={userProfile?.societyCode}
            flatNumber={userProfile?.flatNumber}
          />
        )}

    </div>
  );
}



