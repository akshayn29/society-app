import { Shield, CheckCircle, XCircle, Search, LogOut, Bell, RefreshCw, Car } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../hooks/useEntries";
import { useVehicles } from "../hooks/useVehicles";

export default function GuardDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { entries, loading, updateEntryStatus } = useEntries();
  const { searchByPlate } = useVehicles();

  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState("entries");
  const [plateSearch, setPlateSearch] = useState("");
  const [plateResult, setPlateResult] = useState(null);
  const [plateSearching, setPlateSearching] = useState(false);
  const [plateNotFound, setPlateNotFound] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleAction = async (entryId, status) => {
    setUpdating(entryId);
    try { await updateEntryStatus(entryId, status, userProfile?.name || "Guard"); }
    catch (err) { console.error(err); }
    setUpdating(null);
  };

  const handlePlateSearch = async (e) => {
    e.preventDefault();
    if (!plateSearch.trim()) return;
    setPlateSearching(true);
    setPlateResult(null);
    setPlateNotFound(false);
    try {
      const result = await searchByPlate(plateSearch, userProfile?.societyCode);
      if (result) { setPlateResult(result); }
      else { setPlateNotFound(true); }
    } catch (err) { console.error(err); setPlateNotFound(true); }
    setPlateSearching(false);
  };

  const filtered = entries.filter((e) =>
    e.visitorName?.toLowerCase().includes(search.toLowerCase()) ||
    e.flatNumber?.toLowerCase().includes(search.toLowerCase()) ||
    e.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  const pending  = filtered.filter(e => e.status === "pending");
  const resolved = filtered.filter(e => e.status !== "pending");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900">Guard Panel</div>
            <div className="text-xs text-slate-400">
              {userProfile?.name} · Live
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
            {pending.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pending.length}
              </span>
            )}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-slate-100">
            <LogOut className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4">
        <div className="flex gap-1">
          {[
            { id: "entries", label: "Entry Requests", icon: CheckCircle },
            { id: "vehicles", label: "Vehicle Search", icon: Car },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all
                  ${activeTab === t.id ? "border-primary-500 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                <Icon className="w-4 h-4" />{t.label}
                {t.id === "entries" && pending.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ENTRIES TAB */}
        {activeTab === "entries" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Pending",  value: entries.filter(e => e.status === "pending").length,  color: "bg-amber-50 text-amber-600" },
                { label: "Approved", value: entries.filter(e => e.status === "approved").length, color: "bg-green-50 text-green-600" },
                { label: "Denied",   value: entries.filter(e => e.status === "denied").length,   color: "bg-red-50 text-red-600" },
              ].map((s) => (
                <div key={s.label} className={`card text-center py-4 ${s.color}`}>
                  <div className="font-display font-bold text-3xl">{s.value}</div>
                  <div className="text-xs font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search visitor, flat or purpose..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-slate-800 placeholder-slate-400" />
            </div>

            {loading ? (
              <div className="card text-center py-12">
                <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-500">Loading live entries...</p>
              </div>
            ) : (
              <>
                {pending.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      Pending ({pending.length})
                    </h3>
                    <div className="space-y-3">
                      {pending.map((e) => (
                        <div key={e.id} className="card border-2 border-amber-100 bg-amber-50/30">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {e.visitorName?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900">{e.visitorName}</div>
                              <div className="text-sm text-slate-500">Flat {e.flatNumber} · {e.purpose}</div>
                              {e.visitorPhone && <div className="text-xs text-slate-400">📞 {e.visitorPhone}</div>}
                              <div className="text-xs text-slate-400">Added by {e.addedBy} · {e.createdAt}</div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button disabled={updating === e.id} onClick={() => handleAction(e.id, "approved")}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
                              {updating === e.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" />Allow</>}
                            </button>
                            <button disabled={updating === e.id} onClick={() => handleAction(e.id, "denied")}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
                              {updating === e.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><XCircle className="w-4 h-4" />Deny</>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pending.length === 0 && (
                  <div className="card text-center py-8">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-slate-500 font-medium">All clear! No pending approvals.</p>
                  </div>
                )}
                {resolved.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-slate-900 mb-3">Today's Log ({resolved.length})</h3>
                    <div className="space-y-2">
                      {resolved.map((e) => (
                        <div key={e.id} className={`card border-2 ${e.status === "approved" ? "border-green-100" : "border-red-100"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${e.status === "approved" ? "bg-green-500" : "bg-red-500"}`}>
                              {e.visitorName?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-800 text-sm">{e.visitorName}</div>
                              <div className="text-xs text-slate-400">Flat {e.flatNumber} · {e.purpose} · {e.createdAt}</div>
                            </div>
                            <span className={`badge text-xs ${e.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{e.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* VEHICLE SEARCH TAB */}
        {activeTab === "vehicles" && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-display font-bold text-slate-900 mb-2">Search Vehicle by Plate</h3>
              <p className="text-sm text-slate-500 mb-4">Find flat owner for any wrongly parked vehicle</p>
              <form onSubmit={handlePlateSearch} className="flex gap-2">
                <input type="text" placeholder="Enter number plate e.g. MH12AB1234"
                  value={plateSearch} onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 uppercase font-mono" />
                <button type="submit" disabled={plateSearching} className="btn-primary px-4 py-3 flex items-center gap-2">
                  {plateSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>
            </div>

            {plateResult && (
              <div className="card border-2 border-green-200 bg-green-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">Vehicle Found!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Number Plate</span><span className="font-display font-bold text-slate-900 tracking-wider">{plateResult.numberPlate}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium text-slate-800">{plateResult.type}</span></div>
                  {plateResult.model && <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="font-medium text-slate-800">{plateResult.model}</span></div>}
                  {plateResult.color && <div className="flex justify-between"><span className="text-slate-500">Color</span><span className="font-medium text-slate-800">{plateResult.color}</span></div>}
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between"><span className="text-slate-500">Owner</span><span className="font-semibold text-slate-900">{plateResult.ownerName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Flat</span><span className="font-semibold text-slate-900">{plateResult.flatNumber}{plateResult.wing ? ` · Wing ${plateResult.wing}` : ""}</span></div>
                  </div>
                </div>
              </div>
            )}

            {plateNotFound && (
              <div className="card border-2 border-red-100 bg-red-50/30 text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="font-semibold text-slate-900">Vehicle not found</p>
                <p className="text-sm text-slate-500 mt-1">No vehicle registered with plate <strong>{plateSearch}</strong></p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

