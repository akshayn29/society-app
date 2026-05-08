import { Shield, Users, Building2, Car, Calendar, Bell, LogOut, Menu, X, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Flats",     value: "200", icon: Building2,   color: "bg-blue-50 text-blue-600",   change: "" },
  { label: "Active Members",  value: "186", icon: Users,       color: "bg-green-50 text-green-600", change: "+3 this week" },
  { label: "Today's Entries", value: "48",  icon: TrendingUp,  color: "bg-purple-50 text-purple-600", change: "↑ 12%" },
  { label: "Pending Approvals", value: "5", icon: Clock,       color: "bg-amber-50 text-amber-600", change: "Action needed" },
];

const recentEntries = [
  { name: "Rahul Sharma",   flat: "A-201", purpose: "Delivery",    time: "10:32 AM", status: "approved" },
  { name: "Priya Mehta",    flat: "B-105", purpose: "Guest",       time: "10:15 AM", status: "approved" },
  { name: "Delivery Agent", flat: "C-302", purpose: "Amazon",      time: "09:58 AM", status: "approved" },
  { name: "Ramesh Kumar",   flat: "A-404", purpose: "Maintenance", time: "09:30 AM", status: "pending"  },
  { name: "Sita Devi",      flat: "D-101", purpose: "Guest",       time: "09:10 AM", status: "denied"   },
];

const pendingOwners = [
  { name: "Amit Patel",   flat: "E-201", phone: "+91 98765 43210", since: "2 hours ago" },
  { name: "Sneha Joshi",  flat: "F-102", phone: "+91 87654 32109", since: "5 hours ago" },
  { name: "Vikram Singh", flat: "B-303", phone: "+91 76543 21098", since: "1 day ago"   },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview",  label: "Overview",         icon: TrendingUp },
    { id: "entries",   label: "Entry Logs",        icon: CheckCircle },
    { id: "members",   label: "Members",           icon: Users },
    { id: "vehicles",  label: "Vehicles",          icon: Car },
    { id: "facilities",label: "Facilities",        icon: Calendar },
    { id: "approvals", label: "Pending Approvals", icon: Clock, badge: 5 },
  ];

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
            <div>
              <div className="font-display font-bold text-slate-900">SocietyApp</div>
              <div className="text-xs text-slate-400">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === item.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}>
                <Icon className="w-4 h-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Society Admin</div>
              <div className="text-xs text-slate-400">Green Valley CHS</div>
            </div>
          </div>
          <button onClick={() => navigate("/login")}
            className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors px-2 py-1.5">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-900 capitalize">{activeTab}</h1>
              <p className="text-xs text-slate-400">Green Valley CHS · {new Date().toDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {s.change && <span className="text-xs text-green-600 font-medium">{s.change}</span>}
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900">{s.value}</div>
                      <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Entries */}
              <div className="card">
                <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Recent Entries</h2>
                <div className="space-y-3">
                  {recentEntries.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {e.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm">{e.name}</div>
                        <div className="text-xs text-slate-400">{e.purpose} · Flat {e.flat}</div>
                      </div>
                      <div className="text-right">
                        <span className={`badge text-xs ${
                          e.status === "approved" ? "bg-green-100 text-green-700" :
                          e.status === "pending"  ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"}`}>
                          {e.status}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">{e.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === "approvals" && (
            <div className="card">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Pending Owner Approvals</h2>
              <div className="space-y-4">
                {pendingOwners.map((o, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {o.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{o.name}</div>
                      <div className="text-sm text-slate-500">Flat {o.flat} · {o.phone}</div>
                      <div className="text-xs text-slate-400">Requested {o.since}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary py-2 px-4 text-sm">Approve</button>
                      <button className="btn-outline py-2 px-4 text-sm text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {!["overview", "approvals"].includes(activeTab) && (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">🚧</div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">Coming in Next Phase</h3>
              <p className="text-slate-500">The {activeTab} section will be built in the next phase.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
