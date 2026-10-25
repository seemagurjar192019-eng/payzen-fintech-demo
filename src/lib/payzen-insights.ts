import { fmt, validate, type Currency, type PayState, type Tx } from "./payzen";

export function monthlyInsights(txs: Tx[], month: string, budget = 0) {
  const rows = txs.filter((t) => t.date.slice(0, 7) === month && t.status === "completed");
  const spent = Math.round(rows.filter((t) => t.kind === "sent").reduce((sum, t) => sum + Math.abs(t.amount), 0) * 100) / 100;
  const received = Math.round(rows.filter((t) => t.kind === "received").reduce((sum, t) => sum + t.amount, 0) * 100) / 100;
  const categories = new Map<string, number>();
  const labels: Record<string, string> = { coffee: "Food & drink", tv: "Subscriptions", car: "Transport", shopping: "Shopping" };
  rows.filter((t) => t.kind === "sent").forEach((t) => {
    const label = labels[t.icon] ?? "Transfers";
    categories.set(label, (categories.get(label) ?? 0) + Math.abs(t.amount));
  });
  return { spent, received, remaining: Math.max(0, budget - spent), overBudget: budget > 0 && spent > budget, categories: [...categories].sort((a, b) => b[1] - a[1]) };
}

export function applySandboxTopUp(state: PayState, tx: Tx): PayState | null {
  if (tx.kind !== "received" || tx.status !== "completed" || !validate(tx.amount, state.balance, "request").ok) return null;
  if (state.txs.some((row) => row.id === tx.id || row.ref === tx.ref)) return state;
  return { ...state, balance: Math.round((state.balance + tx.amount) * 100) / 100, txs: [tx, ...state.txs] };
}

export function receiptText(tx: Tx, currency: Currency) {
  return ["PayZen — SIMULATED TRANSACTION RECEIPT", "No real money transferred. Not a bank receipt.", "", `Reference: ${tx.ref}`, `Name: ${tx.name}`, `Amount: ${fmt(tx.amount, currency, { sign: tx.kind !== "request" })}`, `Base amount (INR): ${tx.amount.toFixed(2)}`, `Type: ${tx.kind}`, `Status: ${tx.status}`, `Date (UTC): ${tx.date}`, "", "Currency conversion uses illustrative demo rates."].join("\n");
}

export function downloadReceipt(tx: Tx, currency: Currency) {
  const url = URL.createObjectURL(new Blob([receiptText(tx, currency)], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = `PayZen-${tx.ref}.txt`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}