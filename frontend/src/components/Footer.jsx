import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { BRAND } from "../lib/api";
import { useSettings } from "../lib/settings";

export default function Footer() {
  const { settings } = useSettings();
  const s = {
    tagline: settings?.tagline || BRAND.tagline,
    address: settings?.address || BRAND.address,
    phone: settings?.phone || BRAND.phone,
    email: settings?.email || BRAND.email,
    instagram: settings?.instagram_url || BRAND.instagram,
  };
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
            {s.tagline}. A Delhi atelier crafting bespoke sarees, lehengas,
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
            <li>
              <Link
                to="/admin/login"
                data-testid="footer-admin-login"
                className="hover:text-gold inline-flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Admin Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Visit
          </div>
          <div className="flex items-start gap-3 text-sm text-beige/85">
            <MapPin size={16} className="mt-0.5 text-gold shrink-0" />
            <span>{s.address}</span>
          </div>
        </div>

        <div>
          <div className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Connect
          </div>
          <div className="space-y-3 text-sm">
            <a href={`tel:${s.phone}`} className="flex items-center gap-2 hover:text-gold">
              <Phone size={14} /> {s.phone}
            </a>
            <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-gold break-all">
              <Mail size={14} /> {s.email}
            </a>
            <a href={s.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
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
