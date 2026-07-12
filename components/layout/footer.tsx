import Link from "next/link";

const QUICK_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
];

export default function Footer(): React.ReactElement {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#070c1d]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[2fr,1fr,1fr] lg:px-16">
        <div>
          <div className="flex items-center gap-3 text-lg font-semibold text-orange-200">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-lg text-white shadow-astro">
              ज्यो
            </span>
            Jyotishya
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Trusted by seekers across Bharat for Kundli, horoscope, muhurat, gemstones and spiritual
            guidance. Serving in हिंदी, English and more regional languages soon.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-orange-200">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-max">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-orange-200">
            Stay Updated
          </h3>
          <p className="mt-4 text-sm text-slate-300">
            Get auspicious alerts, festival insights, and exclusive offers on WhatsApp.
          </p>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-xs text-slate-400">Coming Soon</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Jyotishya. Astrology guidance subject to personal discretion.
      </div>
    </footer>
  );
}
