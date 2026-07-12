import { vi } from "vitest";

/**
 * Create a mock Supabase auth object for testing
 */
export function createMockSupabaseAuth() {
  return {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { url: "https://example.com/auth" },
      error: null,
    }),
    signInWithOtp: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    verifyOtp: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
    onAuthStateChange: vi.fn().mockImplementation((_callback) => {
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
    updateUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  };
}

/**
 * Create a mock session for testing
 */
export function createMockSession(overrides = {}) {
  return {
    access_token: "mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    refresh_token: "mock-refresh-token",
    user: createMockUser(),
    ...overrides,
  };
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: "mock-user-id",
    aud: "authenticated",
    role: "authenticated",
    email: "test@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    user_metadata: {
      name: "Test User",
    },
    ...overrides,
  };
}
