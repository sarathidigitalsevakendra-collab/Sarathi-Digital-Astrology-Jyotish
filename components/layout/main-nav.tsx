"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@digital-astrology/ui";
import clsx from "clsx";
import LocaleSwitcher from "@components/layout/locale-switcher";
import { useLocaleContext } from "@components/providers/intl-provider";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import UserDropdown from "@components/layout/user-dropdown";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/consultations", key: "consult" },
  { href: "/matching", key: "match" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/store", key: "store" },
] as const;

export default function MainNav(): React.ReactElement {
  const pathname = usePathname();
  const { copy } = useLocaleContext();
  const { nav } = copy;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useSupabaseAuth();

  const renderLinks = (onClick?: () => void) => (
    <nav className="flex flex-col gap-3 text-sm text-slate-200 md:flex-row md:items-center">
      {LINKS.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "relative px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-orange-400"
                : "text-slate-400 hover:text-white"
            )}
          >
            {nav.links[link.key]}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-1/2 -translate-x-1/2 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#040713]/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-16">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-orange-200">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-lg text-white shadow-astro">
            ज्यो
          </span>
          <span>Jyotishya</span>
        </Link>
        <div className="hidden md:flex md:items-center md:gap-5">
          {renderLinks()}
          <LocaleSwitcher />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {!loading && (
            <>
              {user ? (
                <UserDropdown user={user} />
              ) : (
                <>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/auth/signin">{nav.actions.signIn}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/consultations">{nav.actions.book}</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white md:hidden active:bg-white/20 transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className="flex h-5 flex-col justify-between">
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </span>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-4 border-t border-white/5 bg-[#050816]/95 px-6 py-6">
            {renderLinks(() => setMobileMenuOpen(false))}
            <LocaleSwitcher />
            {!loading && (
              <div className="flex flex-col gap-3">
                {user ? (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-400 mb-2">Signed in as</p>
                    <p className="text-white font-medium mb-3">{user.email}</p>
                    <div className="flex flex-col gap-2">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <form action="/auth/signout" method="POST">
                        <Button variant="secondary" size="sm" type="submit" className="w-full">
                          Sign Out
                        </Button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                        {nav.actions.signIn}
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/consultations" onClick={() => setMobileMenuOpen(false)}>
                        {nav.actions.book}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
