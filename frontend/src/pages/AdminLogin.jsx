import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { toast, Toaster } from "sonner";
import api, { BRAND } from "../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("gfb_token", data.access_token);
      localStorage.setItem("gfb_email", data.email);
      toast.success("Welcome back");
      setTimeout(() => nav("/admin"), 300);
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-6">
      <Toaster position="top-center" richColors />
      <form
        onSubmit={submit}
        data-testid="admin-login-form"
        className="max-w-md w-full bg-beige-light border border-gold/40 p-10"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={BRAND.logo} alt="logo" className="h-20 mb-4 rounded-md" />
          <div className="gold-divider mb-2">Atelier Admin</div>
          <h1 className="font-display text-3xl text-burgundy">Sign In</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Email</label>
            <input
              data-testid="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-burgundy mb-2">Password</label>
            <input
              data-testid="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-beige border border-gold/50 px-4 py-3 text-ink focus:outline-none focus:border-burgundy"
              required
            />
          </div>
          <button
            type="submit"
            data-testid="admin-login-btn"
            disabled={busy}
            className="w-full bg-burgundy text-beige py-4 text-sm uppercase tracking-[0.3em] hover:bg-burgundy-dark flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
