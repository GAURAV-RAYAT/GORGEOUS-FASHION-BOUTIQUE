import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { waLink } from "../lib/api";

const SLIDES = [
  {
    img: "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg",
    eyebrow: "Bridal Season 2026",
    title: "Hand-crafted Lehengas",
    subtitle: "Book your private fitting",
    ctaLabel: "Book Appointment",
    ctaTo: "/book",
    align: "left",
  },
  {
    img: "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c",
    eyebrow: "Festive Radiance",
    title: "Heirloom Sarees & Gowns",
    subtitle: "Explore our atelier",
    ctaLabel: "View Gallery",
    ctaTo: "/gallery",
    align: "right",
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((i) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSel = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSel);
    onSel();
    const id = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <section data-testid="hero-carousel" className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((s, i) => (
            <div key={i} className="shrink-0 w-full relative">
              <div className="relative h-[70vh] md:h-[85vh] w-full">
                <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                <div className={`absolute inset-0 bg-gradient-to-r ${s.align === "left" ? "from-burgundy-deep/70 via-burgundy-deep/30 to-transparent" : "from-transparent via-burgundy-deep/30 to-burgundy-deep/70"}`} />
                <div className={`absolute inset-0 flex items-center ${s.align === "left" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-xl px-6 md:px-16 text-beige ${s.align === "right" ? "text-right" : "text-left"}`}>
                    <div className="text-xs md:text-sm uppercase tracking-[0.4em] text-gold mb-4">{s.eyebrow}</div>
                    <h2 className="font-display text-4xl md:text-6xl leading-[1.05] mb-4">{s.title}</h2>
                    <p className="text-base md:text-lg italic opacity-90 mb-8">{s.subtitle}</p>
                    <div className={`flex gap-3 flex-wrap ${s.align === "right" ? "justify-end" : ""}`}>
                      <Link to={s.ctaTo} className="bg-gold text-burgundy-deep px-8 py-3.5 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-all">{s.ctaLabel}</Link>
                      <a href={waLink()} target="_blank" rel="noreferrer" className="border border-beige text-beige px-8 py-3.5 text-xs uppercase tracking-[0.3em] hover:bg-beige hover:text-burgundy transition-all">WhatsApp</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)} aria-label={`Slide ${i + 1}`}
            className={`h-1 transition-all ${selected === i ? "w-10 bg-gold" : "w-6 bg-beige/60"}`} />
        ))}
      </div>
    </section>
  );
}
