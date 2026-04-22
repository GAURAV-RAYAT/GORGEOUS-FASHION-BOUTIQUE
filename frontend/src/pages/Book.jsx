import { useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { toast, Toaster } from "sonner";
import { Loader2, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import api, { BRAND, waLink } from "../lib/api";
import useSeo from "../lib/useSeo";

const TIME_SLOTS = ["10:30", "11:30", "12:30", "14:00", "15:30", "17:00", "18:30"];
const CATEGORIES = ["Saree", "Lehenga", "Gown", "Consultation"];

export default function Book() {
  useSeo({
    title: "Book an Appointment — Gorgeous Fashion Boutique Delhi",
    description: "Reserve a private styling appointment at Gorgeous Fashion Boutique, Kalkaji. Choose date & time, we'll confirm on WhatsApp.",
    path: "/book",
  });
  const [date, setDate] = useState(new Date(Date.now() + 24 * 3600 * 1000));
  const [time, setTime] = useState("11:30");
  const [category, setCategory] = useState("Lehenga");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !date || !time) {
      toast.error("Please fill name, phone, date and time");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        date: format(date, "yyyy-MM-dd"),
        time,
        category,
        notes: form.notes || undefined,
      };
      const { data } = await api.post("/bookings", payload);
      setConfirmed(data);
      toast.success("Appointment booked! Opening WhatsApp to confirm…");
      const msg = `Hi, I've booked an appointment:\n\nName: ${data.name}\nDate: ${data.date} at ${data.time}\nFor: ${data.category}\nPhone: ${data.phone}`;
      setTimeout(() => window.open(waLink(msg), "_blank"), 800);
    } catch (e) {
      toast.error("Booking failed. Please try again or call us.");
    } finally {
      setBusy(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-6 py-20" data-testid="booking-confirmed">
        <div className="max-w-xl w-full bg-beige-light border border-gold/40 p-10 text-center">
          <CalendarCheck className="mx-auto text-burgundy mb-4" size={48} />
          <div className="gold-divider mb-4">Booked</div>
          <h1 className="font-display text-4xl text-burgundy mb-3">Thank you, {confirmed.name}!</h1>
          <p className="text-ink/80 mb-6">
            Your appointment for <strong>{confirmed.category}</strong> is set for{" "}
            <strong>{confirmed.date}</strong> at <strong>{confirmed.time}</strong>.
          </p>
          <p className="text-sm text-ink/60 mb-8">
            We've sent a confirmation email and opened WhatsApp for instant confirmation.
          </p>
          <a
            href={waLink(`Hi, confirming my appointment on ${confirmed.date} at ${confirmed.time} for ${confirmed.category}`)}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-burgundy text-beige px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-burgundy-dark"
          >
            Open WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="booking-page" className="min-h-screen bg-beige py-20">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="gold-divider mb-4">Private Appointments</div>
          <h1 className="font-display text-5xl md:text-6xl text-burgundy">Book a Visit</h1>
          <p className="mt-4 text-ink/70 max-w-xl mx-auto">
            Reserve a styling session at our Delhi atelier. Bring your inspiration — we'll bring the fabric.
          </p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Calendar + slots */}
          <div className="bg-beige-light border border-gold/40 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-burgundy mb-4">Choose Date</div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border border-gold/30 bg-beige"
              data-testid="booking-calendar"
            />
            <div className="text-xs uppercase tracking-[0.25em] text-burgundy mt-6 mb-3">Choose Time</div>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  type="button"
                  key={t}
                  data-testid={`slot-${t}`}
                  onClick={() => setTime(t)}
                  className={`py-2 text-xs tracking-widest border transition-all ${
                    time === t
                      ? "bg-burgundy text-beige border-burgundy"
                      : "bg-transparent text-ink border-gold/40 hover:bg-gold/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="bg-beige-light border border-gold/40 p-6 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Category</div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    data-testid={`cat-${c.toLowerCase()}`}
                    onClick={() => setCategory(c)}
                    className={`py-2.5 text-xs uppercase tracking-[0.25em] border transition-all ${
                      category === c
                        ? "bg-burgundy text-beige border-burgundy"
                        : "bg-transparent text-ink border-gold/40 hover:bg-gold/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Name</label>
              <input
                data-testid="book-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Phone</label>
              <input
                data-testid="book-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Email (optional)</label>
              <input
                data-testid="book-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Notes</label>
              <textarea
                data-testid="book-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
              />
            </div>

            <button
              type="submit"
              data-testid="book-submit"
              disabled={busy}
              className="w-full bg-burgundy text-beige py-4 text-sm uppercase tracking-[0.3em] hover:bg-burgundy-dark disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : null}
              Confirm Booking
            </button>
            <p className="text-xs text-center text-ink/60">
              After booking, WhatsApp opens automatically for instant confirmation with {BRAND.phone}.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
