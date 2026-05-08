const steps = [
  {
    role: "Society Admin",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    steps: [
      "Register society and get verified",
      "Approve owner registrations",
      "Add facilities (pool, hall, gym)",
      "View all reports and entry logs",
    ],
  },
  {
    role: "Owner / Member",
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
    steps: [
      "Register flat after admin approval",
      "Add tenants with expiry dates",
      "Pre-approve visitors and deliveries",
      "Register vehicles to your flat",
    ],
  },
  {
    role: "Security Guard",
    color: "from-green-500 to-green-700",
    bg: "bg-green-50",
    border: "border-green-100",
    steps: [
      "Open guard panel on any mobile browser",
      "See all pending visitor approvals",
      "Verify visitor, enter name and purpose",
      "Mark entry/exit with one tap",
    ],
  },
  {
    role: "Tenant",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    steps: [
      "Added by owner with expiry date",
      "Approve own visitors and deliveries",
      "Book society facilities",
      "Access auto-removed on expiry",
    ],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="badge bg-primary-50 text-primary-700 mb-4">How It Works</span>
          <h2 className="section-title">Different Roles, One Platform</h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            Each person in your society gets exactly what they need —
            nothing more, nothing less.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.role} className={`card border ${s.border} hover:shadow-md transition-all duration-200`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-display font-bold text-lg mb-4 shadow-md`}>
                {i + 1}
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-4">{s.role}</h3>
              <ul className="space-y-3">
                {s.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className={`mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${s.color} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                      {j + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 card">
          <h3 className="font-display font-bold text-xl text-slate-900 mb-6 text-center">
            Visitor Entry Flow
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {[
              { label: "Visitor Arrives at Gate", bg: "bg-slate-100 text-slate-700" },
              { label: "→", bg: "" },
              { label: "Guard Checks App", bg: "bg-blue-100 text-blue-700" },
              { label: "→", bg: "" },
              { label: "Pre-approved?", bg: "bg-amber-100 text-amber-700" },
              { label: "→", bg: "" },
              { label: "Resident Notified", bg: "bg-purple-100 text-purple-700" },
              { label: "→", bg: "" },
              { label: "Resident Approves", bg: "bg-green-100 text-green-700" },
              { label: "→", bg: "" },
              { label: "Entry Logged ✓", bg: "bg-green-500 text-white" },
            ].map((item, i) => (
              <span key={i} className={`font-medium px-3 py-2 rounded-lg ${item.bg}`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
