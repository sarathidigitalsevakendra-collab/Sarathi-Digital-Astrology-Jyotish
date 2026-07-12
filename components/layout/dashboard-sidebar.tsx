"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  FolderHeart,
  CalendarDays,
  MessageCircle,
  Orbit,
  Gem,
  BriefcaseBusiness,
  Hash,
  TextQuote,
  Building2,
  Baby,
  CalendarCheck,
  Home,
  CircleDot,
  Timer,
  ShieldAlert,
  Flower2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User
} from "lucide-react";
import { clsx } from "clsx";

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

const STORAGE_KEY = "jyotishya-sidebar-collapsed";

interface NavLink { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
interface NavGroup { label: string; links: NavLink[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    links: [
      { href: "/dashboard",              label: "Dashboard",        icon: LayoutDashboard },
      { href: "/dashboard/birth-chart",  label: "Kundli Generator", icon: Sparkles },
      { href: "/dashboard/charts",       label: "Saved Charts",     icon: FolderHeart },
      { href: "/dashboard/panchang",     label: "Daily Panchang",   icon: CalendarDays },
    ],
  },
  {
    label: "Jyotish",
    links: [
      { href: "/dashboard/annual-horoscope", label: "Annual Horoscope",  icon: CircleDot },
      { href: "/dashboard/yoga-detection",   label: "Yoga Detection",    icon: Sparkles },
      { href: "/dashboard/dasha-reading",    label: "Dasha Reading",     icon: Timer },
      { href: "/dashboard/sade-sati",        label: "Sade Sati Report",  icon: Orbit },
      { href: "/dashboard/dosha-analysis",   label: "Dosha Analysis",    icon: ShieldAlert },
      { href: "/dashboard/transits",         label: "Transits",          icon: Orbit },
      { href: "/dashboard/career-report",    label: "Career Report",     icon: BriefcaseBusiness },
      { href: "/dashboard/gemstone-report",  label: "Gemstone Report",   icon: Gem },
    ],
  },
  {
    label: "Numerology",
    links: [
      { href: "/dashboard/name-numerology", label: "Name Numerology", icon: TextQuote },
      { href: "/dashboard/lucky-report",    label: "Lucky Numbers",   icon: Hash },
      { href: "/dashboard/business-name",   label: "Business Name",   icon: Building2 },
      { href: "/dashboard/baby-names",      label: "Baby Names",      icon: Baby },
    ],
  },
  {
    label: "Timing & Advisory",
    links: [
      { href: "/dashboard/muhurat",      label: "Muhurat",          icon: CalendarCheck },
      { href: "/dashboard/vastu",        label: "Vastu Advisory",   icon: Home },
      { href: "/dashboard/upay-report",  label: "Upay & Remedies",  icon: Flower2 },
    ],
  },
  {
    label: "Other",
    links: [
      { href: "/dashboard/consultations", label: "My Consultations", icon: MessageCircle },
    ],
  },
];

// Flat list still used internally for active-link matching
const ALL_LINKS = NAV_GROUPS.flatMap(g => g.links);
void ALL_LINKS; // suppress unused warning


export default function DashboardSidebar() {
  // Initialize with null to indicate "not yet loaded from storage"
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Load saved sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      } else {
        setIsCollapsed(false); // Default to expanded if no saved preference
      }
    } catch {
      setIsCollapsed(false); // Default to expanded on error
    }
  }, []);

  // Toggle sidebar and persist to localStorage
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
      } catch {
        // Ignore storage errors
      }
      return newValue;
    });
  }, []);

  // Handle window resize to switch modes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false); // Close mobile menu when switching to desktop
      }
    };
    
    // Initial check
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // Don't render until we've loaded the saved state to avoid flash
  const sidebarCollapsed = isCollapsed ?? false;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const sidebarVariants = {
    mobile: {
      width: "85%", // Covers most of the screen but leaves a sliver
      x: isMobileOpen ? 0 : "-100%",
      transition: { type: "spring", damping: 25, stiffness: 200 }
    },
    desktop: {
      width: sidebarCollapsed ? 80 : 288,
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 200 }
    }
  };

  return (
    <>
      {/* Mobile Trigger Button - Visible only on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            "p-2.5 rounded-lg bg-[#050816] border border-white/20 text-white shadow-xl backdrop-blur-sm",
            isMobileOpen && "hidden" // Hide trigger when menu is open
          )}
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#050816] border-r border-white/5 shadow-2xl md:shadow-none md:sticky md:top-0 md:h-screen",
        )}
        initial={false}
        animate={isMobile ? "mobile" : "desktop"}
        variants={sidebarVariants}
      >
        <div className={cn(
            "flex h-full flex-col px-3 py-4 bg-[#050816] w-full",
            // Remove the 'hidden' logic here, relying on sidebar translation instead
        )}>
            {/* Mobile Header: Close Button & Logo */}
            <div className="md:hidden flex items-center justify-between mb-6 px-2">
                <span className="text-lg font-bold text-white tracking-wide">Jyotishya</span>
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Header */}
            <div className={cn("hidden md:flex mb-6 items-center px-2", sidebarCollapsed ? "justify-center" : "justify-between")}>
                 {!sidebarCollapsed && (
                     <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Menu</span>
                 )}
                 {/* Desktop Collapse Toggle */}
                 <button
                    onClick={toggleCollapsed}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                 >
                    {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                 </button>
            </div>

            {/* Navigation Links — Grouped */}
            <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  {/* Group label — hidden when collapsed */}
                  {(isMobile || !sidebarCollapsed) && (
                    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {group.label}
                    </p>
                  )}
                  {!sidebarCollapsed && <div className="h-px bg-white/5 mx-3 mb-1" />}

                  {group.links.map((link) => {
                    const isActive = pathname === link.href;
                    const showLabel = isMobile || !sidebarCollapsed;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                          isActive
                            ? "bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-400"
                            : "text-slate-400 hover:bg-white/5 hover:text-white",
                          (!isMobile && sidebarCollapsed) ? "justify-center" : ""
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute left-0 w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                        <link.icon className={cn(
                          "transition-colors shrink-0",
                          isActive ? "text-orange-400" : "text-slate-500 group-hover:text-white",
                          (!isMobile && sidebarCollapsed) ? "w-6 h-6" : "w-4 h-4"
                        )} />
                        {showLabel && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="whitespace-nowrap text-sm"
                          >
                            {link.label}
                          </motion.span>
                        )}
                        {!isMobile && sidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                            {link.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom/Footer Area */}
            <div className="mt-auto border-t border-white/5 pt-4">
                {(isMobile || !sidebarCollapsed) ? (
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 border border-indigo-500/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-500/20 w-12 h-12 rounded-full blur-xl" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">Pro Tip</p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            Complete your profile to get more accurate daily predictions.
                        </p>
                        {/* <button className="text-xs text-indigo-300 hover:text-white font-medium transition-colors">
                            Complete Profile →
                        </button> */}
                    </div>
                ) : (
                    <div className="flex justify-center">
                         <button className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" title="Profile Settings">
                            <User className="w-5 h-5" />
                         </button>
                    </div>
                )}
            </div>
        </div>
      </motion.aside>
    </>
  );
}
