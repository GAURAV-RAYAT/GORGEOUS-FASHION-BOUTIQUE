import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  Upload, Image as ImgIcon, Film, LogOut, Trash2, Calendar,
  MessageSquare, Loader2, CheckCircle2, Settings as SettingsIcon,
  Star, KeyRound, Layout as LayoutIcon, Save, Plus, X,
} from "lucide-react";
import api, { BRAND } from "../lib/api";
import { useSettings } from "../lib/settings";

const EMPTY_SLIDE = {
  image: "", eyebrow: "", title: "", subtitle: "",
  cta_label: "Book Appointment", cta_link: "/book", align: "left",
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const { refresh: refreshSettings } = useSettings();
  const [tab, setTab] = useState("upload");
  const [media, setMedia] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Saree");
  const [settings, setSettings] = useState(null);
  const [pwd, setPwd] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwdBusy, setPwdBusy] = useState(false);

  const token = localStorage.getItem("gfb_token");
  const email = localStorage.getItem("gfb_email");

  useEffect(() => {
    if (!token) { nav("/admin/login"); return; }
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const [m, b, c, s, r] = await Promise.all([
        api.get("/media"),
        api.get("/bookings"),
        api.get("/contact"),
        api.get("/settings"),
        api.get("/reviews/all"),
      ]);
      setMedia(m.data); setBookings(b.data); setMessages(c.data);
      setSettings(s.data); setReviews(r.data);
    } catch (e) {
      if (e?.response?.status === 401) { localStorage.clear(); nav("/admin/login"); }
    }
  };

  const logout = () => { localStorage.clear(); nav("/admin/login"); };

  // ---- Cloudinary upload helper ----
  const cloudinaryUpload = async (file) => {
    const isVideo = file.type.startsWith("video/");
    const resource_type = isVideo ? "video" : "image";
    const sig = await api.get("/cloudinary/signature", {
      params: { resource_type, folder: "gorgeous/gallery" },
    }).then((r) => r.data);

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.api_key);
    form.append("timestamp", sig.timestamp);
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resource_type}/upload`;
    const res = await fetch(endpoint, { method: "POST", body: form });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
    return { secure_url: data.secure_url, public_id: data.public_id, resource_type };
  };

  // ---- Gallery upload ----
  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const up = await cloudinaryUpload(file);
      await api.post("/media", {
        public_id: up.public_id, secure_url: up.secure_url, resource_type: up.resource_type,
        category: up.resource_type === "video" ? "Reel" : category,
      });
      toast.success("Uploaded");
      refresh();
    } catch (e) { toast.error(e.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = "";
  };

  const deleteMedia = async (id) => {
    if (!confirm("Delete this media?")) return;
    await api.delete(`/media/${id}`);
    toast.success("Deleted"); refresh();
  };

  const setBookingStatus = async (id, status) => {
    await api.patch(`/bookings/${id}`, null, { params: { status } });
    refresh();
  };

  const toggleFeatured = async (m) => {
    await api.patch(`/media/${m.id}`, { featured: !m.featured });
    toast.success(m.featured ? "Removed from Signature Collection" : "Added to Signature Collection");
    refresh();
  };

  // ---- Reviews moderation ----
  const toggleReview = async (r) => {
    await api.patch(`/reviews/${r.id}`, { approved: !r.approved });
    refresh();
  };
  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e?.response?.data?.detail || e?.message || "Delete failed");
    }
  };

  // ---- Settings ----
  const saveSettings = async (e) => {
    e?.preventDefault?.();
    await api.patch("/settings", settings);
    toast.success("Settings saved");
    refreshSettings();
  };

  const updateSlide = (idx, field, value) => {
    const slides = [...(settings.hero_slides || [])];
    slides[idx] = { ...slides[idx], [field]: value };
    setSettings({ ...settings, hero_slides: slides });
  };
  const addSlide = () => {
    const slides = [...(settings.hero_slides || []), { ...EMPTY_SLIDE }];
    setSettings({ ...settings, hero_slides: slides });
  };
  const removeSlide = (idx) => {
    const slides = [...(settings.hero_slides || [])];
    slides.splice(idx, 1);
    setSettings({ ...settings, hero_slides: slides });
  };

  const slideImageUpload = async (idx, file) => {
    try {
      const up = await cloudinaryUpload(file);
      updateSlide(idx, "image", up.secure_url);
      toast.success("Image uploaded — click Save to publish");
    } catch (e) { toast.error(e.message || "Upload failed"); }
  };

  const logoUpload = async (file) => {
    try {
      const up = await cloudinaryUpload(file);
      setSettings({ ...settings, logo_url: up.secure_url });
      toast.success("Logo uploaded — click Save to publish");
    } catch (e) { toast.error(e.message || "Upload failed"); }
  };

  // ---- Password ----
  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.new_password.length < 6) { toast.error("New password must be 6+ chars"); return; }
    if (pwd.new_password !== pwd.confirm) { toast.error("Passwords do not match"); return; }
    setPwdBusy(true);
    try {
      await api.post("/auth/change-password", {
        current_password: pwd.current_password,
        new_password: pwd.new_password,
      });
      toast.success("Password changed");
      setPwd({ current_password: "", new_password: "", confirm: "" });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not change password");
    } finally { setPwdBusy(false); }
  };

  const tabs = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "media", label: "Gallery", icon: ImgIcon },
    { id: "hero", label: "Hero & Logo", icon: LayoutIcon },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Site Info", icon: SettingsIcon },
    { id: "password", label: "Password", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-beige" data-testid="admin-dashboard">
      <Toaster position="top-center" richColors />

      {/* Sidebar */}
      <aside className="md:w-64 bg-burgundy-deep text-beige p-4 md:p-6 md:min-h-screen flex md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-x-visible">
        <div className="hidden md:flex items-center gap-3 mb-10">
          <img src={settings?.logo_url || BRAND.logo} alt="" className="h-12 rounded" />
          <div>
            <div className="font-hindi text-xl text-gold">गॉर्जियस</div>
            <div className="text-[10px] tracking-[0.25em] text-beige/60 uppercase">Admin</div>
          </div>
        </div>
        <nav className="flex md:flex-col gap-1 flex-1 min-w-max md:min-w-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                tab === id ? "bg-burgundy text-gold" : "text-beige/80 hover:bg-burgundy/50"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="hidden md:block pt-4 border-t border-gold/20">
          <div className="text-[10px] text-beige/60 mb-2 truncate">{email}</div>
          <button onClick={logout} data-testid="admin-logout"
            className="w-full flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 py-2.5 text-xs uppercase tracking-[0.2em] text-gold">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-10 overflow-auto">
        {/* UPLOAD */}
        {tab === "upload" && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-2">Upload Media</h1>
            <p className="text-ink/70 mb-6 md:mb-8">Upload photos and reels. Videos become "Reels".</p>
            <div className="bg-beige-light border border-gold/40 p-6 max-w-2xl">
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Category (photos)</label>
                <select data-testid="upload-category" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy">
                  <option>Saree</option><option>Lehenga</option><option>Gown</option>
                </select>
              </div>
              <label data-testid="upload-dropzone"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gold/60 p-12 cursor-pointer hover:bg-gold/5">
                {uploading ? <><Loader2 className="animate-spin text-burgundy mb-3" size={32} /><span className="text-sm">Uploading…</span></>
                 : <><Upload className="text-burgundy mb-3" size={32} /><span className="text-sm">Click to upload images or videos</span><span className="text-xs text-ink/60 mt-1">JPG, PNG, MP4</span></>}
                <input type="file" accept="image/*,video/*" multiple onChange={handleUpload} className="hidden" data-testid="upload-input" />
              </label>
            </div>
          </section>
        )}

        {/* MEDIA GRID */}
        {tab === "media" && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-2">Gallery ({media.length})</h1>
            <p className="text-ink/70 mb-6 text-sm">Tap the <Star size={12} className="inline text-gold" /> star to feature an item on the landing page's <strong>Signature Collection</strong>. Tap the <Trash2 size={12} className="inline text-burgundy" /> trash icon to delete. If none are featured, the most recent 10 are shown automatically.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((m) => (
                <div key={m.id} className="border border-gold/30 bg-beige-light relative aspect-square">
                  {m.resource_type === "video" ? <video src={m.secure_url} className="w-full h-full object-cover" muted playsInline /> : <img src={m.secure_url} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute top-2 left-2 text-[10px] bg-beige/90 text-burgundy px-2 py-0.5 uppercase tracking-wider">{m.category}</div>
                  {m.featured && (
                    <div className="absolute bottom-2 left-2 text-[10px] bg-gold text-burgundy-deep px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                      <Star size={10} fill="#3A1F1F" strokeWidth={0} /> Featured
                    </div>
                  )}
                  {/* Always-visible action buttons (works on mobile + desktop) */}
                  <div className="absolute top-2 right-2 flex gap-1.5 z-20">
                    <button data-testid={`feature-${m.id}`}
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFeatured(m); }}
                      type="button"
                      className={`${m.featured ? "bg-gold text-burgundy-deep" : "bg-beige/95 text-burgundy"} p-2 border border-gold/60 shadow hover:scale-110 transition-transform pointer-events-auto`}
                      title={m.featured ? "Unfeature" : "Feature in Signature Collection"}
                      aria-label="Toggle featured">
                      <Star size={14} fill={m.featured ? "#3A1F1F" : "transparent"} />
                    </button>
                    <button data-testid={`delete-${m.id}`}
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); deleteMedia(m.id); }}
                      type="button"
                      className="bg-burgundy text-beige p-2 shadow hover:bg-burgundy-dark hover:scale-110 transition-transform pointer-events-auto"
                      aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {media.length === 0 && <div className="text-ink/60 italic">No media uploaded yet.</div>}
          </section>
        )}

        {/* HERO & LOGO */}
        {tab === "hero" && settings && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-6">Hero & Logo</h1>

            {/* Logo */}
            <div className="bg-beige-light border border-gold/40 p-6 max-w-2xl mb-8">
              <div className="gold-divider mb-4">Site Logo</div>
              <div className="flex items-center gap-6 flex-wrap">
                <img src={settings.logo_url || BRAND.logo} alt="logo" className="h-24 w-24 object-contain bg-beige rounded border border-gold/30" />
                <label className="bg-burgundy text-beige px-5 py-2.5 text-xs uppercase tracking-[0.25em] cursor-pointer hover:bg-burgundy-dark inline-flex items-center gap-2">
                  <Upload size={14} /> Upload new logo
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) logoUpload(e.target.files[0]); e.target.value = ""; }} />
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Or paste image URL</label>
                <input value={settings.logo_url || ""} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy" />
              </div>
            </div>

            {/* Hero slides */}
            <div className="flex items-center justify-between mb-4">
              <div className="gold-divider">Hero Slides</div>
              <button onClick={addSlide} className="inline-flex items-center gap-2 bg-gold text-burgundy-deep px-4 py-2 text-xs uppercase tracking-[0.25em] hover:bg-gold-dark">
                <Plus size={14} /> Add Slide
              </button>
            </div>

            <div className="space-y-6">
              {(settings.hero_slides || []).map((slide, idx) => (
                <div key={idx} className="bg-beige-light border border-gold/40 p-5 grid grid-cols-1 md:grid-cols-[200px,1fr] gap-5">
                  <div>
                    {slide.image ? (
                      <img src={slide.image} className="w-full aspect-[4/5] object-cover border border-gold/30" alt="" />
                    ) : (
                      <div className="w-full aspect-[4/5] border border-dashed border-gold/60 flex items-center justify-center text-ink/50 text-xs">No image</div>
                    )}
                    <label className="mt-2 block w-full text-center bg-burgundy text-beige px-3 py-2 text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-burgundy-dark">
                      <Upload size={12} className="inline mr-1" /> Upload
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) slideImageUpload(idx, e.target.files[0]); e.target.value = ""; }} />
                    </label>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.3em] text-burgundy">Slide {idx + 1}</div>
                      <button onClick={() => removeSlide(idx)} className="text-burgundy hover:text-burgundy-dark p-1" aria-label="Remove">
                        <X size={16} />
                      </button>
                    </div>
                    <input placeholder="Image URL (or upload)" value={slide.image || ""}
                      onChange={(e) => updateSlide(idx, "image", e.target.value)}
                      className="w-full bg-beige border border-gold/50 px-3 py-2 text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Eyebrow (Bridal Season…)" value={slide.eyebrow || ""}
                        onChange={(e) => updateSlide(idx, "eyebrow", e.target.value)}
                        className="bg-beige border border-gold/50 px-3 py-2 text-sm" />
                      <select value={slide.align || "left"} onChange={(e) => updateSlide(idx, "align", e.target.value)}
                        className="bg-beige border border-gold/50 px-3 py-2 text-sm">
                        <option value="left">Align left</option>
                        <option value="right">Align right</option>
                      </select>
                    </div>
                    <input placeholder="Title" value={slide.title || ""}
                      onChange={(e) => updateSlide(idx, "title", e.target.value)}
                      className="w-full bg-beige border border-gold/50 px-3 py-2 text-sm" />
                    <input placeholder="Subtitle" value={slide.subtitle || ""}
                      onChange={(e) => updateSlide(idx, "subtitle", e.target.value)}
                      className="w-full bg-beige border border-gold/50 px-3 py-2 text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="CTA Label" value={slide.cta_label || ""}
                        onChange={(e) => updateSlide(idx, "cta_label", e.target.value)}
                        className="bg-beige border border-gold/50 px-3 py-2 text-sm" />
                      <input placeholder="CTA Link (/book)" value={slide.cta_link || ""}
                        onChange={(e) => updateSlide(idx, "cta_link", e.target.value)}
                        className="bg-beige border border-gold/50 px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              {(!settings.hero_slides || settings.hero_slides.length === 0) && (
                <div className="text-ink/60 italic">No hero slides. Click "Add Slide" to create one.</div>
              )}
            </div>

            <button onClick={saveSettings} data-testid="save-hero"
              className="mt-6 bg-burgundy text-beige px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-burgundy-dark inline-flex items-center gap-2">
              <Save size={14} /> Save Hero & Logo
            </button>
          </section>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-6">Reviews ({reviews.length})</h1>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-beige-light border border-gold/40 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-display text-lg text-burgundy">{r.name}</div>
                        <div className="flex gap-0.5 text-gold">
                          {Array.from({ length: r.rating }).map((_, k) => <Star key={k} size={12} fill="#C8A96A" strokeWidth={0} />)}
                        </div>
                      </div>
                      <p className="text-sm text-ink/80">{r.comment}</p>
                      <div className="text-[10px] text-ink/50 mt-2">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleReview(r)} className={`text-xs px-3 py-1 border ${r.approved ? "bg-gold text-burgundy-deep border-gold" : "bg-transparent text-burgundy border-burgundy"}`}>
                        {r.approved ? "Approved" : "Hidden"}
                      </button>
                      <button onClick={() => deleteReview(r.id)} className="text-xs px-3 py-1 bg-burgundy text-beige">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <div className="text-ink/60 italic">No reviews yet.</div>}
            </div>
          </section>
        )}

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-6">Bookings ({bookings.length})</h1>
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-beige-light border border-gold/40 p-5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <div className="font-display text-xl text-burgundy">{b.name}</div>
                    <div className="text-xs text-ink/70">{b.category} · {b.date} @ {b.time} · {b.phone}</div>
                    {b.notes && <div className="text-xs text-ink/60 mt-1 italic">"{b.notes}"</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 border ${
                      b.status === "confirmed" ? "bg-gold text-burgundy-deep border-gold" :
                      b.status === "cancelled" ? "bg-burgundy/10 text-burgundy border-burgundy/30" :
                      "bg-beige text-ink border-gold/40"}`}>{b.status}</span>
                    {b.status !== "confirmed" && (
                      <button onClick={() => setBookingStatus(b.id, "confirmed")} className="text-xs px-3 py-1 border border-gold text-burgundy hover:bg-gold/20">Confirm</button>
                    )}
                    <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-[#25D366] text-white">WhatsApp</a>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div className="text-ink/60 italic">No bookings yet.</div>}
            </div>
          </section>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-6">Messages ({messages.length})</h1>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-beige-light border border-gold/40 p-5">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div>
                      <div className="font-display text-lg text-burgundy">{m.name}</div>
                      <div className="text-xs text-ink/60">{m.phone} · {m.email || "—"}</div>
                    </div>
                    <div className="text-[10px] text-ink/50">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                  <p className="text-ink/80 text-sm">{m.message}</p>
                </div>
              ))}
              {messages.length === 0 && <div className="text-ink/60 italic">No messages yet.</div>}
            </div>
          </section>
        )}

        {/* SITE INFO */}
        {tab === "settings" && settings && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-6">Site Info</h1>
            <form onSubmit={saveSettings} className="bg-beige-light border border-gold/40 p-6 max-w-2xl space-y-4">
              {[
                ["tagline", "Tagline"],
                ["hero_subtitle", "Hero subtitle (text under title)"],
                ["signature_title", "Signature Collection — heading"],
                ["signature_subtitle", "Signature Collection — eyebrow text"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["address", "Address"],
                ["whatsapp", "WhatsApp number (no +)"],
                ["instagram_url", "Instagram URL"],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">{label}</label>
                  <input value={settings[k] || ""} onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
                    className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy" />
                </div>
              ))}
              <button type="submit" data-testid="save-settings"
                className="bg-burgundy text-beige px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-burgundy-dark flex items-center gap-2">
                <CheckCircle2 size={14} /> Save
              </button>
            </form>
          </section>
        )}

        {/* CHANGE PASSWORD */}
        {tab === "password" && (
          <section>
            <h1 className="font-display text-3xl md:text-4xl text-burgundy mb-6">Change Password</h1>
            <form onSubmit={changePassword} className="bg-beige-light border border-gold/40 p-6 max-w-md space-y-4" data-testid="password-form">
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Current password</label>
                <input type="password" required value={pwd.current_password}
                  onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
                  className="w-full bg-beige border border-gold/50 px-4 py-3" data-testid="pwd-current" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">New password (min 6)</label>
                <input type="password" required minLength={6} value={pwd.new_password}
                  onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
                  className="w-full bg-beige border border-gold/50 px-4 py-3" data-testid="pwd-new" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Confirm new password</label>
                <input type="password" required value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  className="w-full bg-beige border border-gold/50 px-4 py-3" data-testid="pwd-confirm" />
              </div>
              <button type="submit" disabled={pwdBusy} data-testid="pwd-submit"
                className="w-full bg-burgundy text-beige py-3 text-xs uppercase tracking-[0.3em] hover:bg-burgundy-dark disabled:opacity-60 flex items-center justify-center gap-2">
                {pwdBusy ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={14} />} Change Password
              </button>
              <p className="text-[11px] text-ink/60 text-center">This only changes <strong>your</strong> account password.</p>
            </form>

            {/* mobile logout */}
            <button onClick={logout} className="md:hidden mt-6 text-xs uppercase tracking-[0.25em] text-burgundy border-b border-gold pb-1">
              Logout
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
