"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton(): React.ReactElement {
  const phone = "918369704457";
  const whatsappUrl = `https://wa.me/${phone}?text=Hello%20Sarathi%20Digital%20Seva%20Kendra,%20I%20have%20an%20inquiry.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
