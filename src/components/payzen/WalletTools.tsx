import { ArrowDownLeft, ArrowUpRight, Check, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { fmt, validate } from "@/lib/payzen";
import { monthlyInsights } from "@/lib/payzen-insights";
import type { PayZen } from "@/lib/use-payzen";
import { DemoBadge, Press, Sheet } from "./ui";

export function WalletTools({ pz, mode, onClose }: { pz: PayZen; mode: "insights" | "topup"; onClose: () => void }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState(String(pz.state.monthlyBudget ?? ""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [review, setReview] = useState(false);
  const data = monthlyInsights(pz.state.txs, month, pz.state.monthlyBudget);
  const input = "h-12 w-full rounded-lg border border-input bg-secondary px-3 text-foreground outline-none focus:ring-2 focus:ring-ring";
  return <Sheet onClose={onClose}>
    <div className="no-scrollbar max-h-[75dvh] overflow-y-auto">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{mode === "insights" ? "Spending insights" : "Add demo money"}</h2><Press aria-label="Close wallet tools" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-secondary"><X className="size-4" /></Press></div>
      {mode === "insights" ? <>
        <label className="block text-xs font-semibold">Month<input aria-label="Insights month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={`${input} mt-2`} /></label>
        <div className="my-5 grid grid-cols-2 gap-4 border-y border-border py-4">
          <div><p className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" />Spent</p><p className="mt-1 text-lg font-bold tabular">{fmt(data.spent, pz.state.currency)}</p></div>
          <div><p className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowDownLeft className="size-3" />Received</p><p className="mt-1 text-lg font-bold tabular text-positive">{fmt(data.received, pz.state.currency)}</p></div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const value = Number(budget); if (!Number.isFinite(value) || value < 0) { setError("Enter a valid budget."); return; } pz.setBudget(value); setError(""); toast.success("Sandbox budget saved"); }}>
          <label className="text-xs font-semibold">Monthly budget (₹ INR)<div className="mt-2 flex gap-2"><input aria-label="Monthly budget" type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Not set" className={`${input} min-w-0`} /><Press type="submit" aria-label="Save budget" className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Save className="size-4" /></Press></div></label>
        </form>
        {Boolean(pz.state.monthlyBudget) && <p className={`mt-3 text-sm font-semibold ${data.overBudget ? "text-destructive" : "text-positive"}`}>{data.overBudget ? "Over monthly budget" : `${fmt(data.remaining, pz.state.currency)} remaining`}</p>}
        <h3 className="mb-2 mt-6 text-sm font-semibold">Spending breakdown</h3>
        {data.categories.length ? data.categories.map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-border py-3 text-sm"><span>{label}</span><span className="tabular font-semibold">{fmt(value, pz.state.currency)}</span></div>) : <p className="py-4 text-sm text-muted-foreground">No completed spending this month.</p>}
      </> : success ? <div className="py-5 text-center"><Check className="mx-auto mb-3 size-12 text-positive" /><p className="text-xl font-bold">Demo money added</p><p className="mt-2 tabular">{fmt(Number(amount), "INR")}</p><Press onClick={onClose} className="mt-5 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground">Done</Press></div> : <form onSubmit={(e) => {
        e.preventDefault();
        const value = Number(amount);
        const valid = validate(value, pz.state.balance, "request");
        if (!valid.ok) { setError(valid.reason); return; }
        if (!review) { setReview(true); setError(""); return; }
        if (!pz.topUp(Math.round(value * 100) / 100)) { setError("Unable to add demo money."); return; }
        setSuccess(true); setError("");
      }}>
        {review ? <div className="mb-5"><p className="text-sm text-muted-foreground">Simulated wallet credit</p><p className="my-3 text-3xl font-bold tabular">{fmt(Number(amount), "INR")}</p><p className="text-sm text-muted-foreground">No card or bank will be charged.</p><Press onClick={() => setReview(false)} className="mt-3 text-sm font-semibold underline">Edit amount</Press></div> : <>
          <label className="text-sm font-semibold">Amount (₹ INR)<input aria-label="Top-up amount" required type="number" min="0.01" max="1000000" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${input} mb-4 mt-2 text-xl tabular`} /></label>
          <div className="mb-5 flex gap-2">{[500, 1000, 2000].map((value) => <Press key={value} onClick={() => setAmount(String(value))} className="flex-1 rounded-lg bg-secondary py-2 text-xs font-semibold">+₹{value}</Press>)}</div>
        </>}
        <Press type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"><Plus className="size-4" />{review ? "Confirm simulated top-up" : "Review top-up"}</Press>
      </form>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <DemoBadge className="mt-5 text-muted-foreground" />
    </div>
  </Sheet>;
}