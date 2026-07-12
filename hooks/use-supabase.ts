"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSupabase() {
  const supabase = createClient();

  return { supabase };
}

/**
 * Hook for database queries with loading and error states
 */
export function useSupabaseQuery<T = any>(
  queryFn: (supabase: ReturnType<typeof createClient>) => Promise<any>,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn(supabase);
      if (result.error) throw result.error;
      setData(result.data);
      return result.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    error,
    loading,
    execute,
  };
}
