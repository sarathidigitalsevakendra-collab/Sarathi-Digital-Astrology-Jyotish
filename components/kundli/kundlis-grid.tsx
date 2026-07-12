"use client";

import { useState } from "react";
import KundliCard from "./kundli-card";
// import { toast } from "sonner"; // Removed
import { useRouter } from "next/navigation";

interface Kundli {
  id: string;
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData: Record<string, unknown>;
  isPublic: boolean;
  isFavorite: boolean; // Added field
  createdAt: Date;
  updatedAt: Date;
}

interface KundlisGridProps {
  initialKundlis: Kundli[];
}

export default function KundlisGrid({ initialKundlis }: KundlisGridProps) {
  const [kundlis, setKundlis] = useState(initialKundlis);
  const router = useRouter();

  const handleDelete = (id: string) => {
    setKundlis(kundlis.filter((k) => k.id !== id));
  };

  const handleRename = async (id: string, newName: string) => {
    // Optimistic update
    setKundlis(kundlis.map(k => k.id === id ? { ...k, name: newName } : k));

    try {
        const res = await fetch("/api/user/kundli", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, name: newName }),
        });
        if (!res.ok) throw new Error("Failed to rename");
        // toast.success("Chart renamed"); 
        router.refresh();
    } catch (error) {
        console.error(error);
        alert("Failed to rename chart");
        // Revert (in a real app, we'd fetch or rollback)
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const kundli = kundlis.find(k => k.id === id);
    if (!kundli) return;

    const newStatus = !kundli.isFavorite;

    // Optimistic update
    setKundlis(kundlis.map(k => k.id === id ? { ...k, isFavorite: newStatus } : k));

    try {
        const res = await fetch("/api/user/kundli", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isFavorite: newStatus }),
        });
        if (!res.ok) throw new Error("Failed to update favorite");
        // toast.success(newStatus ? "Added to favorites" : "Removed from favorites");
        router.refresh();
    } catch (error) {
        console.error(error);
        alert("Failed to update favorite");
         // Revert
         setKundlis(kundlis.map(k => k.id === id ? { ...k, isFavorite: !newStatus } : k));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {kundlis.map((kundli) => (
        <KundliCard 
            key={kundli.id} 
            kundli={kundli} 
            onDelete={handleDelete}
            onRename={handleRename}
            onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}
