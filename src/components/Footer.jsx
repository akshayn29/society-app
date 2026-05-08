import { Shield, Mail, Phone, MapPin } from "lucide-react";

export default function Footer({ appName = "SocietyApp" }) {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">{appName}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Modern society management for residential communities across India.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {["Features", "How It Works", "Pricing", "Security"].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About Us", "Blog", "Careers", "Privacy Policy", "Terms of Service"].map((l) => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" />hello@societyapp.in</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" />+91 98765 43210</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary-400 mt-0.5" />Pune, Maharashtra, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2025 {appName}. All rights reserved.</p>
          <p className="text-slate-500">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
