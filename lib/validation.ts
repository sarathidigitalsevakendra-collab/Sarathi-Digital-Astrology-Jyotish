/**
 * Input Validation Utilities
 *
 * Provides secure validation functions for user inputs
 */

/**
 * Validates email format using RFC 5322 compliant regex
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Validates phone number in E.164 international format
 * Format: +[country code][number]
 * Example: +911234567890
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;

  // E.164 format: + followed by 1-3 digit country code and 4-14 digit number
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  return phoneRegex.test(phone.trim());
}

/**
 * Validates OTP code format (6 digits)
 */
export function validateOTP(otp: string): boolean {
  if (!otp || typeof otp !== "string") return false;

  return /^\d{6}$/.test(otp.trim());
}

/**
 * Sanitizes string input by trimming and converting to lowercase
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input.trim().toLowerCase();
}

/**
 * Validates and sanitizes email input
 * Returns sanitized email or null if invalid
 */
export function validateAndSanitizeEmail(email: string): string | null {
  const sanitized = sanitizeInput(email);

  if (!validateEmail(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Validates and sanitizes phone input
 * Returns sanitized phone or null if invalid
 */
export function validateAndSanitizePhone(phone: string): string | null {
  const trimmed = phone.trim();

  if (!validatePhone(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Detects if input is email or phone number
 * Returns 'email', 'phone', or 'invalid'
 */
export function detectInputType(input: string): "email" | "phone" | "invalid" {
  if (!input || typeof input !== "string") return "invalid";

  const trimmed = input.trim();

  if (validateEmail(trimmed)) {
    return "email";
  }

  if (validatePhone(trimmed)) {
    return "phone";
  }

  return "invalid";
}

/**
 * Validation error messages
 */
export const ValidationErrors = {
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number (e.g., +911234567890)",
  INVALID_OTP: "Please enter a valid 6-digit code",
  INVALID_INPUT: "Please enter a valid email or phone number",
  REQUIRED_FIELD: "This field is required",
  OTP_EXPIRED: "Your code has expired. Please request a new one",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please try again in 15 minutes",
} as const;

/**
 * Validates email and returns appropriate error message
 */
export function getEmailError(email: string): string | null {
  if (!email) return ValidationErrors.REQUIRED_FIELD;
  if (!validateEmail(email)) return ValidationErrors.INVALID_EMAIL;
  return null;
}

/**
 * Validates phone and returns appropriate error message
 */
export function getPhoneError(phone: string): string | null {
  if (!phone) return ValidationErrors.REQUIRED_FIELD;
  if (!validatePhone(phone)) return ValidationErrors.INVALID_PHONE;
  return null;
}

/**
 * Validates OTP and returns appropriate error message
 */
export function getOTPError(otp: string): string | null {
  if (!otp) return ValidationErrors.REQUIRED_FIELD;
  if (!validateOTP(otp)) return ValidationErrors.INVALID_OTP;
  return null;
}

/**
 * Validates email or phone and returns appropriate error message
 */
export function getEmailOrPhoneError(input: string): string | null {
  if (!input) return ValidationErrors.REQUIRED_FIELD;

  const type = detectInputType(input);

  if (type === "invalid") {
    return ValidationErrors.INVALID_INPUT;
  }

  return null;
}
