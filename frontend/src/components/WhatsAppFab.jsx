import { MessageCircle } from "lucide-react";
import { waLink } from "../lib/api";

export default function WhatsAppFab() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      data-testid="whatsapp-fab"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white h-14 w-14 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center animate-float-slow"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </a>
  );
}
