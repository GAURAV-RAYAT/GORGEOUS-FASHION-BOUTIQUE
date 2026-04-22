import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { BRAND } from "../lib/api";

export default function Footer() {
  return (
    <footer
      data-testid="footer"
      className="bg-burgundy-deep text-beige mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="font-hindi text-3xl text-gold mb-2">गॉर्जियस</div>
          <div className="text-xs uppercase tracking-[0.3em] text-beige/70 mb-4">
            Fashion Boutique
          </div>
          <p className="text-sm text-beige/80 font-body leading-relaxed">
            {BRAND.tagline}. A Delhi atelier crafting bespoke sarees, lehengas,
            and gowns.
          </p>
        </div>

        <div>
          <div className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Explore
          </div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/gallery" className="hover:text-gold">Gallery</Link></li>
            <li><Link to="/book" className="hover:text-gold">Book Appointment</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Visit
          </div>
          <div className="flex items-start gap-3 text-sm text-beige/85">
            <MapPin size={16} className="mt-0.5 text-gold shrink-0" />
            <span>{BRAND.address}</span>
          </div>
        </div>

        <div>
          <div className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Connect
          </div>
          <div className="space-y-3 text-sm">
            <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 hover:text-gold">
              <Phone size={14} /> {BRAND.phone}
            </a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-gold break-all">
              <Mail size={14} /> {BRAND.email}
            </a>
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
              <Instagram size={14} /> Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gold/20 py-6 text-center text-xs text-beige/60 tracking-wider">
        © {new Date().getFullYear()} Gorgeous Fashion Boutique · Delhi ·{" "}
        <Link to="/admin/login" className="hover:text-gold" data-testid="footer-admin-link">Admin</Link>
      </div>
    </footer>
  );
}
