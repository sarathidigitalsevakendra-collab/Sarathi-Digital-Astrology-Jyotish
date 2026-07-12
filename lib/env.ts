/**
 * Environment Variable Validation
 *
 * Validates required environment variables at application startup
 * to prevent runtime errors and improve developer experience.
 */

interface EnvConfig {
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

  // Database (Required)
  DATABASE_URL: string;

  // Astrology Provider (Required)
  JYOTISH_API_URL: string;
  JYOTISH_API_KEY?: string;
  FREE_ASTROLOGY_API_KEY?: string;

  // Python Astrology Service (Required for production)
  ASTRO_PYTHON_SERVICE_URL?: string;
  ASTRO_PYTHON_SERVICE_TIMEOUT_MS?: string;

  // Internal API Security
  API_INTERNAL_SECRET?: string;

  // Optional
  OPENAI_API_KEY?: string;

  // Deprecated (being migrated to Next.js API routes)
  ASTRO_CORE_URL?: string;
  COMMERCE_SERVICE_URL?: string;
}

/**
 * Required environment variables that must be present
 */
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
  "JYOTISH_API_URL",
] as const;

/**
 * Optional environment variables with default values
 */
const OPTIONAL_ENV_VARS = {
  ASTRO_PYTHON_SERVICE_URL: "http://localhost:4001",
  ASTRO_PYTHON_SERVICE_TIMEOUT_MS: "10000",
  JYOTISH_API_TIMEOUT_MS: "8000",
  OPENAI_TIMEOUT_MS: "10000",
  OPENAI_MODEL: "gpt-4o-mini",
  OPENAI_BASE_URL: "https://api.openai.com/v1",

  // Deprecated - for backward compatibility during migration
  ASTRO_CORE_URL: "http://localhost:4001/api/astro-core",
  COMMERCE_SERVICE_URL: "http://localhost:4002/api/commerce",
} as const;

/**
 * Validates that a URL string is properly formatted
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
}

/**
 * Validates a specific environment variable
 */
function validateEnvVar(name: string, value: string | undefined): string | null {
  if (!value || value.trim() === "") {
    return `Missing required environment variable: ${name}`;
  }

  // URL validation for known URL variables
  if (name.includes("URL") || name.includes("_CORE") || name.includes("_SERVICE")) {
    if (!isValidUrl(value)) {
      return `Invalid URL format for ${name}: ${value}`;
    }
  }

  // Supabase URL should be https in production
  if (name === "NEXT_PUBLIC_SUPABASE_URL") {
    if (process.env.NODE_ENV === "production" && !value.startsWith("https://")) {
      return `${name} must use HTTPS in production`;
    }
  }

  return null;
}

/**
 * Validates all required environment variables
 * Throws an error with detailed message if validation fails
 */
// eslint-disable-next-line complexity, max-lines-per-function
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Validate required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    const error = validateEnvVar(varName, value);

    if (error) {
      errors.push(error);
    }
  }

  // Report all errors at once
  if (errors.length > 0) {
    const errorMessage = [
      "❌ Environment variable validation failed:",
      "",
      ...errors.map((err) => `  • ${err}`),
      "",
      "💡 Create a .env.local file with the required variables.",
      "   See .env.example for reference.",
    ].join("\n");

    throw new Error(errorMessage);
  }

  // Apply defaults for optional variables
  for (const [key, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  // Return validated config
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    DATABASE_URL: process.env.DATABASE_URL!,
    JYOTISH_API_URL: process.env.JYOTISH_API_URL!,
    JYOTISH_API_KEY: process.env.JYOTISH_API_KEY,
    FREE_ASTROLOGY_API_KEY: process.env.FREE_ASTROLOGY_API_KEY,
    ASTRO_PYTHON_SERVICE_URL: process.env.ASTRO_PYTHON_SERVICE_URL,
    ASTRO_PYTHON_SERVICE_TIMEOUT_MS: process.env.ASTRO_PYTHON_SERVICE_TIMEOUT_MS,
    API_INTERNAL_SECRET: process.env.API_INTERNAL_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // Deprecated
    ASTRO_CORE_URL: process.env.ASTRO_CORE_URL,
    COMMERCE_SERVICE_URL: process.env.COMMERCE_SERVICE_URL,
  };
}

/**
 * Get validated environment configuration
 * Call this at the top of your entry point files
 */
export function getEnv(): EnvConfig {
  return validateEnv();
}

// Auto-validate in development and production
// Skip validation during build time to allow for build-time environment injection
if (process.env.NODE_ENV !== "test" && typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error: unknown) {
    // Only throw during runtime, not during build
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      console.error(error);
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
    }
  }
}
