import { createContext, useContext, useEffect, useState } from "react";
import api, { BRAND } from "./api";

const DEFAULTS = {
  tagline: "Elegance in Every Thread",
  hero_subtitle: "Crafted with love in Delhi.",
  phone: BRAND.phone,
  email: BRAND.email,
  address: BRAND.address,
  whatsapp: BRAND.whatsapp,
  instagram_url: BRAND.instagram,
  logo_url: BRAND.logo,
  hero_slides: [],
};

const Ctx = createContext({ settings: DEFAULTS, refresh: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings({ ...DEFAULTS, ...data });
    } catch {
      /* keep defaults */
    }
  };
  useEffect(() => { fetchSettings(); }, []);
  return <Ctx.Provider value={{ settings, refresh: fetchSettings }}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
