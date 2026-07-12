"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex min-w-[300px] items-center gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300 ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-100"
                : t.type === "error"
                ? "bg-red-950/90 border-red-500/20 text-red-100"
                : "bg-slate-900/90 border-slate-700 text-slate-100"
            }`}
          >
            {t.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-500" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
            
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            
            <button
              onClick={() => removeToast(t.id)}
              className="rounded-full p-1 opacity-70 hover:bg-white/10 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
