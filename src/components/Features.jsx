import {
  Shield, Users, Car, Calendar, Bell, Building2,
  UserCheck, ClipboardList, Lock
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Smart Gate Entry",
    desc: "Residents pre-approve visitors. Guards verify and log every entry with name, purpose and timestamp.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    title: "Tenant Management",
    desc: "Owners add tenants with expiry dates. Access auto-revokes when lease ends. No manual follow-up needed.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Car,
    title: "Vehicle Registry",
    desc: "Every vehicle registered to a flat. Wrong parking? Search the plate number and find the owner instantly.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Calendar,
    title: "Facility Booking",
    desc: "Book swimming pool, banquet hall, gym, or ground. Society admin controls slots, capacity and rules.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    desc: "Residents get notified when visitor arrives. Guards get alerted for pre-approved entries. Real-time.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: UserCheck,
    title: "Owner Verification",
    desc: "Society admin verifies and approves each owner registration before they can access the platform.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Building2,
    title: "Society Dashboard",
    desc: "Full overview of flats, members, entries, bookings and complaints — all in one admin panel.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: ClipboardList,
    title: "Entry Logs & Reports",
    desc: "Full history of every visitor, delivery, and guest. Exportable logs for security audit trail.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    desc: "Admin, Owner, Tenant, Guard — each role sees only what they need. Secure by design.",
    color: "bg-slate-50 text-slate-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="badge bg-primary-50 text-primary-700 mb-4">Features</span>
          <h2 className="section-title">Everything Your Society Needs</h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            From gate entry to facility booking — one platform handles it all.
            No more WhatsApp groups, paper registers or confusion.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}