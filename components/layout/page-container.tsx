import React from "react";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface PageContainerProps {
  /**
   * Maximum width of the container
   * - sm: max-w-3xl (768px) - Narrow content like blog posts
   * - md: max-w-4xl (896px) - Legal pages, documentation
   * - lg: max-w-5xl (1024px) - Standard pages
   * - xl: max-w-7xl (1280px) - Dashboard, wide layouts
   * - full: max-w-none - Full width
   */
  size?: ContainerSize;

  /**
   * Add padding to the container
   */
  noPadding?: boolean;

  /**
   * Custom className for additional styling
   */
  className?: string;

  children: React.ReactNode;
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

/**
 * Consistent page container component used across the app
 * Ensures proper spacing, centering, and responsive padding
 */
export function PageContainer({
  size = "xl",
  noPadding = false,
  className = "",
  children,
}: PageContainerProps) {
  const paddingClass = noPadding ? "" : "px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12";

  return (
    <div className={`mx-auto min-h-screen ${sizeClasses[size]} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Page header component for consistent page titles
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-8 md:mb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl md:text-4xl font-bold text-white lg:text-5xl">{title}</h1>
          {description && <p className="mt-2 text-slate-300">{description}</p>}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </header>
  );
}

/**
 * Section component for page sections
 */
interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ title, description, children, className = "" }: PageSectionProps) {
  return (
    <section className={`mb-8 md:mb-12 lg:mb-16 ${className}`}>
      {title && (
        <div className="mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">{title}</h2>
          {description && <p className="mt-2 text-slate-300">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
