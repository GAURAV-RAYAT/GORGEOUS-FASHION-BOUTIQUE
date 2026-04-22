import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Star, Phone, Send, Loader2, ArrowRight, Scissors, Truck,
  ShieldCheck, Sparkles, HeartHandshake, MapPin,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import api, { BRAND, waLink } from "../lib/api";
import useSeo from "../lib/useSeo";
import { useSettings } from "../lib/settings";
import HeroCarousel from "../components/HeroCarousel";
import Carousel from "../components/Carousel";

const CATEGORIES = [
  { name: "Saree", image: "https://images.pexels.com/photos/36951400/pexels-photo-36951400.jpeg", tag: "Heritage Drape" },
  { name: "Lehenga", image: "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c", tag: "Bridal Couture" },
  { name: "Gown", image: "https://images.pexels.com/photos/36414504/pexels-photo-36414504.jpeg", tag: "Evening Elegance" },
];

const MOOD_TILES = [
  { title: "Festive Radiance", sub: "For weddings & celebrations", img: "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg", cat: "Lehenga" },
  { title: "Everyday Elegance", sub: "Light sarees & fusion wear", img: "https://images.pexels.com/photos/36951400/pexels-photo-36951400.jpeg", cat: "Saree" },
  { title: "Glam Soul", sub: "Cocktail gowns & party wear", img: "https://images.pexels.com/photos/36414504/pexels-photo-36414504.jpeg", cat: "Gown" },
  { title: "Free Spirit", sub: "Co-ord sets & contemporary", img: "https://images.pexels.com/photos/1457977/pexels-photo-1457977.jpeg", cat: "Gown" },
];

