import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSupabaseAuth } from "./use-supabase-auth";
import { createMockSupabaseAuth, createMockSession } from "@test/mocks/supabase";
import { createBrowserClient } from "@supabase/ssr";

// Note: @supabase/ssr is globally mocked in test/setup.ts

describe("useSupabaseAuth", () => {
  let mockAuth: ReturnType<typeof createMockSupabaseAuth>;

  beforeEach(() => {
    // Reset and reconfigure the mock for each test
    mockAuth = createMockSupabaseAuth();
    vi.mocked(createBrowserClient).mockReturnValue({
      auth: mockAuth,
      from: vi.fn().mockReturnThis(),
      storage: {
        from: vi.fn().mockReturnThis(),
      },
    } as any);
  });

  it("initializes with loading state", () => {
    const { result } = renderHook(() => useSupabaseAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("loads user session on mount", async () => {
    const mockSession = createMockSession();

    mockAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    const { result } = renderHook(() => useSupabaseAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("handles no session on mount", async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useSupabaseAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("subscribes to auth state changes", async () => {
    const mockSession = createMockSession();
    let authCallback: ((event: string, session: any) => void) | undefined;

    mockAuth.onAuthStateChange.mockImplementation(
      (callback: (event: string, session: any) => void) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        } as any;
      },
    );

    const { result } = renderHook(() => useSupabaseAuth());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate auth state change
    authCallback?.("SIGNED_IN", mockSession);

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.session).toEqual(mockSession);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();

    mockAuth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe,
        },
      },
    } as any);

    const { unmount } = renderHook(() => useSupabaseAuth());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("memoizes supabase client", () => {
    const { rerender } = renderHook(() => useSupabaseAuth());

    const initialCallCount = vi.mocked(createBrowserClient).mock.calls.length;

    rerender();

    expect(vi.mocked(createBrowserClient).mock.calls.length).toBe(initialCallCount);
  });
});
