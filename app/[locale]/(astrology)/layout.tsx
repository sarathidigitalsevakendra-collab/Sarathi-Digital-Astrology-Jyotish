export default function AstrologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cosmic-blue text-slate-100 min-h-screen astro-bg-starfield relative overflow-x-hidden">
      {children}
    </div>
  );
}
