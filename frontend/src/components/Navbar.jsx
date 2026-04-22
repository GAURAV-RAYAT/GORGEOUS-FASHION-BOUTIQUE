import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { BRAND, waLink } from "../lib/api";
import { useSettings } from "../lib/settings";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery?cat=Saree", label: "Sarees" },
  { to: "/gallery?cat=Lehenga", label: "Lehengas" },
  { to: "/gallery?cat=Gown", label: "Gowns" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { settings } = useSettings();
  const logo = settings?.logo_url || BRAND.logo;
  const phone = settings?.phone || BRAND.phone;

  return (
    <header data-testid="navbar" className="sticky top-0 z-40">
      {/* announcement bar */}
      <div className="bg-burgundy-deep text-beige text-[11px] md:text-xs tracking-[0.3em] uppercase py-2 text-center">
        <span className="hidden sm:inline">Free Styling Consultation · Custom Tailoring · </span>
        <a href={`tel:${phone}`} className="hover:text-gold">Call {phone}</a>
      </div>
      {/* main bar */}
      <div className="bg-beige/95 backdrop-blur-xl border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
            <img src={logo} alt="Gorgeous Fashion Boutique" className="h-12 w-12 md:h-14 md:w-14 object-contain rounded" />
            <div className="hidden sm:block leading-tight">
              <div className="font-hindi text-burgundy text-base md:text-lg">गॉर्जियस</div>
              <div className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-ink/70">Fashion Boutique</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {links.map((l) => (
              <Link key={l.to + l.label} to={l.to}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={`text-xs xl:text-sm uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                  loc.pathname === l.to.split("?")[0] ? "text-burgundy" : "text-ink/70 hover:text-burgundy"
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a href={waLink()} target="_blank" rel="noreferrer"
              className="border border-gold text-burgundy hover:bg-gold/10 h-10 w-10 flex items-center justify-center"
              aria-label="WhatsApp">
              <MessageCircle size={16} />
            </a>
            <Link to="/book" data-testid="nav-book-cta"
              className="bg-burgundy text-beige px-5 md:px-6 py-2.5 text-[10px] md:text-xs tracking-[0.25em] uppercase hover:bg-burgundy-dark transition-colors inline-flex items-center gap-2">
              <Calendar size={14} /> Book Appointment
            </Link>
          </div>

          <button data-testid="nav-mobile-toggle" className="lg:hidden text-burgundy p-1" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gold/30 bg-beige-light">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to + l.label} to={l.to} onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-[0.2em] text-ink/80 border-b border-gold/20 last:border-0">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4">
              <Link to="/book" onClick={() => setOpen(false)}
                className="flex-1 bg-burgundy text-beige px-6 py-3 text-xs tracking-[0.25em] uppercase text-center">
                Book
              </Link>
              <a href={waLink()} target="_blank" rel="noreferrer"
                className="flex-1 border border-gold text-burgundy px-6 py-3 text-xs tracking-[0.25em] uppercase text-center">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
