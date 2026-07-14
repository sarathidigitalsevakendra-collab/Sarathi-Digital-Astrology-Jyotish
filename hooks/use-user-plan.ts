import { useState, useEffect } from "react";
import { useSupabaseAuth } from "./use-supabase-auth";

export type SubscriptionPlan = "FREE" | "BASIC" | "PREMIUM";

export function useUserPlan() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setPlan("FREE");
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          setPlan(data.plan || "FREE");
        }
      } catch (error) {
        console.error("Failed to fetch user plan", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user, authLoading]);

  return { plan, loading };
}
