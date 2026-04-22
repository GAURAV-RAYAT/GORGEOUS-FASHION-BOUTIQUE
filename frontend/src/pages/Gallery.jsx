import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";

const FILTERS = ["All", "Saree", "Lehenga", "Gown", "Reel"];

const SEED = [
  { id: "s1", secure_url: "https://images.pexels.com/photos/36951400/pexels-photo-36951400.jpeg", resource_type: "image", category: "Saree" },
  { id: "s2", secure_url: "https://images.pexels.com/photos/30703866/pexels-photo-30703866.jpeg", resource_type: "image", category: "Saree" },
  { id: "s3", secure_url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807", resource_type: "image", category: "Saree" },
  { id: "l1", secure_url: "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c", resource_type: "image", category: "Lehenga" },
  { id: "l2", secure_url: "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg", resource_type: "image", category: "Lehenga" },
  { id: "l3", secure_url: "https://images.pexels.com/photos/12062663/pexels-photo-12062663.jpeg", resource_type: "image", category: "Lehenga" },
  { id: "g1", secure_url: "https://images.pexels.com/photos/36414504/pexels-photo-36414504.jpeg", resource_type: "image", category: "Gown" },
  { id: "g2", secure_url: "https://images.pexels.com/photos/1457977/pexels-photo-1457977.jpeg", resource_type: "image", category: "Gown" },
];

export default function Gallery() {
  const loc = useLocation();
  const initial = new URLSearchParams(loc.search).get("cat") || "All";
  const [filter, setFilter] = useState(initial);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/media").then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);

  const list = useMemo(() => {
    const base = items.length ? items : SEED;
    if (filter === "All") return base;
    if (filter === "Reel") return base.filter((m) => m.resource_type === "video");
    return base.filter((m) => m.category === filter);
  }, [items, filter]);

  return (
    <div data-testid="gallery-page" className="min-h-screen bg-beige py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="gold-divider mb-4">Our Creations</div>
          <h1 className="font-display text-5xl md:text-6xl text-burgundy">Gallery</h1>
          <p className="mt-4 text-ink/70 max-w-xl mx-auto">
            A living lookbook of our handcrafted pieces — from bridal lehengas to evening gowns.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12" data-testid="gallery-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 text-xs uppercase tracking-[0.25em] border transition-all ${
                filter === f
                  ? "bg-burgundy text-beige border-burgundy"
                  : "bg-transparent text-burgundy border-gold hover:bg-gold/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((m, i) => (
            <motion.div
              key={m.id || i}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
              className="group relative overflow-hidden rounded-lg border border-gold/30 bg-beige-light aspect-[3/4]"
            >
              {m.resource_type === "video" ? (
                <video src={m.secure_url} className="w-full h-full object-cover" controls muted playsInline />
              ) : (
                <img
                  src={m.secure_url}
                  alt={m.title || m.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-beige/90 text-burgundy px-2 py-1">
                {m.category}
              </div>
            </motion.div>
          ))}
        </div>

        {list.length === 0 && (
          <div className="text-center text-ink/60 py-20">No items in this category yet.</div>
        )}
      </div>
    </div>
  );
}
