import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Phone, MessageCircle, Send, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import api, { BRAND, waLink } from "../lib/api";

const CATEGORIES = [
  {
    name: "Saree",
    image:
      "https://images.pexels.com/photos/36951400/pexels-photo-36951400.jpeg",
    desc: "Draped heritage",
  },
  {
    name: "Lehenga",
    image: "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c",
    desc: "Bridal couture",
  },
  {
    name: "Gown",
    image:
      "https://images.pexels.com/photos/36414504/pexels-photo-36414504.jpeg",
    desc: "Evening elegance",
  },
];

const HERO_IMAGES = [
  "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg",
  "https://images.pexels.com/photos/12062663/pexels-photo-12062663.jpeg",
];

const GALLERY_SEED = [
  { url: "https://images.pexels.com/photos/30703866/pexels-photo-30703866.jpeg", category: "Saree" },
  { url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807", category: "Saree" },
  { url: "https://images.pexels.com/photos/1457977/pexels-photo-1457977.jpeg", category: "Gown" },
  { url: "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg", category: "Lehenga" },
  { url: "https://images.pexels.com/photos/12062663/pexels-photo-12062663.jpeg", category: "Lehenga" },
  { url: "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c", category: "Lehenga" },
];

export default function Landing() {
  const [reviews, setReviews] = useState([]);
  const [media, setMedia] = useState([]);
  const [rvForm, setRvForm] = useState({ name: "", rating: 5, comment: "" });
  const [rvBusy, setRvBusy] = useState(false);

  useEffect(() => {
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
    api.get("/media").then((r) => setMedia(r.data)).catch(() => {});
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rvForm.name || !rvForm.comment) {
      toast.error("Please add your name and review");
      return;
    }
    setRvBusy(true);
    try {
      const { data } = await api.post("/reviews", rvForm);
      setReviews((prev) => [data, ...prev]);
      setRvForm({ name: "", rating: 5, comment: "" });
      toast.success("Thank you for your review!");
    } catch {
      toast.error("Could not submit review");
    } finally {
      setRvBusy(false);
    }
  };

  const previewMedia = media.slice(0, 6);
  const videoItems = media.filter((m) => m.resource_type === "video").slice(0, 3);

  return (
    <div data-testid="landing-page" className="bg-beige">
      <Toaster position="top-center" richColors />
      {/* HERO */}
      <section className="relative min-h-[92vh] paisley-bg overflow-hidden noise-overlay">
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:block relative">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              src={HERO_IMAGES[0]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-beige/30 via-transparent to-beige" />
          </div>
          <div className="hidden md:block relative">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              src={HERO_IMAGES[1]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-beige/30 via-transparent to-beige" />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="gold-divider mb-6">DELHI · EST.</div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl text-burgundy leading-[1.05] mb-5"
          >
            <span className="font-hindi block text-4xl md:text-6xl mb-2">गॉर्जियस</span>
            Fashion Boutique
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl italic text-ink/80 font-display mb-10"
          >
            “{BRAND.tagline}”
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/book"
              data-testid="hero-book-btn"
              className="group bg-burgundy text-beige px-10 py-4 text-sm tracking-[0.3em] uppercase hover:bg-burgundy-dark transition-all flex items-center justify-center gap-2"
            >
              Book Appointment
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={waLink()}
              target="_blank"
              rel="noreferrer"
              data-testid="hero-whatsapp-btn"
              className="bg-transparent text-burgundy border border-gold hover:bg-gold/10 px-10 py-4 text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> WhatsApp Chat
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-beige" />
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-24" data-testid="categories-section">
        <div className="text-center mb-16">
          <div className="gold-divider mb-4">Signature Collections</div>
          <h2 className="font-display text-4xl md:text-5xl text-burgundy">
            Designed for every occasion
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative arch-card aspect-[3/4] cursor-pointer border border-gold/40"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep/90 via-burgundy/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-center">
                <div className="text-gold text-xs tracking-[0.35em] uppercase mb-2">
                  {c.desc}
                </div>
                <h3 className="font-display text-3xl text-beige mb-4">{c.name}</h3>
                <Link
                  to={`/gallery?cat=${c.name}`}
                  data-testid={`category-${c.name.toLowerCase()}`}
                  className="inline-flex items-center gap-2 text-beige text-xs tracking-[0.25em] uppercase border-b border-gold pb-1 hover:text-gold"
                >
                  Explore <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* REELS / VIDEOS */}
      <section className="bg-burgundy-deep text-beige py-24" data-testid="reels-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="gold-divider mb-4" style={{ color: "#C8A96A" }}>
              Moving Moments
            </div>
            <h2 className="font-display text-4xl md:text-5xl gold-shimmer">
              Reels & Runway
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(videoItems.length ? videoItems : Array(3).fill(null)).map((v, i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-xl border border-gold/30 overflow-hidden bg-black/40 relative group"
              >
                {v ? (
                  <video
                    src={v.secure_url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-beige/60 text-xs tracking-widest uppercase p-6 text-center">
                    Reels will appear here once uploaded by the atelier.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 py-24" data-testid="gallery-preview">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="gold-divider mb-3">From the Atelier</div>
            <h2 className="font-display text-4xl md:text-5xl text-burgundy">
              Premium Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-xs tracking-[0.3em] uppercase text-burgundy border-b border-gold pb-1 hover:text-burgundy-dark"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(previewMedia.length ? previewMedia : GALLERY_SEED).slice(0, 6).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-lg border border-gold/30 ${
                i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"
              }`}
            >
              {m.resource_type === "video" ? (
                <video src={m.secure_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
              ) : (
                <img
                  src={m.secure_url || m.url}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-beige/90 text-burgundy px-2 py-1">
                {m.category}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-beige-light py-24" data-testid="reviews-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="gold-divider mb-4">Kind Words</div>
            <h2 className="font-display text-4xl md:text-5xl text-burgundy">
              Loved by our muses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-beige border border-gold/40 p-8 relative"
              >
                <div className="flex gap-1 text-gold mb-4">
                  {Array.from({ length: r.rating || 5 }).map((_, k) => (
                    <Star key={k} size={16} fill="#C8A96A" strokeWidth={0} />
                  ))}
                </div>
                <p className="font-display italic text-ink text-lg leading-relaxed mb-6">
                  “{r.comment}”
                </p>
                <div className="text-xs tracking-[0.25em] uppercase text-burgundy">
                  — {r.name}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Leave a Review */}
          <div className="mt-16 max-w-2xl mx-auto bg-beige border border-gold/40 p-8" data-testid="review-form">
            <div className="gold-divider mb-4">Share Your Experience</div>
            <h3 className="font-display text-3xl text-burgundy mb-6">Leave a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Your Name</label>
                <input
                  data-testid="review-name"
                  value={rvForm.name}
                  onChange={(e) => setRvForm({ ...rvForm, name: e.target.value })}
                  className="w-full bg-beige-light border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Rating</label>
                <div className="flex gap-2" data-testid="review-rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setRvForm({ ...rvForm, rating: n })}
                      className="p-1"
                      aria-label={`${n} stars`}
                    >
                      <Star
                        size={28}
                        fill={n <= rvForm.rating ? "#C8A96A" : "transparent"}
                        stroke="#C8A96A"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Your Review</label>
                <textarea
                  data-testid="review-comment"
                  rows={4}
                  value={rvForm.comment}
                  onChange={(e) => setRvForm({ ...rvForm, comment: e.target.value })}
                  className="w-full bg-beige-light border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
                />
              </div>
              <button
                type="submit"
                data-testid="review-submit"
                disabled={rvBusy}
                className="w-full bg-burgundy text-beige py-3 text-sm uppercase tracking-[0.3em] hover:bg-burgundy-dark disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {rvBusy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Post Review
              </button>
              <p className="text-xs text-center text-ink/60">
                Your review appears instantly on this page.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* INSTAGRAM STRIP */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center" data-testid="instagram-section">
        <div className="gold-divider mb-4">@gorgeousfashionboutique</div>
        <h2 className="font-display text-4xl md:text-5xl text-burgundy mb-4">
          Follow the Atelier
        </h2>
        <p className="text-ink/80 font-body max-w-xl mx-auto mb-10">
          Daily inspiration, behind-the-scenes stitches, and new launches on Instagram.
        </p>
        <a
          href={BRAND.instagram}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-gold text-burgundy-deep px-10 py-4 text-sm tracking-[0.3em] uppercase hover:bg-gold-dark transition-all"
        >
          Visit Instagram
        </a>
      </section>

      {/* QUICK CONTACT */}
      <section className="bg-burgundy text-beige py-16" data-testid="quick-contact">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Visit</div>
            <p className="text-sm">{BRAND.address}</p>
          </div>
          <div>
            <div className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Call</div>
            <a href={`tel:${BRAND.phone}`} className="text-sm hover:text-gold flex items-center justify-center gap-2">
              <Phone size={14} /> {BRAND.phone}
            </a>
          </div>
          <div>
            <div className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Reach Us</div>
            <Link to="/contact" className="text-sm hover:text-gold">
              Send a Message →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
