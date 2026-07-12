/**
 * API Authentication Utilities
 *
 * Provides helpers for extracting and validating user sessions
 * from Supabase in API routes.
 */

import { createClient } from "@/lib/supabase/server";
import { ApiError, ApiErrors } from "./route-handler";

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  role?: string;
}

/**
 * Get the current authenticated user from the request
 * Throws ApiError if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw ApiErrors.unauthorized("Authentication required");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role,
  };
}

/**
 * Get the current user, returns null if not authenticated
 */
export async function getOptionalAuth(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require a specific role
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!user.role || !allowedRoles.includes(user.role)) {
    throw ApiErrors.forbidden("You do not have permission to access this resource");
  }

  return user;
}

/**
 * Validate internal API secret for service-to-service communication
 */
export function validateInternalSecret(secret: string | null): void {
  const expectedSecret = process.env.API_INTERNAL_SECRET;

  if (!expectedSecret) {
    throw new ApiError("SERVER_MISCONFIGURATION", "API_INTERNAL_SECRET not configured", 500);
  }

  if (!secret || secret !== expectedSecret) {
    throw ApiErrors.unauthorized("Invalid API secret");
  }
}
