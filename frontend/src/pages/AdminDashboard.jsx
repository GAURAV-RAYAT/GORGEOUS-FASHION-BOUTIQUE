import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  Upload, Image as ImgIcon, Film, LogOut, Trash2, Calendar,
  MessageSquare, Loader2, CheckCircle2, Settings as SettingsIcon,
} from "lucide-react";
import api, { BRAND } from "../lib/api";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("upload");
  const [media, setMedia] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Saree");
  const [settings, setSettings] = useState(null);

  const token = localStorage.getItem("gfb_token");
  const email = localStorage.getItem("gfb_email");

  useEffect(() => {
    if (!token) { nav("/admin/login"); return; }
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const [m, b, c, s] = await Promise.all([
        api.get("/media"),
        api.get("/bookings"),
        api.get("/contact"),
        api.get("/settings"),
      ]);
      setMedia(m.data); setBookings(b.data); setMessages(c.data); setSettings(s.data);
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.clear(); nav("/admin/login");
      }
    }
  };

  const logout = () => { localStorage.clear(); nav("/admin/login"); };

  const uploadFile = async (file) => {
    const isVideo = file.type.startsWith("video/");
    const resource_type = isVideo ? "video" : "image";
    setUploading(true);
    try {
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

      await api.post("/media", {
        public_id: data.public_id,
        secure_url: data.secure_url,
        resource_type,
        category: resource_type === "video" ? "Reel" : category,
      });
      toast.success("Uploaded");
      refresh();
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = "";
  };

  const deleteMedia = async (id) => {
    if (!confirm("Delete this media?")) return;
    await api.delete(`/media/${id}`);
    toast.success("Deleted");
    refresh();
  };

  const setBookingStatus = async (id, status) => {
    await api.patch(`/bookings/${id}`, null, { params: { status } });
    refresh();
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    await api.patch("/settings", settings);
    toast.success("Settings saved");
  };

  const tabs = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "media", label: "Gallery", icon: ImgIcon },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-beige" data-testid="admin-dashboard">
      <Toaster position="top-center" richColors />
      <aside className="w-64 bg-burgundy-deep text-beige p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <img src={BRAND.logo} alt="" className="h-12 rounded" />
          <div>
            <div className="font-hindi text-xl text-gold">गॉर्जियस</div>
            <div className="text-[10px] tracking-[0.25em] text-beige/60 uppercase">Admin</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.2em] transition-all ${
                tab === id ? "bg-burgundy text-gold" : "text-beige/80 hover:bg-burgundy/50"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-gold/20">
          <div className="text-[10px] text-beige/60 mb-2 truncate">{email}</div>
          <button
            onClick={logout}
            data-testid="admin-logout"
            className="w-full flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 py-2.5 text-xs uppercase tracking-[0.2em] text-gold"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        {tab === "upload" && (
          <section>
            <h1 className="font-display text-4xl text-burgundy mb-2">Upload Media</h1>
            <p className="text-ink/70 mb-8">Upload photos and reels. Videos auto-classified as "Reel".</p>

            <div className="bg-beige-light border border-gold/40 p-6 max-w-2xl">
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Category (for photos)</label>
                <select
                  data-testid="upload-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
                >
                  <option>Saree</option>
                  <option>Lehenga</option>
                  <option>Gown</option>
                </select>
              </div>
              <label
                data-testid="upload-dropzone"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gold/60 p-12 cursor-pointer hover:bg-gold/5 transition-all"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin text-burgundy mb-3" size={32} />
                    <span className="text-sm text-ink">Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-burgundy mb-3" size={32} />
                    <span className="text-sm text-ink">Click to upload images or videos</span>
                    <span className="text-xs text-ink/60 mt-1">JPG, PNG, MP4 — multiple allowed</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  data-testid="upload-input"
                />
              </label>
            </div>
          </section>
        )}

        {tab === "media" && (
          <section>
            <h1 className="font-display text-4xl text-burgundy mb-6">Gallery ({media.length})</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((m) => (
                <div key={m.id} className="border border-gold/30 bg-beige-light relative group aspect-square">
                  {m.resource_type === "video" ? (
                    <video src={m.secure_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={m.secure_url} className="w-full h-full object-cover" alt="" />
                  )}
                  <div className="absolute top-2 left-2 text-[10px] bg-beige/90 text-burgundy px-2 py-0.5 uppercase tracking-wider">
                    {m.category}
                  </div>
                  <button
                    data-testid={`delete-${m.id}`}
                    onClick={() => deleteMedia(m.id)}
                    className="absolute top-2 right-2 bg-burgundy text-beige p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {media.length === 0 && <div className="text-ink/60 italic">No media uploaded yet.</div>}
          </section>
        )}

        {tab === "bookings" && (
          <section>
            <h1 className="font-display text-4xl text-burgundy mb-6">Bookings ({bookings.length})</h1>
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-beige-light border border-gold/40 p-5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <div className="font-display text-xl text-burgundy">{b.name}</div>
                    <div className="text-xs text-ink/70">
                      {b.category} · {b.date} @ {b.time} · {b.phone}
                    </div>
                    {b.notes && <div className="text-xs text-ink/60 mt-1 italic">"{b.notes}"</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 border ${
                      b.status === "confirmed" ? "bg-gold text-burgundy-deep border-gold" :
                      b.status === "cancelled" ? "bg-burgundy/10 text-burgundy border-burgundy/30" :
                      "bg-beige text-ink border-gold/40"
                    }`}>
                      {b.status}
                    </span>
                    {b.status !== "confirmed" && (
                      <button onClick={() => setBookingStatus(b.id, "confirmed")} className="text-xs px-3 py-1 border border-gold text-burgundy hover:bg-gold/20">
                        Confirm
                      </button>
                    )}
                    <a
                      href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs px-3 py-1 bg-[#25D366] text-white"
                    >WhatsApp</a>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div className="text-ink/60 italic">No bookings yet.</div>}
            </div>
          </section>
        )}

        {tab === "messages" && (
          <section>
            <h1 className="font-display text-4xl text-burgundy mb-6">Messages ({messages.length})</h1>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-beige-light border border-gold/40 p-5">
                  <div className="flex justify-between items-start mb-2">
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

        {tab === "settings" && settings && (
          <section>
            <h1 className="font-display text-4xl text-burgundy mb-6">Site Settings</h1>
            <form onSubmit={saveSettings} className="bg-beige-light border border-gold/40 p-6 max-w-2xl space-y-4">
              {["tagline", "hero_subtitle", "phone", "email", "address", "whatsapp", "instagram_url"].map((k) => (
                <div key={k}>
                  <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">{k.replace(/_/g, " ")}</label>
                  <input
                    value={settings[k] || ""}
                    onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
                    className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
                  />
                </div>
              ))}
              <button
                type="submit"
                data-testid="save-settings"
                className="bg-burgundy text-beige px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-burgundy-dark flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Save
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
