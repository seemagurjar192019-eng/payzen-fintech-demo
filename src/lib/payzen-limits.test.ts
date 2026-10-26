import { describe, expect, it } from "vitest";
import { lockoutAfter, sentToday, withinDailyLimit, isValidPin, type Tx } from "./payzen";

const tx = (amount: number, date: string): Tx => ({ id: date + amount, ref: "r", name: "x", icon: "x", amount, kind: "sent", status: "completed", date });

describe("daily send limit", () => {
  it("default limit is ₹10,000: 10,000 allowed, 10,001 blocked", () => {
    expect(withinDailyLimit(10_000, 0)).toBe(true);
    expect(withinDailyLimit(1, 10_000)).toBe(false);
  });
  it("counts only today's sends", () => {
    const now = new Date("2026-10-26T12:00:00");
    expect(sentToday([tx(-500, "2026-10-26T09:00:00"), tx(-900, "2026-10-25T09:00:00")], now)).toBe(500);
  });
});
describe("PIN", () => {
  it("locks for 30s after 5 failed attempts", () => {
    expect(lockoutAfter(4, 1000)).toBeNull();
    expect(lockoutAfter(5, 1000)).toBe(31_000);
  });
  it("requires exactly 4 digits", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("12a4")).toBe(false);
  });
});
