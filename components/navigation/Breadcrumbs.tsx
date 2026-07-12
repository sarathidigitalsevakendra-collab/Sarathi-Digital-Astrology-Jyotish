"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "birth-chart": "Chart Generator",
  charts: "My Saved Charts",
  consultations: "Consultations",
  shop: "Marketplace",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  let currentPath = "";

  return (
    <nav className="flex items-center text-sm text-slate-400 mb-6">
      <Link href="/" className="hover:text-indigo-400 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      
      {segments.map((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={currentPath} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-slate-600" />
            {isLast ? (
              <span className="text-indigo-300 font-medium cursor-default">
                {label}
              </span>
            ) : (
              <Link 
                href={currentPath}
                className="hover:text-indigo-400 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
