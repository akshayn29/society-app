import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₹999",
    period: "/flat/year",
    desc: "Perfect for small societies up to 100 flats",
    highlight: false,
    features: [
      "Gate entry management",
      "Visitor pre-approval",
      "Vehicle registry",
      "Owner & tenant management",
      "Basic entry logs",
      "Guard mobile panel",
      "Email support",
    ],
  },
  {
    name: "Standard",
    price: "₹1,499",
    period: "/flat/year",
    desc: "Most popular — ideal for 100–300 flat societies",
    highlight: true,
    features: [
      "Everything in Starter",
      "Facility booking system",
      "Push notifications",
      "Advanced reports & exports",
      "Multiple gate support",
      "Tenant expiry auto-revoke",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    price: "₹1,999",
    period: "/flat/year",
    desc: "Large societies with 300+ flats and complex needs",
    highlight: false,
    features: [
      "Everything in Standard",
      "Dedicated account manager",
      "Custom facility rules",
      "Bulk member import",
      "API access",
      "White-label option",
      "24/7 phone support",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="badge bg-primary-50 text-primary-700 mb-4">Pricing</span>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            3–5x cheaper than MyGate and NoBrokerHood — with all the same features.
            Billed to society committee, not individual members.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
                ${plan.highlight
                  ? "bg-gradient-to-b from-primary-600 to-primary-800 border-primary-600 text-white shadow-2xl shadow-primary-200"
                  : "bg-white border-slate-100 hover:border-primary-200"
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="badge bg-accent-500 text-white px-4 py-1.5 shadow-lg">
                    <Zap className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className={`font-display font-bold text-xl mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-primary-200" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`font-display font-bold text-4xl ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-primary-200" : "text-slate-400"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-primary-200" : "text-primary-600"}`} />
                    <span className={plan.highlight ? "text-primary-100" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`block text-center font-semibold py-3 px-6 rounded-xl transition-all duration-200
                  ${plan.highlight
                    ? "bg-white text-primary-700 hover:bg-primary-50"
                    : "btn-primary"
                  }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400 mt-8">
          All plans include 30-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
