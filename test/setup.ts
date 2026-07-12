import { vi } from "vitest";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  }),
  headers: () => ({
    get: vi.fn(),
    has: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    forEach: vi.fn(),
  }),
}));

// Suppress console errors during tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
