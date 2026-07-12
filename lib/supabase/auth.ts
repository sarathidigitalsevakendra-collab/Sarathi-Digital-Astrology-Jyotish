import { createClient } from "./client";
import type { Provider } from "@supabase/supabase-js";
import { detectInputType, validateEmail, validatePhone, validateOTP } from "@/lib/validation";

export const supabaseAuth = {
  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string) {
    const supabase = createClient();
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, metadata?: Record<string, unknown>) {
    const supabase = createClient();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  },

  /**
   * Sign in with OAuth provider (Google, GitHub, etc.)
   */
  async signInWithOAuth(provider: Provider, redirectTo?: string) {
    const supabase = createClient();
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });
  },

  /**
   * Sign in with Magic Link (passwordless email link)
   */
  async signInWithMagicLink(email: string, redirectTo?: string) {
    const supabase = createClient();

    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Use window.location.origin in browser — this correctly gives
    // http://localhost:3000 locally and https://yourapp.com in production.
    // NOTE: For this to work locally, http://localhost:3000/** must be in
    // the Supabase Dashboard > Authentication > URL Configuration > Redirect URLs.
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const callbackUrl = redirectTo || `${origin}/auth/callback`;

    return await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: callbackUrl,
      },
    });
  },

  /**
   * Sign in with OTP (email or phone)
   */
  async signInWithOTP(emailOrPhone: string) {
    const supabase = createClient();

    const inputType = detectInputType(emailOrPhone);

    if (inputType === "invalid") {
      throw new Error("Please enter a valid email address or phone number");
    }

    if (inputType === "email") {
      if (!validateEmail(emailOrPhone)) {
        throw new Error("Please enter a valid email address");
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      return await supabase.auth.signInWithOtp({
        email: emailOrPhone.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
    } else {
      if (!validatePhone(emailOrPhone)) {
        throw new Error("Please enter a valid phone number (e.g., +911234567890)");
      }
      return await supabase.auth.signInWithOtp({
        phone: emailOrPhone.trim(),
      });
    }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(emailOrPhone: string, token: string, type: "email" | "sms" = "email") {
    const supabase = createClient();

    // Validate OTP format
    if (!validateOTP(token)) {
      throw new Error("Please enter a valid 6-digit code");
    }

    const isEmail = type === "email";

    if (isEmail) {
      return await supabase.auth.verifyOtp({
        email: emailOrPhone.trim().toLowerCase(),
        token: token.trim(),
        type: "email",
      });
    } else {
      return await supabase.auth.verifyOtp({
        phone: emailOrPhone.trim(),
        token: token.trim(),
        type: "sms",
      });
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    const supabase = createClient();
    return await supabase.auth.signOut();
  },

  /**
   * Get current user
   */
  async getUser() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Get current session
   */
  async getSession() {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const supabase = createClient();
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const supabase = createClient();
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  },

  /**
   * Update user metadata
   */
  async updateUser(updates: { email?: string; password?: string; data?: Record<string, unknown> }) {
    const supabase = createClient();
    return await supabase.auth.updateUser(updates);
  },
};
