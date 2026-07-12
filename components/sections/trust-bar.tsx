const STATS = [
  { label: "Astrologers", value: "150+", icon: "👨‍⚕️" },
  { label: "Cities Served", value: "400", icon: "🌍" },
  { label: "Daily Alerts Sent", value: "2M", icon: "🔔" },
  { label: "Gemstones Certified", value: "10K", icon: "💎" },
];

export default function TrustBar(): React.ReactElement {
  return (
    <section className="relative z-10 px-6 lg:px-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-white/5 py-8 text-center text-sm text-slate-200 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <div 
             key={stat.label} 
             className={`flex flex-col items-center gap-2 px-4 transition-transform duration-300 hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.2)] ${
                index !== STATS.length - 1 ? "lg:border-r lg:border-white/5" : ""
             }`}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-orange-200">{stat.value}</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
