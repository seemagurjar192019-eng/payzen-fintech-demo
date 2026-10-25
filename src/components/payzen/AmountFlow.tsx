import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Delete, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { evaluate, fmt, OPS, press, symbol, validate, type Recipient, type Tx } from "@/lib/payzen";
import type { PayZen } from "@/lib/use-payzen";
import { AnimatedMoney, Avatar, DemoBadge, Press, SwipeConfirm } from "./ui";

type Mode = "send" | "request";
type Step = "enter" | "review" | "success" | "requested";

export function AmountFlow({ pz, initialMode, initialRecipient, onClose }: { pz: PayZen; initialMode: Mode; initialRecipient: Recipient; onClose: () => void }) {
  const { state } = pz;
  const cur = state.currency;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [picker, setPicker] = useState(false);
  const [expr, setExpr] = useState("");
  const [step, setStep] = useState<Step>("enter");
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState<Tx | null>(null);
  const lock = useRef(false);

  // amounts are entered in the display currency and converted to INR internally
  const rate = cur === "INR" ? 1 : cur === "USD" ? 1 / 84 : 1 / 91;
  const display = evaluate(expr);
  const amountInr = Math.round((display / rate) * 100) / 100;
  const v = validate(amountInr, state.balance, mode);
  const hasOp = /[+−×÷]/.test(expr);

  const confirm = () => {
    if (lock.current || !v.ok) return; // duplicate-submission guard
    lock.current = true;
    setBusy(true);
    setTimeout(() => {
      const t = mode === "send" ? pz.send(recipient, amountInr) : pz.request(recipient, amountInr);
      setBusy(false);
      if (!t) {
        lock.current = false;
        setStep("enter");
        return;
      }
      setTx(t);
      setStep(mode === "send" ? "success" : "requested");
    }, 900);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

  return (
    <>
      <motion.div
        className="absolute inset-0 z-40 flex flex-col bg-phone pt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
          className="relative flex flex-1 flex-col rounded-t-[2rem] bg-sheet px-5 pb-6 pt-3 text-foreground"
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-border" />
          <Press onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-secondary">
            <X className="size-4" />
          </Press>

          <div className="mt-3 flex justify-center gap-1">
            {(["send", "request"] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={cn("relative rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors", mode === m ? "text-foreground" : "text-muted-foreground")}>
                {mode === m && <motion.span layoutId="amt-tab" className="absolute inset-0 rounded-full bg-secondary" />}
                <span className="relative">{m}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPicker((p) => !p)} className="mx-auto mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {recipient.name} · Demo wallet 7642 {cur} <ChevronDown className={cn("size-3 transition-transform", picker && "rotate-180")} />
          </button>
          <AnimatePresence>
            {picker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="no-scrollbar flex gap-3 overflow-x-auto py-3">
                  {state.recipients.map((r) => (
                    <button key={r.id} type="button" onClick={() => { setRecipient(r); setPicker(false); }} className={cn("flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl p-1 text-[10px]", r.id === recipient.id && "bg-secondary")}>
                      <Avatar r={r} size={40} />
                      <span className="w-full truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* amount */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <div className={cn("flex items-baseline text-5xl font-extrabold tracking-tight", !expr && "text-muted-foreground/40")} aria-live="polite">
                <span className="mr-1">{symbol(cur)}</span>
                {(expr || "0.00").split("").map((c, i) => (
                  <motion.span key={i + c} initial={{ y: 18, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className={cn(OPS.includes(c as never) && "mx-0.5 text-muted-foreground")}>
                    {c}
                  </motion.span>
                ))}
              </div>
              <AnimatePresence>
                {expr && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                    <Avatar r={recipient} size={30} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {hasOp && Number.isFinite(display) && <p className="tabular mt-1 text-sm font-semibold text-muted-foreground">= {fmt(amountInr, cur)}</p>}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Available demo balance <span className="font-semibold text-foreground">{fmt(state.balance, cur)}</span>
            </p>
            <p className={cn("mt-1 h-4 text-xs font-semibold text-destructive transition-opacity", expr && !v.ok ? "opacity-100" : "opacity-0")}>{!v.ok ? v.reason : ""}</p>
          </div>

          <div className="mb-4">
            <SwipeConfirm tone="light" key={mode + String(v.ok)} disabled={!v.ok} label={mode === "send" ? "Swipe right to review" : "Swipe right to review request"} onConfirm={() => setStep("review")} />
          </div>

          <div className="mb-2 grid grid-cols-4 gap-2">
            {OPS.map((o) => (
              <Press key={o} onClick={() => setExpr((e) => press(e, o))} className="h-10 rounded-full text-xl font-medium text-muted-foreground active:bg-secondary" aria-label={`Operator ${o}`}>
                {o}
              </Press>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-3xl bg-secondary/60 p-2">
            {keys.map((k) => (
              <Press key={k} onClick={() => setExpr((e) => press(e, k))} aria-label={k === "del" ? "Delete" : k} className="grid h-12 place-items-center rounded-2xl bg-sheet text-xl font-semibold shadow-sm active:bg-secondary">
                {k === "del" ? <Delete className="size-5" /> : k}
              </Press>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* review */}
      <AnimatePresence>
        {step === "review" && (
          <motion.div className="absolute inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-phone/70" onClick={() => !busy && setStep("enter")} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-sheet p-6 text-foreground shadow-sheet">
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Review {mode === "send" ? "demo payment" : "demo request"}</p>
              <div className="mt-5 flex flex-col items-center gap-2">
                <Avatar r={recipient} size={56} />
                <p className="font-semibold">{mode === "send" ? "To" : "From"} {recipient.name}</p>
                <p className="text-xs text-muted-foreground">{recipient.handle}</p>
                <p className="tabular mt-2 text-4xl font-extrabold">{fmt(amountInr, cur)}</p>
              </div>
              <dl className="mt-5 space-y-2 rounded-2xl bg-secondary p-4 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">From</dt><dd className="font-semibold">PayZen demo wallet ···· 7642</dd></div>
                {mode === "send" && <div className="flex justify-between"><dt className="text-muted-foreground">Balance after</dt><dd className="tabular font-semibold">{fmt(state.balance - amountInr, cur)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted-foreground">Fee</dt><dd className="font-semibold">{fmt(0, cur)}</dd></div>
              </dl>
              <DemoBadge className="mt-4 text-destructive" />
              <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
                <Press disabled={busy} onClick={() => setStep("enter")} className="h-12 rounded-full bg-secondary text-sm font-semibold">Cancel</Press>
                <Press disabled={busy} onClick={confirm} className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-70">
                  {busy ? <><Loader2 className="size-4 animate-spin" /> Processing demo…</> : mode === "send" ? "Confirm demo payment" : "Send demo request"}
                </Press>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* success */}
      <AnimatePresence>
        {step === "success" && tx && (
          <motion.button
            type="button"
            onClick={onClose}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-success px-8 text-center text-success-foreground"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <svg viewBox="0 0 52 52" className="size-20" aria-hidden>
              <motion.path d="M14 27 L23 36 L39 17" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }} />
            </svg>
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <SuccessAmount value={-tx.amount} cur={cur} />
              <p className="mt-1 text-sm font-semibold opacity-90">Demo payment successful</p>
              <p className="text-sm opacity-90">Sent to {tx.name}</p>
              <p className="tabular mt-3 text-[11px] opacity-80">Ref {tx.ref}</p>
              <DemoBadge className="mt-5" />
            </motion.div>
            <p className="absolute bottom-10 text-[11px] opacity-70">Tap anywhere to close</p>
          </motion.button>
        )}
        {step === "requested" && tx && (
          <motion.div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-phone px-8 text-center text-phone-foreground" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Avatar r={recipient} size={64} />
            <p className="tabular mt-4 text-4xl font-extrabold">{fmt(tx.amount, cur)}</p>
            <p className="mt-1 text-sm text-phone-muted">Demo request sent to {tx.name}</p>
            <span className="mt-3 rounded-full bg-pending/20 px-3 py-1 text-xs font-bold uppercase text-pending">Pending</span>
            <p className="tabular mt-3 text-[11px] text-phone-muted">Ref {tx.ref}</p>
            <DemoBadge className="mt-5 text-phone-muted" />
            <div className="mt-6 flex gap-2">
              <Press onClick={() => { pz.cancel(tx.id); onClose(); }} className="h-11 rounded-full bg-surface px-5 text-sm font-semibold">Cancel request</Press>
              <Press onClick={onClose} className="h-11 rounded-full bg-phone-foreground px-5 text-sm font-semibold text-phone">Done</Press>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SuccessAmount({ value, cur }: { value: number; cur: PayZen["state"]["currency"] }) {
  const [v, setV] = useState(0);
  useState(() => setTimeout(() => setV(value), 450));
  return <AnimatedMoney value={v} currency={cur} className="block text-5xl font-extrabold" />;
}
