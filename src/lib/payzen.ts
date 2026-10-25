// PayZen demo logic — fictional data only. No real payments are ever made.

export type TxStatus = "completed" | "pending" | "cancelled";
export type TxKind = "sent" | "received" | "request";
export interface Tx {
  id: string;
  ref: string;
  name: string;
  icon: string; // lucide key or recipient id
  amount: number; // INR, signed for sent/received
  kind: TxKind;
  status: TxStatus;
  date: string; // ISO
  recipientId?: string;
}
export interface Recipient {
  id: string;
  name: string;
  handle: string;
  hue: number;
}
export type Currency = "INR" | "USD" | "EUR";
export interface PayState {
  balance: number;
  txs: Tx[];
  recipients: Recipient[];
  currency: Currency;
}

export const RATES: Record<Currency, number> = { INR: 1, USD: 1 / 84, EUR: 1 / 91 };

export const SEED: PayState = {
  balance: 7854.43,
  currency: "INR",
  recipients: [
    { id: "r1", name: "Pavlo", handle: "pavlo.demo@payzen", hue: 30 },
    { id: "r2", name: "Aanya", handle: "aanya.k@payzen", hue: 330 },
    { id: "r3", name: "Rohan", handle: "rohan.m@payzen", hue: 200 },
    { id: "r4", name: "Mira", handle: "mira.s@payzen", hue: 150 },
    { id: "r5", name: "Kabir", handle: "kabir.dev@payzen", hue: 260 },
    { id: "r6", name: "Zoya", handle: "zoya.art@payzen", hue: 10 },
    { id: "r7", name: "Ishaan", handle: "ishaan.p@payzen", hue: 90 },
    { id: "r8", name: "Leela", handle: "leela.r@payzen", hue: 50 },
  ],
  txs: [
    { id: "t1", ref: "PZ-DEMO-A1F3", name: "Orchard Café", icon: "coffee", amount: -240, kind: "sent", status: "completed", date: "2026-10-24T09:12:00Z" },
    { id: "t2", ref: "PZ-DEMO-B7K2", name: "Streamly", icon: "tv", amount: -499, kind: "sent", status: "completed", date: "2026-10-23T18:40:00Z" },
    { id: "t3", ref: "PZ-DEMO-C9Q8", name: "Salary (demo)", icon: "briefcase", amount: 2000, kind: "received", status: "completed", date: "2026-10-22T10:00:00Z" },
    { id: "t4", ref: "PZ-DEMO-D2M5", name: "Metro Rides", icon: "car", amount: -120, kind: "sent", status: "completed", date: "2026-10-21T08:05:00Z" },
    { id: "t5", ref: "PZ-DEMO-E4P1", name: "Green Basket", icon: "shopping", amount: -526, kind: "sent", status: "completed", date: "2026-10-20T16:22:00Z" },
  ],
};

export function makeRef(): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
  return `PZ-DEMO-${s}`;
}

export function fmt(amountInr: number, cur: Currency, opts: { sign?: boolean } = {}) {
  const v = amountInr * RATES[cur];
  const s = new Intl.NumberFormat(cur === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(v));
  if (!opts.sign) return v < 0 ? `-${s}` : s;
  return `${v < 0 ? "−" : "+"}${s}`;
}

export function symbol(cur: Currency) {
  return cur === "INR" ? "₹" : cur === "USD" ? "$" : "€";
}

// ---------- calculator ----------
export type Op = "+" | "−" | "×" | "÷";
export const OPS: Op[] = ["+", "−", "×", "÷"];

/** Evaluate an expression like "120+30×2" with normal precedence. Returns NaN if invalid. */
export function evaluate(expr: string): number {
  if (!expr) return 0;
  const tokens = expr.match(/(\d*\.?\d+|\d+\.|[+−×÷])/g);
  if (!tokens || tokens.join("") !== expr) return NaN;
  const nums: number[] = [];
  const ops: Op[] = [];
  let expectNum = true;
  for (const t of tokens) {
    if (OPS.includes(t as Op)) {
      if (expectNum) return NaN;
      ops.push(t as Op);
      expectNum = true;
    } else {
      if (!expectNum) return NaN;
      nums.push(parseFloat(t));
      expectNum = false;
    }
  }
  if (expectNum) ops.pop(); // trailing operator ignored
  // first pass × ÷
  const n2: number[] = [nums[0]];
  const o2: Op[] = [];
  for (let i = 0; i < ops.length; i++) {
    const b = nums[i + 1];
    if (ops[i] === "×") n2[n2.length - 1] *= b;
    else if (ops[i] === "÷") {
      if (b === 0) return NaN;
      n2[n2.length - 1] /= b;
    } else {
      o2.push(ops[i]);
      n2.push(b);
    }
  }
  let r = n2[0];
  for (let i = 0; i < o2.length; i++) r = o2[i] === "+" ? r + n2[i + 1] : r - n2[i + 1];
  return Math.round(r * 100) / 100;
}

/** Apply a keypad press to an expression string. */
export function press(expr: string, key: string): string {
  const last = expr.slice(-1);
  const curNum = expr.split(/[+−×÷]/).pop() ?? "";
  if (key === "del") return expr.slice(0, -1);
  if (OPS.includes(key as Op)) {
    if (!expr) return expr;
    if (OPS.includes(last as Op)) return expr.slice(0, -1) + key;
    return expr + key;
  }
  if (key === ".") {
    if (curNum.includes(".")) return expr;
    return expr + (curNum === "" ? "0." : ".");
  }
  // digit
  if (curNum.includes(".") && curNum.split(".")[1].length >= 2) return expr;
  if (curNum.replace(".", "").length >= 9) return expr;
  if (curNum === "0") return expr.slice(0, -1) + key;
  return expr + key;
}

export type Validation = { ok: true } | { ok: false; reason: string };
export function validate(amount: number, balance: number, mode: "send" | "request"): Validation {
  if (!Number.isFinite(amount)) return { ok: false, reason: "Invalid amount" };
  if (amount <= 0) return { ok: false, reason: amount === 0 ? "Enter an amount" : "Amount must be positive" };
  if (amount > 1_000_000) return { ok: false, reason: "Demo limit is ₹10,00,000" };
  if (mode === "send" && amount > balance) return { ok: false, reason: "Insufficient demo balance" };
  return { ok: true };
}
