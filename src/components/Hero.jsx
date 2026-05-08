import { ArrowRight, Star, Users, Shield, Building2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero-pattern min-h-screen flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-2 mb-6 animate-fade-up">
              <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
              <span className="text-sm font-semibold text-primary-700">
                Trusted by 50+ Societies in India
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 leading-tight animate-fade-up animate-delay-100">
              Smart Gate &{" "}
              <span className="gradient-text">Society</span>{" "}
              Management
            </h1>

            <p className="mt-6 text-lg text-slate-500 leading-relaxed animate-fade-up animate-delay-200">
              One app for your entire society — visitor entry, tenant management,
              vehicle tracking, facility booking and more. Secure. Simple. Affordable.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 animate-fade-up animate-delay-300">
              <a href="#register" className="btn-primary flex items-center gap-2 text-base">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how-it-works" className="btn-outline text-base">
                See How It Works
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 animate-fade-up animate-delay-400">
              {[
                { icon: Building2, value: "50+",   label: "Societies" },
                { icon: Users,     value: "5,000+", label: "Members"   },
                { icon: Shield,    value: "99.9%",  label: "Uptime"    },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl text-slate-900">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block animate-fade-up animate-delay-200">
            <div className="float-card bg-white rounded-3xl p-6 animate-float">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-slate-900">Visitor Entry</span>
                <span className="badge bg-green-100 text-green-700">● Live</span>
              </div>
              {[
                { name: "Rahul Sharma",   purpose: "Delivery",    flat: "A-201", time: "2 min ago", status: "approved" },
                { name: "Priya Delivery", purpose: "Amazon",      flat: "B-105", time: "5 min ago", status: "approved" },
                { name: "Ramesh Kumar",   purpose: "Guest Visit", flat: "C-302", time: "Pending",   status: "pending"  },
              ].map((v) => (
                <div key={v.name} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {v.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">{v.name}</div>
                    <div className="text-xs text-slate-400">{v.purpose} · Flat {v.flat}</div>
                  </div>
                  <div className="text-right">
                    <div className={`badge text-xs ${
                      v.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {v.status}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{v.time}</div>
                  </div>
                </div>
              ))}
              <button className="mt-4 w-full btn-primary text-sm py-2">
                Approve Entry
              </button>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Today's Entries</div>
              <div className="font-display font-bold text-2xl text-primary-600">48</div>
              <div className="text-xs text-green-600 font-medium">↑ 12% vs yesterday</div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Security Alert</div>
                <div className="text-sm font-bold text-slate-800">All Gates Secure</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}