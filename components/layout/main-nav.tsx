"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import LocaleSwitcher from "@components/layout/locale-switcher";
import { ChevronDown } from "lucide-react";

export default function MainNav(): React.ReactElement {
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const phone = "918369704457";
  const whatsappUrl = `https://wa.me/${phone}`;

  const SERVICES = [
    { href: "/services/aadhaar-pan-voter", label: "Aadhaar / PAN / Voter ID" },
    { href: "/services/caste-income-domicile", label: "Certificates" },
    { href: "/services/irctc-train-tickets", label: "Travel Tickets" },
    { href: "/services/gst-msme-udyam", label: "GST / MSME / Tax" },
    { href: "/services/shop-act-food-license", label: "Shop Act & Food License" },
    { href: "/services/passport-rto-services", label: "Passport & RTO" },
    { href: "/services/banking-money-transfer", label: "Banking & Money Transfer" },
    { href: "/services/eshram-ayushman-card", label: "Govt Cards & Schemes" },
    { href: "/services/insurance-services", label: "Insurance Services" },
    { href: "/services/education-jobs-scholarship", label: "Education & Jobs" },
    { href: "/services/printing-stationery", label: "Printing & Stationery" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-16">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-orange-500">
          <span className="text-blue-900">Sarathi</span> Kendra
        </Link>
        <div className="hidden md:flex md:items-center md:gap-6">
          <Link href="/" className={clsx("text-sm font-medium transition-colors", pathname === "/" || pathname === "/hi" || pathname === "/mr" ? "text-orange-500" : "text-slate-600 hover:text-blue-900")}>
            Home
          </Link>
          
          <div className="relative group" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-900 py-2">
              Services <ChevronDown className="w-4 h-4" />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 w-[450px] bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50">
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(service => (
                    <Link key={service.href} href={service.href} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-colors rounded-lg">
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/blog" className={clsx("text-sm font-medium transition-colors", pathname?.includes("/blog") ? "text-orange-500" : "text-slate-600 hover:text-blue-900")}>
            Blog
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-blue-900">
            Contact
          </a>
          
          <div className="pl-4 border-l border-slate-200">
            <LocaleSwitcher />
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 active:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="flex h-4 flex-col justify-between">
              <span className={`block h-0.5 w-5 bg-slate-600 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-600 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-600 transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 px-6 py-4 space-y-4">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Home</Link>
          <div className="py-2">
            <div className="text-blue-900 font-medium mb-2">Services</div>
            <div className="pl-4 space-y-2 border-l border-slate-200 flex flex-col">
              {SERVICES.map(service => (
                <Link key={service.href} href={service.href} onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-500">
                  {service.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600">Blog</Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block py-2 text-slate-600">Contact</a>
        </div>
      )}
    </header>
  );
}
