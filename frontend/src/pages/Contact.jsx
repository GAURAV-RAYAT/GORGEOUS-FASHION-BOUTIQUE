import { useState } from "react";
import { Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import api, { BRAND } from "../lib/api";
import useSeo from "../lib/useSeo";

export default function Contact() {
  useSeo({
    title: "Contact Us — Gorgeous Fashion Boutique | Govindpuri, Kalkaji, Delhi",
    description: "Visit Gorgeous Fashion Boutique at Govindpuri, Kalkaji, Street no. 8. Call +91 8587008027 or send a message.",
    path: "/contact",
  });
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error("Please fill name, phone and message");
      return;
    }
    setBusy(true);
    try {
      await api.post("/contact", { ...form, email: form.email || undefined });
      toast.success("Thank you! We've received your message.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) {
      toast.error("Could not send. Please try again or WhatsApp us.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="contact-page" className="min-h-screen bg-beige py-20">
      <Toaster position="top-center" richColors />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="gold-divider mb-4">Say Hello</div>
          <h1 className="font-display text-5xl md:text-6xl text-burgundy">Contact Us</h1>
          <p className="mt-4 text-ink/70 max-w-xl mx-auto">
            Visit our Delhi atelier or reach out — we'd love to craft something for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info + Map */}
          <div className="space-y-6">
            <div className="bg-beige-light border border-gold/40 p-8">
              <div className="gold-divider mb-6">Atelier</div>
              <div className="space-y-5 text-ink">
                <div className="flex items-start gap-4">
                  <MapPin className="text-burgundy mt-1 shrink-0" size={20} />
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-burgundy mb-1">Visit</div>
                    <div className="font-body">{BRAND.address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-burgundy mt-1 shrink-0" size={20} />
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-burgundy mb-1">Call</div>
                    <a href={`tel:${BRAND.phone}`} className="font-body hover:text-burgundy">{BRAND.phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="text-burgundy mt-1 shrink-0" size={20} />
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-burgundy mb-1">Email</div>
                    <a href={`mailto:${BRAND.email}`} className="font-body hover:text-burgundy break-all">{BRAND.email}</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gold/40 h-80 w-full overflow-hidden relative">
              <iframe
                title="map"
                src="https://www.google.com/maps?q=1338/8+Govind+Puri,+Kalkaji,+New+Delhi,+Delhi+110019&output=embed"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUqBggBEEUYOzIICAAQRRgnGDsyBggBEEUYOzIGCAIQIxgnMgcIAxAAGO8FMgoIBBAAGIAEGKIEMgoIBRAAGIAEGKIEMgoIBhAAGIAEGKIEMgcIBxAAGO8F0gEIMjY5OWowajSoAgGwAgHxBfhYEcXeSYSZ8QX4WBHF3kmEmQ&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KZGExfKm4Qw5MSNdWOxp_skY&daddr=1338/8+Govind+Puri,+Kalkaji,+New+Delhi,+Delhi+110019"
              target="_blank"
              rel="noreferrer"
              data-testid="directions-btn"
              className="inline-flex items-center justify-center gap-2 w-full bg-gold text-burgundy-deep py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-all"
            >
              <MapPin size={14} /> Get Directions on Google Maps
            </a>
          </div>

          {/* Form */}
          <form onSubmit={submit} data-testid="contact-form" className="bg-beige-light border border-gold/40 p-8 space-y-5">
            <div className="gold-divider mb-2">Send a Message</div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Name</label>
              <input
                data-testid="contact-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 font-body text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Phone</label>
              <input
                data-testid="contact-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 font-body text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Email (optional)</label>
              <input
                data-testid="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 font-body text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Message</label>
              <textarea
                data-testid="contact-message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 font-body text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <button
              type="submit"
              data-testid="contact-submit"
              disabled={busy}
              className="w-full bg-burgundy text-beige py-4 text-sm uppercase tracking-[0.3em] hover:bg-burgundy-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
