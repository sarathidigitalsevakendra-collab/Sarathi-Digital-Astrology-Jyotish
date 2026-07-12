import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Jyotishya",
  description: "Your complete Vedic astrology and numerology service centre.",
};

interface Service {
  href: string;
  icon: string;
  label: string;
  tagline: string;
  gradient: string;
}

const SERVICE_GROUPS: { group: string; emoji: string; color: string; services: Service[] }[] = [
  {
    group: "Jyotish Reports",
    emoji: "🪐",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20",
    services: [
      { href: "/dashboard/birth-chart",      icon: "🌟", label: "Kundali Generator",   tagline: "Full birth chart with planetary report",         gradient: "from-yellow-500 to-orange-500" },
      { href: "/dashboard/annual-horoscope", icon: "🌠", label: "Annual Horoscope",     tagline: "Year-ahead Saturn & Jupiter transit forecast",    gradient: "from-indigo-500 to-blue-500" },
      { href: "/dashboard/yoga-detection",   icon: "✨", label: "Yoga Detection",        tagline: "Raja, Dhana & Mahapurusha yogas",                gradient: "from-amber-500 to-yellow-500" },
      { href: "/dashboard/dasha-reading",    icon: "🌌", label: "Dasha Reading",         tagline: "Current Mahadasha & Antardasha periods",         gradient: "from-indigo-500 to-purple-500" },
      { href: "/dashboard/sade-sati",        icon: "🪐", label: "Sade Sati Report",      tagline: "Saturn 7.5-yr transit phase analysis",           gradient: "from-slate-500 to-blue-600" },
      { href: "/dashboard/dosha-analysis",   icon: "🔱", label: "Dosha Analysis",        tagline: "Kaal Sarp & Manglik dosha check",                gradient: "from-purple-500 to-pink-500" },
      { href: "/dashboard/transits",         icon: "🔭", label: "Planetary Transits",    tagline: "Current transit aspects over your natal chart",  gradient: "from-cyan-500 to-teal-500" },
      { href: "/dashboard/career-report",    icon: "💼", label: "Career & Finance",      tagline: "AI-powered career and wealth reading",           gradient: "from-green-500 to-emerald-500" },
    ],
  },
  {
    group: "Numerology",
    emoji: "🔢",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20",
    services: [
      { href: "/dashboard/name-numerology",  icon: "🔢", label: "Name Numerology",      tagline: "Destiny, Soul Urge & Personality numbers",       gradient: "from-blue-500 to-cyan-500" },
      { href: "/dashboard/lucky-report",     icon: "🎲", label: "Lucky Numbers",         tagline: "Lucky number, colour, and day report",           gradient: "from-teal-500 to-green-500" },
      { href: "/dashboard/business-name",    icon: "🏢", label: "Business Name",         tagline: "Score up to 5 names by life path number",        gradient: "from-slate-500 to-blue-500" },
      { href: "/dashboard/baby-names",       icon: "👶", label: "Baby Names",            tagline: "Nakshatra-based name suggestions",               gradient: "from-pink-500 to-rose-500" },
    ],
  },
  {
    group: "Muhurat Timing",
    emoji: "📅",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20",
    services: [
      { href: "/dashboard/muhurat",  icon: "📅", label: "Muhurat Calculator", tagline: "Best dates for marriage, business & property",    gradient: "from-emerald-500 to-teal-500" },
      { href: "/dashboard/panchang", icon: "📆", label: "Daily Panchang",     tagline: "Today's Tithi, Nakshatra & Yoga",                 gradient: "from-amber-500 to-yellow-500" },
    ],
  },
  {
    group: "Advisory & Remedies",
    emoji: "🏡",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
    services: [
      { href: "/dashboard/vastu",          icon: "🏡", label: "Vastu Advisory",   tagline: "8-zone analysis, room placement & remedies",     gradient: "from-violet-500 to-purple-500" },
      { href: "/dashboard/gemstone-report",icon: "💎", label: "Gemstone Report",  tagline: "Personalised gemstone & substitute guide",        gradient: "from-rose-500 to-pink-500" },
      { href: "/dashboard/upay-report",    icon: "🕉️", label: "Upay & Remedies",  tagline: "Mantra, gemstone, yantra & lifestyle remedies",  gradient: "from-purple-600 to-pink-500" },
    ],
  },
  {
    group: "Compatibility & History",
    emoji: "💞",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/20",
    services: [
      { href: "/dashboard/matching", icon: "💞", label: "Kundali Matching", tagline: "Marriage compatibility — Guna Milan",              gradient: "from-rose-500 to-red-500" },
      { href: "/dashboard/charts",   icon: "📂", label: "Saved Charts",     tagline: "View, rename & favourite your birth charts",      gradient: "from-blue-500 to-cyan-500" },
    ],
  },
];

function ServiceCard({ s }: { s: Service }) {
  return (
    <Link href={s.href} className="group block">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]">
        <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${s.gradient} text-xl`}>
          {s.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{s.label}</p>
          <p className="text-xs text-slate-500 leading-tight">{s.tagline}</p>
        </div>
        <span className="ml-auto shrink-0 text-slate-700 group-hover:text-slate-400 transition-colors text-lg">›</span>
      </div>
    </Link>
  );
}

function ServiceGroup({ group }: { group: typeof SERVICE_GROUPS[0] }) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${group.color}`}>
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
        {group.emoji} {group.group}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.services.map(s => <ServiceCard key={s.href} s={s} />)}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard");

  const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "there";
  const totalServices = SERVICE_GROUPS.reduce((acc, g) => acc + g.services.length, 0);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-10 lg:px-10 space-y-8">
      {/* Welcome hero */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/20 via-orange-900/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-amber-400 text-sm font-semibold tracking-wide mb-1">🌟 Namaste</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Welcome, {displayName}
            </h1>
            <p className="text-slate-400 max-w-md">
              Your complete Vedic astrology &amp; numerology centre — {totalServices} services across Jyotish, Numerology, Muhurat, Vastu, and Remedies.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0">
            <Link href="/dashboard/birth-chart"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl text-sm shadow-lg hover:brightness-110 transition-all">
              🌟 Generate Kundali
            </Link>
            <Link href="/dashboard/panchang"
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/15 transition-all">
              📆 {"Today's"} Panchang
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🪐", count: "8",  label: "Jyotish Reports" },
            { icon: "🔢", count: "4",  label: "Numerology Tools" },
            { icon: "📅", count: "5+", label: "Muhurat Types" },
            { icon: "🕉️", count: "10", label: "Remedy Categories" },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-white font-black text-lg">{s.count}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Service groups */}
      <div className="space-y-5">
        {SERVICE_GROUPS.map(group => <ServiceGroup key={group.group} group={group} />)}
      </div>

      {/* Bottom quick links */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">Quick links:</span>
        {[
          { href: "/dashboard/charts",  label: "📂 Saved Charts" },
          { href: "/dashboard/transits",label: "🔭 Transits" },
          { href: "/dashboard/reports", label: "📄 PDF Reports" },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
