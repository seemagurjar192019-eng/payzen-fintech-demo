import { describe, expect, it } from "vitest";
import { evaluate, press, validate, SEED } from "./payzen";

describe("payzen rules", () => {
  it("starts with ₹7,854.43", () => expect(SEED.balance).toBe(7854.43));
  it("evaluates with precedence", () => expect(evaluate("100+20×2")).toBe(140));
  it("division by zero is invalid", () => expect(evaluate("5÷0")).toBeNaN());
  it("limits to two decimals", () => expect(press("1.25", "3")).toBe("1.25"));
  it("rejects zero", () => expect(validate(0, 100, "send").ok).toBe(false));
  it("rejects sending more than balance", () => expect(validate(7854.44, 7854.43, "send").ok).toBe(false));
  it("allows sending exact balance", () => expect(validate(7854.43, 7854.43, "send").ok).toBe(true));
  it("requests may exceed balance", () => expect(validate(9000, 100, "request").ok).toBe(true));
});
