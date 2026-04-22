import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BRAND } from "../lib/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/book", label: "Book" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 bg-beige/90 backdrop-blur-xl border-b border-gold/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
          <img
            src={BRAND.logo}
            alt="Gorgeous Fashion Boutique"
            className="h-14 w-14 object-contain rounded-md"
          />
          <div className="hidden sm:block leading-tight">
            <div className="font-hindi text-burgundy text-lg">गॉर्जियस</div>
            <div className="text-[11px] tracking-[0.25em] uppercase text-ink/70">
              Fashion Boutique
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`text-sm uppercase tracking-[0.2em] transition-colors ${
                loc.pathname === l.to
                  ? "text-burgundy"
                  : "text-ink/70 hover:text-burgundy"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/book"
            data-testid="nav-book-cta"
            className="bg-burgundy text-beige px-6 py-2.5 text-xs tracking-[0.25em] uppercase hover:bg-burgundy-dark transition-colors"
          >
            Book Appointment
          </Link>
        </nav>

        <button
          data-testid="nav-mobile-toggle"
          className="md:hidden text-burgundy"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gold/30 bg-beige-light">
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-ink/80"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="bg-burgundy text-beige px-6 py-3 text-xs tracking-[0.25em] uppercase text-center"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
