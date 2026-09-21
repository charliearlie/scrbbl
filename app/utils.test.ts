import {
  dateTimeLocalToSeconds,
  toDateTimeLocalValue,
  validateEmail,
} from "./utils";
import { describe, expect, it } from "vitest";

describe("validateEmail", () => {
  it("should return false for non-emails", () => {
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("not-an-email")).toBe(false);
    expect(validateEmail("n@")).toBe(false);
  });

  it("should return true for emails", () => {
    expect(validateEmail("kody@example.com")).toBe(true);
  });
});

describe("toDateTimeLocalValue", () => {
  it("formats in local time, not UTC", () => {
    // Constructed from local parts, so this is 21:22 wherever the test runs.
    const date = new Date(2026, 8, 21, 21, 22);
    expect(toDateTimeLocalValue(date)).toBe("2026-09-21T21:22");
  });

  it("pads single digit months, days, hours and minutes", () => {
    expect(toDateTimeLocalValue(new Date(2026, 0, 5, 9, 7))).toBe(
      "2026-01-05T09:07"
    );
  });
});

describe("dateTimeLocalToSeconds", () => {
  it("round-trips a local datetime", () => {
    const date = new Date(2026, 8, 21, 21, 22);
    expect(dateTimeLocalToSeconds(toDateTimeLocalValue(date))).toBe(
      Math.floor(date.getTime() / 1000)
    );
  });

  it("returns NaN for something unparseable", () => {
    expect(dateTimeLocalToSeconds("not a date")).toBeNaN();
  });
});
