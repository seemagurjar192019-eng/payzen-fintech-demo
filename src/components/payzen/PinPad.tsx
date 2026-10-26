import { motion } from "framer-motion";
import { Delete, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AppLock } from "@/lib/use-app-lock";

/** Full-screen PIN entry. mode "setup" asks twice; "verify" checks the saved PIN. */
export function PinPad({ lock, mode, title, onDone, onCancel }: { lock: AppLock; mode: "setup" | "verify"; title?: string; onDone: () => void; onCancel?: () => void }) {
  const [pin, setPin] = useState("");
  const [first, setFirst] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [shake, setShake] = useState(0);

  const fail = (m: string) => { setMsg(m); setPin(""); setShake((s) => s + 1); };
  const submit = async (p: string) => {
    if (mode === "setup") {
      if (!first) { setFirst(p); setPin(""); setMsg(""); return; }
      if (p !== first) { setFirst(null); return fail("PINs didn't match. Try again."); }
      await lock.setPin(p); onDone(); return;
    }
    const r = await lock.verify(p);
    if (r === "ok") onDone();
    else if (r === "locked") fail("Too many tries. Wait 30 seconds.");
    else fail(`Wrong PIN. ${5 - lock.fails - 1} tries left.`);
  };
  const tap = (k: string) => {
    if (k === "del") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) setTimeout(() => void submit(next), 120);
  };
  const heading = title ?? (mode === "setup" ? (first ? "Confirm your PIN" : "Create a 4-digit PIN") : "Enter your PIN");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex flex-col items-center bg-phone px-8 pb-10 pt-20 text-phone-foreground">
      <ShieldCheck className="size-10 text-positive" />
      <h2 className="mt-4 text-xl font-bold">{heading}</h2>
      <p className="mt-1 h-5 text-center text-xs text-phone-muted">{msg || (mode === "setup" ? "Protects payments and opening the app" : "PayZen is locked")}</p>
      <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} className="mt-8 flex gap-4">
        {[0, 1, 2, 3].map((i) => <span key={i} className={cn("size-4 rounded-full border-2 border-phone-foreground", pin.length > i && "bg-phone-foreground")} />)}
      </motion.div>
      <div className="mt-auto grid w-full grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) => k === "" ? (
          onCancel ? <button key={i} type="button" onClick={onCancel} className="h-16 text-sm font-semibold text-phone-muted">Cancel</button> : <span key={i} />
        ) : (
          <button key={i} type="button" aria-label={k === "del" ? "Delete" : k} onClick={() => tap(k)} className="grid h-16 place-items-center rounded-full bg-surface text-2xl font-semibold active:scale-95">
            {k === "del" ? <Delete className="size-6" /> : k}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
