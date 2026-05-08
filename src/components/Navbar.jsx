import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ appName = "SocietyApp" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Features",     href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing",      href: "#pricing" },
    { label: "Contact",      href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">{appName}</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="nav-link text-sm">{link.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-outline py-2 px-4 text-sm">Login</Link>
            <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started Free</Link>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="block nav-link py-2" onClick={() => setMenuOpen(false)}>{link.label}</a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="btn-outline text-center text-sm py-2" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary text-center text-sm py-2" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
