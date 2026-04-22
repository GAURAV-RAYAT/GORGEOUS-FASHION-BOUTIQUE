import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const instance = axios.create({ baseURL: API });

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("gfb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;

export const BRAND = {
  name: "गॉर्जियस Fashion Boutique",
  englishName: "Gorgeous Fashion Boutique",
  tagline: "Elegance in Every Thread",
  phone: "+91 8587008027",
  whatsapp: "918587008027",
  email: "jiyarayat207@gmail.com",
  address: "Govindpuri, Kalkaji Metro No. 08, New Delhi – 110019",
  logo: "https://customer-assets.emergentagent.com/job_priceless-germain-8/artifacts/a62v7x5o_Screenshot%202026-04-22%20190513.png",
  instagram: "https://instagram.com/",
};

export const waLink = (msg = "Hi, I want to enquire about your designs") =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`;
