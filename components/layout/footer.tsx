import Link from "next/link";
import { MessageCircle, MapPin, Phone } from "lucide-react";

const QUICK_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/blog", label: "Blog" }
];

export default function Footer(): React.ReactElement {
  const phone = "918369704457";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Sarathi Kendra, I am looking for help with a digital service. Are you open today?")}`;

  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-3 lg:px-16">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-orange-400 mb-4">
            <span className="text-white">Sarathi</span> Kendra
          </div>
          <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
            Your trusted local partner for all government & digital services in Bhayandar East.
          </p>
          <div className="space-y-4 text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">Shop No.14, Rashmi Laxmi, Navghar Road, Bhayandar East, Thane 401105</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-orange-500 shrink-0" />
              <span>+91 83697 04457</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm text-slate-300 flex flex-col">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Contact on WhatsApp
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Got a query about Aadhaar, PAN or any certificate? Message us directly.
          </p>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-6 rounded-xl font-medium transition-colors w-full sm:w-auto"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Sarathi Digital Seva Kendra. All rights reserved.
      </div>
    </footer>
  );
}
