/**
 * Quick Test Script for Timezone Utility
 * Run: npx tsx apps/web/lib/utils/__test-timezone.ts
 */

import { formatBirthTime } from "./timezone";

console.error("🧪 Testing Timezone Conversion Fix\n");
console.error("=".repeat(50));

// Test Case 1: UTC timestamp without date (YOUR ISSUE)
console.error('\n📝 Test Case 1: UTC timestamp "19:40:00.000Z"');
console.error('Input: "19:40:00.000Z"');
console.error('Expected: "01:10 AM" (IST)');
const result1 = formatBirthTime("19:40:00.000Z", "2025-12-01");
console.error("Result:", result1);
console.error("Status:", result1 === "01:10 AM" ? "✅ PASS" : "❌ FAIL");

// Test Case 2: HH:MM format
console.error('\n📝 Test Case 2: HH:MM format "01:10"');
console.error('Input: "01:10"');
console.error('Expected: "01:10 AM"');
const result2 = formatBirthTime("01:10");
console.error("Result:", result2);
console.error("Status:", result2 === "01:10 AM" ? "✅ PASS" : "❌ FAIL");

// Test Case 3: Complete ISO string
console.error('\n📝 Test Case 3: Complete ISO "2025-12-01T19:40:00.000Z"');
console.error('Input: "2025-12-01T19:40:00.000Z"');
console.error('Expected: "01:10 AM" (IST)');
const result3 = formatBirthTime("2025-12-01T19:40:00.000Z");
console.error("Result:", result3);
console.error("Status:", result3 === "01:10 AM" ? "✅ PASS" : "❌ FAIL");

// Test Case 4: Null input
console.error("\n📝 Test Case 4: Null input");
console.error("Input: null");
console.error("Expected: null");
const result4 = formatBirthTime(null);
console.error("Result:", result4);
console.error("Status:", result4 === null ? "✅ PASS" : "❌ FAIL");

// Test Case 5: PM time
console.error('\n📝 Test Case 5: PM time "13:30"');
console.error('Input: "13:30"');
console.error('Expected: "01:30 PM"');
const result5 = formatBirthTime("13:30");
console.error("Result:", result5);
console.error("Status:", result5 === "01:30 PM" ? "✅ PASS" : "❌ FAIL");

// Test Case 6: UTC timestamp with milliseconds
console.error('\n📝 Test Case 6: UTC "19:40:00.123Z" with birthDate');
console.error('Input: "19:40:00.123Z" + birthDate: "2025-12-01"');
console.error('Expected: "01:10 AM" (IST)');
const result6 = formatBirthTime("19:40:00.123Z", "2025-12-01");
console.error("Result:", result6);
console.error("Status:", result6 === "01:10 AM" ? "✅ PASS" : "❌ FAIL");

console.error(`\n${"=".repeat(50)}`);
console.error("🎯 All tests completed!\n");
