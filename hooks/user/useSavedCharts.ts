import { useState, useEffect } from "react";
import type { BirthChartResponse } from "@/types/astrology/birthChart.types";

export interface SavedChart {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdAt: string;
  chartData?: BirthChartResponse;
}

export function useSavedCharts() {
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/kundli");
      if (!response.ok) throw new Error("Failed to fetch saved charts");
      
      const data = await response.json();
      setCharts(data.kundlis);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load charts");
    } finally {
      setLoading(false);
    }
  };

  const deleteChart = async (id: string) => {
    try {
      const response = await fetch(`/api/user/kundli?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete chart");
      
      setCharts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error("Failed to delete chart");
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  return {
    charts,
    loading,
    error,
    deleteChart,
    refreshCharts: fetchCharts
  };
}
