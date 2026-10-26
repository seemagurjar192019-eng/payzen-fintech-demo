import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Eye, Gauge, HelpCircle, KeyRound, Lock, RotateCcw, Shield, FileText } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEFAULT_DAILY_LIMIT, fmt, sentToday, toCsv } from "@/lib/payzen";
import type { PayZen } from "@/lib/use-payzen";
import type { AppLock } from "@/lib/use-app-lock";

const FAQ = [
  ["Is my money real?", "No. PayZen is in test mode — balances and payments are simulated until bank partners are connected."],
  ["Forgot my PIN?", "Use Settings → Security → Remove PIN, or reset app data. Real accounts will verify identity first."],
  ["Where is my data stored?", "Wallet data stays in this browser. Your profile is saved to your account once sign-in is connected."],
];

function Row({ icon, label, value, onClick, children }: { icon: ReactNode; label: string; value?: string; onClick?: () => void; children?: ReactNode }) {
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined} className={cn("flex items-center gap-3 px-4 py-3.5", onClick && "cursor-pointer active:bg-secondary")}>
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {children ?? (onClick && <ChevronRight className="size-4 text-muted-foreground" />)}
    </div>
  );
}
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={(e) => { e.stopPropagation(); onChange(!on); }} className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-positive" : "bg-secondary")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-background shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-5">
    <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-phone-muted">{title}</p>
    <div className="divide-y divide-border overflow-hidden rounded-2xl bg-sheet text-foreground">{children}</div>
  </section>
);

export function SettingsPanel({ pz, lock, onClose, onSetPin }: { pz: PayZen; lock: AppLock; onClose: () => void; onSetPin: () => void }) {
  const { state } = pz;
  const [page, setPage] = useState<"main" | "help" | "terms">("main");
  const limit = state.dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const used = sentToday(state.txs);

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(state.txs)], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "payzen-transactions.csv"; a.click();
    URL.revokeObjectURL(url); toast.success("Statement downloaded");
  };
  const editLimit = () => {
    const v = prompt("Daily send limit (₹)", String(limit));
    if (v === null) { return; }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 100 || n > 100_000) { toast.error("Choose between ₹100 and ₹1,00,000"); return; }
    pz.setDailyLimit(n); toast.success("Daily limit updated");
  };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-0 z-40 overflow-y-auto bg-phone px-5 pb-10 pt-4 text-phone-foreground no-scrollbar">
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Back" onClick={() => (page === "main" ? onClose() : setPage("main"))} className="grid size-9 place-items-center rounded-full bg-surface"><ChevronLeft className="size-5" /></button>
        <h1 className="text-xl font-bold">{page === "main" ? "Settings" : page === "help" ? "Help & FAQ" : "Terms & privacy"}</h1>
      </div>

      {page === "help" && (
        <div className="mt-5 space-y-3">
          {FAQ.map(([q, a]) => <details key={q} className="rounded-2xl bg-sheet p-4 text-foreground"><summary className="cursor-pointer text-sm font-semibold">{q}</summary><p className="mt-2 text-xs text-muted-foreground">{a}</p></details>)}
          <a href="mailto:support@payzen.app?subject=PayZen%20help" className="block rounded-full bg-phone-foreground py-3 text-center text-sm font-semibold text-phone">Email support</a>
        </div>
      )}
      {page === "terms" && (
        <div className="mt-5 space-y-3 rounded-2xl bg-sheet p-4 text-xs leading-relaxed text-foreground">
          <p><b>Test mode.</b> PayZen does not move real money. All balances, cards and payments are simulated.</p>
          <p><b>Your data.</b> Wallet activity stays on this device. Your PIN is stored only as a one-way hash.</p>
          <p><b>Before launch.</b> Final terms and privacy policy will be published with the licensed payment partner.</p>
        </div>
      )}

      {page === "main" && <>
        <Group title="Security">
          <Row icon={<KeyRound className="size-4" />} label={lock.hasPin ? "Change PIN" : "Set up PIN"} onClick={onSetPin} />
          {lock.hasPin && <Row icon={<Lock className="size-4" />} label="Lock when leaving app"><Toggle label="Lock when leaving app" on={lock.lockOnResume} onChange={lock.setLockOnResume} /></Row>}
          {lock.hasPin && <Row icon={<Shield className="size-4" />} label="Lock now" onClick={() => { lock.lock(); onClose(); }} />}
          {lock.hasPin && <Row icon={<RotateCcw className="size-4" />} label="Remove PIN" onClick={() => { if (confirm("Remove PIN? Payments won't ask for it.")) { lock.removePin(); toast("PIN removed"); } }} />}
        </Group>
        <Group title="Payments">
          <Row icon={<Gauge className="size-4" />} label="Daily send limit" value={fmt(limit, state.currency)} onClick={editLimit} />
          <div className="px-4 pb-3.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-positive" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} /></div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{fmt(used, state.currency)} sent today</p>
          </div>
        </Group>
        <Group title="Privacy & data">
          <Row icon={<Eye className="size-4" />} label="Hide balance on home"><Toggle label="Hide balance" on={Boolean(state.hideBalance)} onChange={pz.setHideBalance} /></Row>
          <Row icon={<Download className="size-4" />} label="Download statement (CSV)" onClick={exportCsv} />
          <Row icon={<RotateCcw className="size-4" />} label="Reset wallet data" onClick={() => { if (confirm("Reset all wallet data?")) { pz.reset(); toast.success("Wallet reset"); } }} />
        </Group>
        <Group title="Support">
          <Row icon={<HelpCircle className="size-4" />} label="Help & FAQ" onClick={() => setPage("help")} />
          <Row icon={<FileText className="size-4" />} label="Terms & privacy" onClick={() => setPage("terms")} />
        </Group>
        <p className="mt-6 text-center text-[11px] text-phone-muted">PayZen 1.0 · Test mode — no real money moves</p>
      </>}
    </motion.div>
  );
}
