/**
 * Timezone Utility Functions
 * Handles conversion between UTC and local timezones for birth time display
 */

import { format, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/**
 * Format birth time for display
 * Handles multiple input formats:
 * - "HH:MM" (24-hour format, e.g., "01:10")
 * - "19:40:00.000Z" (UTC timestamp string)
 * - DateTime object
 *
 * @param birthTime - The birth time from the database
 * @param birthDate - Optional birth date for full DateTime context
 * @param timezone - Target timezone (default: "Asia/Kolkata" for IST)
 * @returns Formatted time string (e.g., "01:10 AM") or null
 */
// eslint-disable-next-line complexity, max-lines-per-function
export function formatBirthTime(
  birthTime: string | Date | null | undefined,
  birthDate?: string | Date | null,
  timezone: string = "Asia/Kolkata",
): string | null {
  if (!birthTime) return null;

  try {
    // Case 1: birthTime is already in "HH:MM" format (expected format)
    if (typeof birthTime === "string" && /^\d{1,2}:\d{2}$/.test(birthTime)) {
      // Parse HH:MM and format to 12-hour with AM/PM
      const [hours, minutes] = birthTime.split(":").map(Number);
      if (hours !== undefined && minutes !== undefined) {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return format(date, "hh:mm a"); // e.g., "01:10 AM"
      }
    }

    // Case 2: birthTime contains UTC timestamp (e.g., "19:40:00.000Z")
    if (typeof birthTime === "string" && birthTime.includes("Z")) {
      // Handle time-only UTC strings (missing date part)
      let dateTimeStr = birthTime;

      // If birthTime is just time with Z (e.g., "19:40:00.000Z"), prepend today's date
      if (/^\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(birthTime)) {
        // Use provided birthDate or today's date
        const datePrefix = birthDate
          ? typeof birthDate === "string"
            ? (birthDate.split("T")[0] ?? "")
            : format(birthDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");
        dateTimeStr = `${datePrefix}T${birthTime}`;
      }

      // Parse ISO string and convert to target timezone
      const utcDate = parseISO(dateTimeStr);
      if (isNaN(utcDate.getTime())) {
        return null; // Invalid date
      }
      return formatInTimeZone(utcDate, timezone, "hh:mm a");
    }

    // Case 3: birthTime is a Date object
    if (birthTime instanceof Date) {
      return formatInTimeZone(birthTime, timezone, "hh:mm a");
    }

    // Case 4: birthTime is ISO string with date (e.g., "2025-12-01T19:40:00.000Z")
    if (typeof birthTime === "string") {
      try {
        const parsed = parseISO(birthTime);
        if (!isNaN(parsed.getTime())) {
          return formatInTimeZone(parsed, timezone, "hh:mm a");
        }
      } catch {
        // Fall through to return null
      }
    }

    return null;
  } catch (error: unknown) {
    console.error("Error formatting birth time:", error, { birthTime, timezone });
    return null;
  }
}

/**
 * Format birth time with date for full context
 * Combines birth date and time into a single formatted string
 *
 * @param birthDate - Birth date from database
 * @param birthTime - Birth time from database
 * @param timezone - Target timezone
 * @returns Formatted string (e.g., "December 1, 2025 at 01:10 AM IST")
 */
export function formatBirthDateTime(
  birthDate: string | Date | null | undefined,
  birthTime: string | Date | null | undefined,
  timezone: string = "Asia/Kolkata",
): string | null {
  if (!birthDate) return null;

  try {
    const date = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
    const formattedDate = format(date, "MMMM d, yyyy");
    const formattedTime = formatBirthTime(birthTime, birthDate, timezone);

    if (formattedTime) {
      const tzAbbr = getTimezoneAbbreviation(timezone);
      return `${formattedDate} at ${formattedTime} ${tzAbbr}`;
    }

    return formattedDate;
  } catch (error: unknown) {
    console.error("Error formatting birth date time:", error);
    return null;
  }
}

/**
 * Get timezone abbreviation
 * Maps common timezone identifiers to their abbreviations
 *
 * @param timezone - IANA timezone identifier
 * @returns Timezone abbreviation (e.g., "IST", "EST")
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const abbreviations: Record<string, string> = {
    "Asia/Kolkata": "IST",
    "Asia/Calcutta": "IST",
    "America/New_York": "EST",
    "America/Los_Angeles": "PST",
    "Europe/London": "GMT",
    "Europe/Paris": "CET",
    "Asia/Dubai": "GST",
    "Asia/Singapore": "SGT",
    "Australia/Sydney": "AEDT",
  };

  return abbreviations[timezone] || "";
}

/**
 * Parse time string to 24-hour format
 * Converts various time formats to HH:MM 24-hour format for storage
 *
 * @param timeString - Time string (e.g., "01:10 AM", "13:30", "1:10 pm")
 * @returns 24-hour format string (e.g., "01:10", "13:30") or null
 */
export function parseTimeTo24Hour(timeString: string | null | undefined): string | null {
  if (!timeString) return null;

  try {
    // Already in 24-hour format (HH:MM or H:MM)
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (
        hours !== undefined &&
        minutes !== undefined &&
        hours >= 0 &&
        hours < 24 &&
        minutes >= 0 &&
        minutes < 60
      ) {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }
    }

    // 12-hour format with AM/PM
    const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match && match[1] && match[2] && match[3]) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3].toLowerCase();

      if (meridiem === "pm" && hours !== 12) {
        hours += 12;
      } else if (meridiem === "am" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error parsing time to 24-hour format:", error, { timeString });
    return null;
  }
}

/**
 * Convert local time to UTC for storage
 * Takes a time in local timezone and converts to UTC DateTime string
 *
 * @param date - Birth date
 * @param time - Time in HH:MM format
 * @param timezone - Source timezone
 * @returns ISO string in UTC
 */
export function convertLocalTimeToUTC(
  date: string | Date,
  time: string,
  timezone: string = "Asia/Kolkata",
): string {
  try {
    const dateStr = typeof date === "string" ? date : format(date, "yyyy-MM-dd");
    const dateTimeStr = `${dateStr}T${time}:00`;

    // Create a date in the specified timezone
    const zonedDate = toZonedTime(dateTimeStr, timezone);

    // Return as ISO string (UTC)
    return zonedDate.toISOString();
  } catch (error: unknown) {
    console.error("Error converting local time to UTC:", error);
    throw error;
  }
}

/**
 * Extract time from UTC DateTime string
 * Gets the local time component from a UTC DateTime
 *
 * @param utcDateTime - UTC DateTime string (e.g., "2025-12-01T19:40:00.000Z")
 * @param timezone - Target timezone
 * @returns Time in HH:MM format
 */
export function extractTimeFromUTC(
  utcDateTime: string | Date,
  timezone: string = "Asia/Kolkata",
): string | null {
  try {
    const date = typeof utcDateTime === "string" ? parseISO(utcDateTime) : utcDateTime;
    return formatInTimeZone(date, timezone, "HH:mm");
  } catch (error: unknown) {
    console.error("Error extracting time from UTC:", error);
    return null;
  }
}