const COLLECTIONS = [
  { title: "Ethnic Sets with Dupatta", img: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807", body: "Traditional suits and dupatta sets are the heart of every Indian wardrobe. At Gorgeous Fashion Boutique, we tailor silk, chanderi, and cotton ensembles with intricate handwork — perfect for festivals, weddings, and family ceremonies.", cat: "Saree" },
  { title: "Bridal Lehengas", img: "https://images.pexels.com/photos/12062663/pexels-photo-12062663.jpeg", body: "From heritage reds to pastel contemporary palettes — our bridal lehengas are hand-embroidered in Delhi, custom-fit to every bride. Book a private atelier visit to design your one-of-a-kind wedding outfit.", cat: "Lehenga" },
  { title: "Designer Gowns", img: "https://images.pexels.com/photos/1457977/pexels-photo-1457977.jpeg", body: "Evening gowns, reception outfits, and cocktail silhouettes — crafted in silk, organza, and velvet with Indo-Western tailoring. Each gown is sculpted on the body for an impeccable fit.", cat: "Gown" },
];

const SEED_MEDIA = [
  { secure_url: "https://images.pexels.com/photos/30703866/pexels-photo-30703866.jpeg", category: "Saree", resource_type: "image" },
  { secure_url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807", category: "Saree", resource_type: "image" },
  { secure_url: "https://images.pexels.com/photos/1457977/pexels-photo-1457977.jpeg", category: "Gown", resource_type: "image" },
  { secure_url: "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg", category: "Lehenga", resource_type: "image" },
  { secure_url: "https://images.pexels.com/photos/12062663/pexels-photo-12062663.jpeg", category: "Lehenga", resource_type: "image" },
  { secure_url: "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c", category: "Lehenga", resource_type: "image" },
  { secure_url: "https://images.pexels.com/photos/36951400/pexels-photo-36951400.jpeg", category: "Saree", resource_type: "image" },
  { secure_url: "https://images.pexels.com/photos/36414504/pexels-photo-36414504.jpeg", category: "Gown", resource_type: "image" },
];

const STATS = [
  { n: "5000+", t: "Brides styled" },
  { n: "15+ Yrs", t: "Atelier heritage" },
  { n: "100%", t: "Custom tailoring" },
  { n: "Delhi", t: "Govindpuri, Kalkaji" },
];

const BADGES = [
  { icon: Scissors, title: "Made in Delhi", t: "Hand-crafted in our Kalkaji atelier" },
  { icon: HeartHandshake, title: "Free Consultation", t: "Private styling appointments" },
  { icon: Sparkles, title: "Easy Alterations", t: "Complimentary fittings included" },
  { icon: Truck, title: "Pan-India Courier", t: "Secure nationwide delivery" },
  { icon: ShieldCheck, title: "Trusted Boutique", t: "Featured across Delhi NCR" },
];

export default function Landing() {
  useSeo({
    title: "Gorgeous Fashion Boutique — Premium Sarees, Lehengas & Gowns in Kalkaji, Delhi",
    description: "गॉर्जियस Fashion Boutique — Delhi's boutique for bespoke bridal lehengas, designer sarees and custom gowns. Govindpuri, Kalkaji Metro, New Delhi 110019. Book an appointment.",
    path: "/",
  });
  const { settings } = useSettings();
  const [reviews, setReviews] = useState([]);
  const [media, setMedia] = useState([]);
  const [rvForm, setRvForm] = useState({ name: "", rating: 5, comment: "" });
  const [rvBusy, setRvBusy] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
    api.get("/media").then((r) => setMedia(r.data)).catch(() => {});
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rvForm.name || !rvForm.comment) { toast.error("Please add your name and review"); return; }
    setRvBusy(true);
    try {
      const { data } = await api.post("/reviews", rvForm);
      setReviews((prev) => [data, ...prev]);
      setRvForm({ name: "", rating: 5, comment: "" });
      toast.success("Thank you for your review!");
    } catch { toast.error("Could not submit review"); }
    finally { setRvBusy(false); }
  };

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post("/contact", { name: "Newsletter", phone: "-", email, message: "Newsletter signup" });
      toast.success("Subscribed. Thank you!");
      setEmail("");
    } catch { toast.error("Could not subscribe"); }
  };

  const featuredMedia = media.filter((m) => m.featured);
  const featured = (featuredMedia.length ? featuredMedia : (media.length ? media : SEED_MEDIA)).slice(0, 10);
  const reels = media.filter((m) => m.resource_type === "video");

  return (
    <div data-testid="landing-page" className="bg-beige">
      <Toaster position="top-center" richColors />

      {/* HERO */}
      <HeroCarousel />

      {/* FEATURED COLLECTION CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20" data-testid="featured-section">
        <div className="text-center mb-8 md:mb-12">
          <div className="gold-divider mb-3">{settings?.signature_subtitle || "New Season 2026"}</div>
          <h2 className="font-display text-3xl md:text-5xl text-burgundy">{settings?.signature_title || "Signature Collection"}</h2>
        </div>
        <Carousel testId="featured-carousel" slidesToShow={{ base: 2, md: 3, lg: 4 }}>
          {featured.map((m, i) => (
            <Link key={i} to={`/gallery?cat=${m.category || "All"}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-beige-light border border-gold/20">
                {m.resource_type === "video" ? (
                  <video src={m.secure_url} muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={m.secure_url} alt={m.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute top-3 left-3 bg-beige/90 text-burgundy text-[10px] uppercase tracking-widest px-2 py-1">
                  {m.category}
                </div>
              </div>
              <div className="pt-3 text-xs md:text-sm font-body text-ink uppercase tracking-wider">{m.category} · Handcrafted</div>
              <div className="text-[11px] text-ink/60 mt-0.5">Custom fit · Delhi atelier</div>
            </Link>
          ))}
        </Carousel>
        <div className="text-center mt-10">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-burgundy border-b border-gold pb-1 hover:text-burgundy-dark">
            View All <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* MOOD TILES — 4 banners like byshree */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 md:pb-20" data-testid="mood-section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {MOOD_TILES.map((m, i) => (
            <Link key={i} to={`/gallery?cat=${m.cat}`} className="group relative aspect-[4/5] md:aspect-[4/5] overflow-hidden">
              <img src={m.img} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep/80 via-burgundy-deep/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-beige">
                <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold mb-1">{m.sub}</div>
                <div className="font-display text-lg md:text-2xl leading-tight">{m.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-burgundy-deep text-beige py-10 md:py-14" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="font-display text-2xl md:text-4xl text-gold mb-1">{s.n}</div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-beige/80">{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY INFO BLOCKS (alternating image/text like byshree) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-14 md:space-y-20" data-testid="collections-section">
        {COLLECTIONS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="aspect-[4/5] md:aspect-square overflow-hidden border border-gold/30">
              <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="gold-divider mb-4">Discover</div>
              <h3 className="font-display text-3xl md:text-4xl text-burgundy mb-5">{c.title}</h3>
              <p className="text-ink/85 font-body leading-relaxed mb-6">{c.body}</p>
              <Link to={`/gallery?cat=${c.cat}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-burgundy border-b border-gold pb-1 hover:text-burgundy-dark">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      {/* REELS CAROUSEL */}
      {reels.length > 0 && (
        <section className="bg-burgundy-deep text-beige py-14 md:py-20" data-testid="reels-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="gold-divider mb-3" style={{ color: "#C8A96A" }}>Moving Moments</div>
              <h2 className="font-display text-3xl md:text-5xl gold-shimmer">Reels & Runway</h2>
            </div>
            <Carousel testId="reels-carousel" slidesToShow={{ base: 2, md: 3, lg: 4 }}>
              {reels.map((v, i) => (
                <div key={i} className="aspect-[9/16] overflow-hidden border border-gold/30 bg-black/40">
                  <video src={v.secure_url} className="w-full h-full object-cover" controls muted playsInline />
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* TRUST BADGES */}
      <section className="bg-beige-light border-y border-gold/30 py-10" data-testid="badges-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 text-center">
          {BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <Icon className="text-burgundy" size={24} />
                <div className="font-display text-sm md:text-base text-burgundy">{b.title}</div>
                <div className="text-[10px] md:text-xs text-ink/70 leading-snug">{b.t}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* REVIEWS + LEAVE A REVIEW */}
      <section className="py-14 md:py-20 bg-beige" data-testid="reviews-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <div className="gold-divider mb-3">Kind Words</div>
            <h2 className="font-display text-3xl md:text-5xl text-burgundy">Loved by our muses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-beige-light border border-gold/40 p-6 md:p-8"
              >
                <div className="flex gap-1 text-gold mb-4">
                  {Array.from({ length: r.rating || 5 }).map((_, k) => (
                    <Star key={k} size={14} fill="#C8A96A" strokeWidth={0} />
                  ))}
                </div>
                <p className="font-display italic text-ink text-base md:text-lg leading-relaxed mb-5">“{r.comment}”</p>
                <div className="text-xs tracking-[0.25em] uppercase text-burgundy">— {r.name}</div>
              </motion.div>
            ))}
          </div>

          {/* Leave a review form */}
          <div className="mt-12 md:mt-16 max-w-2xl mx-auto bg-beige-light border border-gold/40 p-6 md:p-8" data-testid="review-form">
            <div className="gold-divider mb-3">Share Your Experience</div>
            <h3 className="font-display text-2xl md:text-3xl text-burgundy mb-5">Leave a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <input data-testid="review-name" placeholder="Your Name" value={rvForm.name} onChange={(e) => setRvForm({ ...rvForm, name: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy" />
              <div className="flex items-center gap-2" data-testid="review-rating">
                <span className="text-xs uppercase tracking-[0.25em] text-burgundy mr-2">Rating</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRvForm({ ...rvForm, rating: n })} aria-label={`${n} stars`}>
                    <Star size={26} fill={n <= rvForm.rating ? "#C8A96A" : "transparent"} stroke="#C8A96A" />
                  </button>
                ))}
              </div>
              <textarea data-testid="review-comment" rows={4} placeholder="Your review" value={rvForm.comment}
                onChange={(e) => setRvForm({ ...rvForm, comment: e.target.value })}
                className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy" />
              <button type="submit" data-testid="review-submit" disabled={rvBusy}
                className="w-full bg-burgundy text-beige py-3 text-xs uppercase tracking-[0.3em] hover:bg-burgundy-dark disabled:opacity-60 flex items-center justify-center gap-2">
                {rvBusy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Post Review
              </button>
              <p className="text-[10px] text-center text-ink/60">Your review appears instantly.</p>
            </form>
          </div>
        </div>
      </section>

      {/* NEWSLETTER + INSTAGRAM CTA */}
      <section className="bg-burgundy text-beige py-14 md:py-20" data-testid="newsletter-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gold-divider mb-3" style={{ color: "#C8A96A" }}>Keep Me Updated</div>
          <h2 className="font-display text-3xl md:text-5xl gold-shimmer mb-4">Newsletter</h2>
          <p className="text-beige/85 mb-8">Exclusive offers, new drops, and styling tips — straight to your inbox.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input data-testid="newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email" className="flex-1 bg-transparent border border-gold/60 px-4 py-3 text-beige placeholder:text-beige/50 focus:outline-none focus:border-gold" />
            <button type="submit" data-testid="newsletter-submit" className="bg-gold text-burgundy-deep px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark">
              Subscribe
            </button>
          </form>
          <div className="mt-10">
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold border-b border-gold/50 pb-1 hover:text-beige">
              Visit Our Instagram @gorgeousfashionboutique
            </a>
          </div>
        </div>
      </section>

      {/* SEO TEXT BLOCK */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20" data-testid="seo-section">
        <h2 className="font-display text-2xl md:text-4xl text-burgundy mb-6">
          Your Destination for Bespoke Indian Couture in Delhi
        </h2>
        <div className="space-y-4 text-ink/85 font-body text-sm md:text-base leading-relaxed">
          <p>
            At <strong>Gorgeous Fashion Boutique (गॉर्जियस Fashion Boutique)</strong>, we craft handmade sarees, bridal lehengas, and designer gowns from our atelier at 1338/8 Govind Puri, Kalkaji, New Delhi. Each piece is designed around the wearer — measured, fitted, and hand-embroidered by our in-house karigars.
          </p>
          <p>
            <strong>Bridal lehengas near me</strong> — If you're searching for a bridal boutique in Delhi NCR, our team specialises in custom lehenga design: heritage reds, pastel palettes, contemporary sculpted silhouettes, and Indo-Western fusion. We offer private styling consultations, multiple fittings, and delivery across India.
          </p>
          <p>
            <strong>Saree boutique in Kalkaji</strong> — From chanderi and kanjivaram weaves to hand-painted modern drapes, our saree collection is curated for festivals, weddings, and everyday grace. Pre-stitched blouses and dupatta sets available.
          </p>
          <p>
            <strong>Gown tailor in South Delhi</strong> — Evening gowns, reception outfits, cocktail silhouettes, and sangeet dresses — tailored in organza, silk, velvet, and georgette. Book a visit to the atelier to view our fabric library and embroidery samples.
          </p>
          <p>
            Visit us at <strong>Govindpuri, Kalkaji Metro No. 08, New Delhi 110019</strong>, call <a href={`tel:${BRAND.phone}`} className="text-burgundy underline">{BRAND.phone}</a>, or <a href={waLink()} target="_blank" rel="noreferrer" className="text-burgundy underline">chat on WhatsApp</a> to begin your design journey.
          </p>
        </div>

        {/* Popular searches */}
        <div className="mt-10 pt-8 border-t border-gold/30 text-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-burgundy mb-4">Popular Searches</div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-ink/75">
            {[
              "bridal lehenga delhi", "saree boutique kalkaji", "custom gown tailor",
              "chanderi suit set", "kanjivaram saree", "reception gown delhi",
              "cocktail dress tailor", "sangeet lehenga", "wedding saree delhi",
              "indo western gown", "pastel lehenga", "designer blouse delhi",
              "boutique near me", "govindpuri tailor", "kalkaji fashion designer",
            ].map((t, i, a) => (
              <span key={i}>
                <Link to="/gallery" className="hover:text-burgundy">{t}</Link>
                {i < a.length - 1 && <span className="text-gold mx-1">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="bg-beige-light border-t border-gold/30 py-12" data-testid="quick-contact">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="text-burgundy" size={22} />
            <div className="text-xs uppercase tracking-[0.3em] text-burgundy">Visit</div>
            <p className="text-sm text-ink/85">{BRAND.address}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Phone className="text-burgundy" size={22} />
            <div className="text-xs uppercase tracking-[0.3em] text-burgundy">Call</div>
            <a href={`tel:${BRAND.phone}`} className="text-sm text-ink/85 hover:text-burgundy">{BRAND.phone}</a>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="text-burgundy" size={22} />
            <div className="text-xs uppercase tracking-[0.3em] text-burgundy">Reach Us</div>
            <Link to="/contact" className="text-sm text-ink/85 hover:text-burgundy">Send a Message →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
