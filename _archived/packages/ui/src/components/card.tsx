import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface CardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ title, subtitle, className, children }: CardProps) {
  return (
    <article
      className={clsx(
        "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-astro backdrop-blur-xl",
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
        </header>
      )}
      {children}
    </article>
  );
}
