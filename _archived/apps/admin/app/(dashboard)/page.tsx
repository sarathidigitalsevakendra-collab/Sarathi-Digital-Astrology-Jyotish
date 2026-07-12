import Link from "next/link";

export default function AdminHome(): React.ReactElement {
  return (
    <main className="px-10 py-16">
      <h1 className="text-3xl font-bold">Admin Control Centre</h1>
      <p className="mt-4 max-w-2xl text-sm text-slate-300">
        Manage astrologers, orders, content, promotions, and compliance with a unified dashboard.
      </p>
      <nav className="mt-10 grid gap-3 text-sm">
        <Link href="/admin/astrologers">Astrologer Management</Link>
        <Link href="/admin/orders">Orders & Fulfilment</Link>
        <Link href="/admin/content">Content Hub</Link>
      </nav>
    </main>
  );
}
