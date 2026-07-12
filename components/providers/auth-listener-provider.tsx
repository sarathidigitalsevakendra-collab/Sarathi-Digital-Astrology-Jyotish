"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthListenerProviderProps {
  children: React.ReactNode;
}

/**
 * AuthListenerProvider
 *
 * Listens to Supabase auth state changes and redirects users to /dashboard
 * when they sign in. Works across all browser tabs.
 *
 * Features:
 * - Subscribes to supabase.auth.onAuthStateChange()
 * - Redirects to /dashboard on SIGNED_IN event
 * - Works even if user signs in from another tab (magic link, OAuth, etc.)
 * - Properly cleans up subscription on unmount
 * - Avoids redirect loops by checking current pathname
 *
 * Usage:
 * Wrap this provider in your root layout.tsx around your app content.
 */
export default function AuthListenerProvider({ children }: AuthListenerProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.error("[AuthListener] Auth event:", event, "Session exists:", !!session);

      // Only redirect on actual sign-in events
      if (event === "SIGNED_IN" && session) {
        // Avoid redirect loops - don't redirect if already on dashboard or onboarding
        const currentPath = pathname || "";
        const isOnProtectedRoute =
          currentPath.startsWith("/dashboard") || currentPath.startsWith("/onboarding");

        if (!isOnProtectedRoute) {
          console.error("[AuthListener] User signed in, redirecting to /dashboard");
          router.push("/dashboard");
          router.refresh();
        } else {
          console.error("[AuthListener] Already on protected route, skipping redirect");
        }
      }

      // Optional: Handle sign out
      if (event === "SIGNED_OUT") {
        console.error("[AuthListener] User signed out");
        // You could redirect to home page or signin page here if desired
        // router.push('/auth/signin')
      }

      // Optional: Handle token refresh
      if (event === "TOKEN_REFRESHED") {
        console.error("[AuthListener] Token refreshed");
        // Session is still valid, no action needed
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.error("[AuthListener] Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return <>{children}</>;
}
