import { ReactNode } from 'react';

// This is required by Next.js to provide a root layout for app/not-found.tsx
// Since we use app/[locale]/layout.tsx for rendering html/body with dynamic lang attributes,
// this root layout simply passes through children. Next.js might complain if it doesn't have
// html/body, so we provide a basic one if children is not already wrapped.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
