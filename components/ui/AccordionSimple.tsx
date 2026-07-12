"use client";

import { useState, useRef, useEffect } from "react";

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
  className?: string;
}

export function Accordion({ title, children, defaultOpen = false, icon, className = "" }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const contentEl = contentRef.current;
      setHeight(contentEl?.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div className="font-semibold text-white text-lg">{title}</div>
        </div>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 bg-white/10 text-white" : ""
          }`}
        >
          ▼
        </span>
      </button>
      <div
        style={{ height }}
        className="transition-[height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
