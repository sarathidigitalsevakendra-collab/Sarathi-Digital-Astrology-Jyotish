import React from "react";

interface LegalPageLayoutProps {
  title: string;
  effectiveDate: string;
  lastUpdated?: Date;
  children: React.ReactNode;
}

/**
 * Shared layout component for all legal pages (Privacy, Terms, Refund Policy)
 * Ensures consistent spacing, typography, and responsive design across legal content
 */
export function LegalPageLayout({
  title,
  effectiveDate,
  lastUpdated = new Date(),
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-12 lg:px-16">
      <div className="max-w-none">
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="mb-6 text-4xl font-bold text-slate-900 lg:text-5xl">{title}</h1>
          <p className="text-sm text-slate-500">
            <strong>Effective Date:</strong> {effectiveDate}
            <br />
            <strong>Last Updated:</strong>{" "}
            {lastUpdated.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Legal Content */}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
}

/**
 * Section component for legal page sections
 */
interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="scroll-mt-20">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * Subsection component for nested sections
 */
interface LegalSubsectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSubsection({ title, children }: LegalSubsectionProps) {
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-xl font-semibold text-slate-900">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * Paragraph component with consistent styling
 */
export function LegalParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-700">{children}</p>;
}

/**
 * List component with consistent styling
 */
export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6 text-slate-700">{children}</ul>;
}

/**
 * Ordered list component
 */
export function LegalOrderedList({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-6 text-slate-700">{children}</ol>;
}

/**
 * Callout box for important notices
 */
interface LegalCalloutProps {
  type?: "info" | "warning" | "danger" | "success";
  title?: string;
  children: React.ReactNode;
}

export function LegalCallout({ type = "info", title, children }: LegalCalloutProps) {
  const styles = {
    info: "border-blue-500 bg-blue-50",
    warning: "border-yellow-500 bg-yellow-50",
    danger: "border-red-500 bg-red-50",
    success: "border-green-500 bg-green-50",
  };

  return (
    <div className={`rounded border-l-4 ${styles[type]} p-4 text-slate-700`}>
      {title && <p className="mb-2 font-semibold text-slate-900">{title}</p>}
      {children}
    </div>
  );
}

/**
 * Table component with consistent styling
 */
export function LegalTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-200">{children}</table>
    </div>
  );
}

export function LegalTableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function LegalTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="text-slate-700">{children}</tbody>;
}

export function LegalTableRow({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

export function LegalTableHeader({ children }: { children: React.ReactNode }) {
  return <th className="border border-slate-200 px-4 py-2 text-left text-slate-900">{children}</th>;
}

export function LegalTableCell({ children }: { children: React.ReactNode }) {
  return <td className="border border-slate-200 px-4 py-2">{children}</td>;
}

/**
 * Contact box component
 */
export function LegalContactBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">{children}</div>;
}

/**
 * Footer component for legal pages
 */
export function LegalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 border-t border-slate-200 pt-8 text-sm text-slate-500">{children}</div>
  );
}

/**
 * Link component with consistent styling
 */
export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-blue-600 hover:underline">
      {children}
    </a>
  );
}
