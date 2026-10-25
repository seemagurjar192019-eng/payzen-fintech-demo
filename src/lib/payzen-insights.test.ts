import { describe, expect, it } from "vitest";
import { SEED, type Tx } from "./payzen";
import { applySandboxTopUp, monthlyInsights } from "./payzen-insights";

const topUp: Tx = { id: "topup-1", ref: "PZ-DEMO-TOPUP", name: "Sandbox top-up", icon: "briefcase", amount: 500, kind: "received", status: "completed", date: "2026-10-25T07:30:00Z" };
describe("sandbox wallet and insights", () => {
  it("credits a ₹500 simulated top-up exactly once", () => {
    const first = applySandboxTopUp(SEED, topUp);
    expect(first?.balance).toBe(8354.43);
    expect(first && applySandboxTopUp(first, topUp)?.balance).toBe(8354.43);
  });
  it("rejects top-ups beyond the existing ₹10,00,000 demo limit", () => expect(applySandboxTopUp(SEED, { ...topUp, amount: 1000001 })).toBeNull());
  it("rejects non-finite and negative top-ups", () => {
    expect(applySandboxTopUp(SEED, { ...topUp, amount: NaN })).toBeNull();
    expect(applySandboxTopUp(SEED, { ...topUp, amount: -500 })).toBeNull();
  });
  it("reports ₹1,385 spent and ₹2,000 received for October seed transactions", () => {
    const result = monthlyInsights(SEED.txs, "2026-10", 2000);
    expect(result.spent).toBe(1385); expect(result.received).toBe(2000); expect(result.remaining).toBe(615);
  });
  it("excludes pending requests and other months", () => {
    expect(monthlyInsights([...SEED.txs, { ...topUp, kind: "request", status: "pending" }], "2026-11").spent).toBe(0);
  });
  it("flags overspending without negative remaining budget", () => {
    const result = monthlyInsights(SEED.txs, "2026-10", 1000);
    expect(result.overBudget).toBe(true); expect(result.remaining).toBe(0);
  });
});