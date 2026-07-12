/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseAuth } from "./auth";
import { createMockSupabaseAuth } from "@test/mocks/supabase";
import { createBrowserClient } from "@supabase/ssr";

// Note: @supabase/ssr is globally mocked in test/setup.ts

describe("supabaseAuth", () => {
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

  describe("signInWithEmail", () => {
    it("signs in with email and password", async () => {
      const result = await supabaseAuth.signInWithEmail("test@example.com", "password123");

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.data?.user).toBeDefined();
      expect(result.data?.session).toBeDefined();
    });

    it("handles sign in errors", async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid credentials", name: "AuthError", status: 401 },
      } as any);

      const result = await supabaseAuth.signInWithEmail("wrong@example.com", "wrongpass");

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Invalid credentials");
    });
  });

  describe("signInWithOTP", () => {
    it("sends OTP to email", async () => {
      const result = await supabaseAuth.signInWithOTP("test@example.com");

      expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
      });

      expect(result.error).toBeNull();
    });

    it("sends OTP to phone number", async () => {
      const result = await supabaseAuth.signInWithOTP("+911234567890");

      expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
        phone: "+911234567890",
      });

      expect(result.error).toBeNull();
    });

    it("validates email format", async () => {
      await expect(supabaseAuth.signInWithOTP("invalid-email")).rejects.toThrow("valid email");
    });

    it("validates phone format", async () => {
      await expect(supabaseAuth.signInWithOTP("1234567890")).rejects.toThrow(
        "valid email address or phone number",
      );
    });
  });

  describe("verifyOTP", () => {
    it("verifies email OTP", async () => {
      const result = await supabaseAuth.verifyOTP("test@example.com", "123456", "email");

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        token: "123456",
        type: "email",
      });

      expect(result.data?.user).toBeDefined();
      expect(result.data?.session).toBeDefined();
    });

    it("verifies phone OTP", async () => {
      const result = await supabaseAuth.verifyOTP("+911234567890", "123456", "sms");

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        phone: "+911234567890",
        token: "123456",
        type: "sms",
      });

      expect(result.data?.user).toBeDefined();
    });

    it("validates OTP format", async () => {
      await expect(supabaseAuth.verifyOTP("test@example.com", "12345", "email")).rejects.toThrow(
        "6-digit",
      );
    });
  });

  describe("signInWithOAuth", () => {
    it("initiates Google OAuth", async () => {
      const result = await supabaseAuth.signInWithOAuth("google");

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });

      expect(result.data?.url).toBeDefined();
    });

    it("supports custom redirect URL", async () => {
      await supabaseAuth.signInWithOAuth("google", "/dashboard");

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "/dashboard",
        },
      });
    });
  });

  describe("signOut", () => {
    it("signs out the user", async () => {
      const result = await supabaseAuth.signOut();

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe("getUser", () => {
    it("retrieves current user", async () => {
      const user = await supabaseAuth.getUser();

      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(user).toBeDefined();
      expect(user?.email).toBe("test@example.com");
    });

    it("returns null when not authenticated", async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const user = await supabaseAuth.getUser();

      expect(user).toBeNull();
    });
  });

  describe("getSession", () => {
    it("retrieves current session", async () => {
      const session = await supabaseAuth.getSession();

      expect(mockAuth.getSession).toHaveBeenCalled();
      expect(session).toBeDefined();
      expect(session?.access_token).toBe("mock-access-token");
    });
  });
});
