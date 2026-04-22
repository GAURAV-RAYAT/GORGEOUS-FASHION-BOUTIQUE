import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ children, slidesToShow = { base: 2, md: 3, lg: 4 }, testId }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, slidesToScroll: 1 });
  const [prev, setPrev] = useState(false);
  const [next, setNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrev(emblaApi.canScrollPrev());
    setNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Static maps so Tailwind JIT detects classes at build time
  const BASE = { 1: "basis-full", 2: "basis-1/2", 3: "basis-1/3", 4: "basis-1/4" };
  const MD = { 1: "md:basis-full", 2: "md:basis-1/2", 3: "md:basis-1/3", 4: "md:basis-1/4" };
  const LG = { 1: "lg:basis-full", 2: "lg:basis-1/2", 3: "lg:basis-1/3", 4: "lg:basis-1/4", 5: "lg:basis-1/5" };
  const basis = `${BASE[slidesToShow.base] || "basis-1/2"} ${MD[slidesToShow.md] || "md:basis-1/3"} ${LG[slidesToShow.lg] || "lg:basis-1/4"}`;

  return (
    <div className="relative" data-testid={testId}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-6">
          {children.map((child, i) => (
            <div key={i} className={`shrink-0 ${basis} min-w-0`}>
              {child}
            </div>
          ))}
        </div>
      </div>
      {(prev || next) && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!prev}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 bg-beige border border-gold/40 text-burgundy h-10 w-10 flex items-center justify-center hover:bg-gold hover:text-burgundy-deep disabled:opacity-30 disabled:cursor-not-allowed z-10 shadow"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!next}
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 bg-beige border border-gold/40 text-burgundy h-10 w-10 flex items-center justify-center hover:bg-gold hover:text-burgundy-deep disabled:opacity-30 disabled:cursor-not-allowed z-10 shadow"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
