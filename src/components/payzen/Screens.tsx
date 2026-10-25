import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Bell, Copy, Eye, EyeOff, ListFilter, Lock, Plus, RotateCcw, Search, Settings2, Snowflake, Unlock, UserPlus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmt, type Currency, type Recipient, type Tx } from "@/lib/payzen";
import type { PayZen } from "@/lib/use-payzen";
import type { FirebaseAccount } from "@/lib/use-firebase-account";
import { AnimatedMoney, Avatar, Press, TxRow } from "./ui";

export const ME: Recipient = { id: "me", name: "Naitik", handle: "you@payzen", hue: 60 };

const CARDS = [
  { id: "c1", label: "Digital card", last4: "7642", bg: "bg-zen-yellow", glow: "shadow-glow-yellow" },
  { id: "c2", label: "Travel card", last4: "5123", bg: "bg-zen-teal", glow: "shadow-glow-teal" },
  { id: "c3", label: "Online card", last4: "3413", bg: "bg-zen-blue", glow: "shadow-glow-blue" },
];

type Filter = "all" | "sent" | "received" | "request";

export function Home({ pz, onSend, onRequest, onTx, onCards, onProfile }: { pz: PayZen; onSend: () => void; onRequest: () => void; onTx: (t: Tx) => void; onCards: () => void; onProfile: () => void }) {
  const { state } = pz;
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const scroller = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scroller });
  const cardX = useTransform(scrollY, [0, 200], [0, 40]);

  const spent = state.txs.filter((t) => t.kind === "sent" && t.status === "completed").reduce((a, t) => a - t.amount, 0);
  const list = state.txs.filter((t) => (filter === "all" || t.kind === filter) && t.name.toLowerCase().includes(q.toLowerCase()));
  const filters: Filter[] = ["all", "sent", "received", "request"];

  return (
    <div ref={scroller} className="no-scrollbar h-full overflow-y-auto pb-28">
      <div className="relative px-5 pt-4">
        <div className="flex items-center justify-between">
          <Press onClick={onProfile} aria-label="Profile"><Avatar r={ME} size={36} /></Press>
          <Press onClick={() => toast("No new demo notifications")} aria-label="Notifications" className="grid size-9 place-items-center rounded-full bg-surface">
            <Bell className="size-4" />
          </Press>
        </div>
        <motion.button type="button" onClick={onCards} style={{ x: cardX }} aria-label="Open cards" className="absolute -right-6 top-20 h-36 w-24">
          {CARDS.map((c, i) => (
            <motion.div key={c.id} className={cn("absolute inset-y-0 w-20 rounded-2xl", c.bg)} style={{ left: i * 10, zIndex: 3 - i }} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 200, damping: 20 }} whileHover={{ x: -6 }} />
          ))}
        </motion.button>
        <p className="mt-10 text-xs text-phone-muted">Total demo balance</p>
        <AnimatedMoney value={state.balance} currency={state.currency} split className="block text-[2.4rem] font-extrabold leading-tight tracking-tight" />
        <div className="mt-3 flex gap-2">
          <Press onClick={onSend} className="flex items-center gap-1.5 rounded-full bg-phone-foreground py-1.5 pl-1.5 pr-4 text-sm font-semibold text-phone">
            <span className="grid size-6 place-items-center rounded-full bg-phone text-phone-foreground"><ArrowUpRight className="size-3.5" /></span>Send
          </Press>
          <Press onClick={onRequest} className="flex items-center gap-1.5 rounded-full bg-surface px-4 py-1.5 text-sm font-semibold">
            <ArrowDownLeft className="size-3.5" />Request
          </Press>
        </div>
        <Press onClick={() => setFilter("sent")} className="mt-6 flex w-[85%] items-center justify-between rounded-2xl bg-surface px-4 py-3 text-left">
          <div>
            <p className="text-[11px] text-phone-muted">Spending</p>
            <p className="tabular font-bold">{fmt(spent, state.currency)}</p>
          </div>
          <div className="flex -space-x-2">
            {state.txs.slice(0, 3).map((t) => (
              <div key={t.id} className="rounded-full ring-2 ring-surface"><MiniIcon t={t} rs={state.recipients} /></div>
            ))}
          </div>
        </Press>
      </div>

      <motion.section initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.1 }} className="mx-2 mt-6 min-h-[420px] rounded-[1.75rem] bg-sheet px-4 pb-6 pt-3 text-foreground">
        <div className="mx-auto h-1 w-8 rounded-full bg-border" />
        <div className="mt-2 flex items-center justify-between">
          <Press aria-label="Filter" onClick={() => setFilter(filters[(filters.indexOf(filter) + 1) % filters.length] ?? "all")} className="grid size-8 place-items-center rounded-full bg-secondary"><ListFilter className="size-4" /></Press>
          <h2 className="text-sm font-semibold">Transactions</h2>
          <Press aria-label="Search" onClick={() => { setSearching((s) => !s); setQ(""); }} className="grid size-8 place-items-center rounded-full bg-secondary">{searching ? <X className="size-4" /> : <Search className="size-4" />}</Press>
        </div>
        <AnimatePresence>
          {searching && (
            <motion.input initial={{ height: 0, opacity: 0 }} animate={{ height: 40, opacity: 1 }} exit={{ height: 0, opacity: 0 }} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions" className="mt-3 w-full rounded-xl bg-secondary px-3 text-sm outline-none" />
          )}
        </AnimatePresence>
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={cn("relative rounded-full px-3 py-1 text-[11px] font-semibold capitalize", filter === f ? "text-primary-foreground" : "text-muted-foreground")}>
              {filter === f && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-primary" />}
              <span className="relative">{f === "request" ? "Requests" : f}</span>
            </button>
          ))}
        </div>
        <div className="mt-2">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No demo transactions found</p>
          ) : (
            list.map((t, i) => <TxRow key={t.id} i={i} tx={t} recipients={state.recipients} currency={state.currency} onClick={() => onTx(t)} />)
          )}
        </div>
      </motion.section>
    </div>
  );
}

function MiniIcon({ t, rs }: { t: Tx; rs: Recipient[] }) {
  const r = rs.find((x) => x.id === t.icon);
  if (r) return <Avatar r={r} size={26} />;
  return <div className="grid size-[26px] place-items-center rounded-full bg-phone-foreground text-[10px] font-bold text-phone">{t.name[0]}</div>;
}

export function Cards() {
  const [frozen, setFrozen] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-5 pb-28 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Press onClick={() => toast("Demo card order placed — no real card will be issued")} className="rounded-full bg-phone-foreground px-3 py-1.5 text-xs font-semibold text-phone">Order a card</Press>
      </div>
      <div className="mt-5 space-y-4">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 24 }}
            whileTap={{ scale: 0.97, rotateX: 6 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            className={cn("relative h-44 rounded-3xl p-4 text-primary", c.bg, c.glow, frozen[c.id] && "grayscale")}
          >
            <div className="flex justify-between text-xs font-semibold">
              <span>{c.label}</span>
              <span className="tabular">{shown[c.id] ? `4000 •••• •••• ${c.last4}` : `•••• ${c.last4}`}</span>
            </div>
            <p className="mt-3 text-[10px] font-semibold opacity-60">DEMO · NOT A REAL CARD</p>
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-2">
              {[
                { I: frozen[c.id] ? Unlock : Snowflake, l: frozen[c.id] ? "Unfreeze" : "Freeze", f: () => { setFrozen((s) => ({ ...s, [c.id]: !s[c.id] })); toast(`${c.label} ${frozen[c.id] ? "unfrozen" : "frozen"} (demo)`); } },
                { I: shown[c.id] ? EyeOff : Eye, l: "Show number", f: () => setShown((s) => ({ ...s, [c.id]: !s[c.id] })) },
                { I: Copy, l: "Copy", f: () => toast("Demo numbers can't be copied") },
              ].map(({ I, l, f }) => (
                <Press key={l} aria-label={l} onClick={f} className="grid size-8 place-items-center rounded-full bg-primary/15"><I className="size-4" /></Press>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[10px] font-bold">
                {frozen[c.id] ? <Lock className="size-3" /> : null}
                {frozen[c.id] ? "FROZEN" : "ACTIVE"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Recipients({ pz, onPick }: { pz: PayZen; onPick: (r: Recipient) => void }) {
  const { state } = pz;
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const list = useMemo(() => state.recipients.filter((r) => (r.name + r.handle).toLowerCase().includes(q.toLowerCase())), [state.recipients, q]);
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-5 pb-28 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipients</h1>
        <Press onClick={() => setAdding((a) => !a)} className="flex items-center gap-1 rounded-full bg-phone-foreground px-3 py-1.5 text-xs font-semibold text-phone"><Plus className="size-3.5" />Add</Press>
      </div>
      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              const n = name.trim();
              if (n.length < 2) { toast.error("Enter a name with at least 2 letters"); return; }
              pz.addRecipient(n.slice(0, 24));
              setName(""); setAdding(false);
              toast.success(`${n} added as a demo contact`);
            }}
          >
            <div className="mt-4 flex gap-2">
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Fictional contact name" maxLength={24} className="h-11 flex-1 rounded-xl bg-surface px-3 text-sm outline-none placeholder:text-phone-muted" />
              <Press type="submit" className="grid size-11 place-items-center rounded-xl bg-phone-foreground text-phone" aria-label="Save contact"><UserPlus className="size-4" /></Press>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3">
        <Search className="size-4 text-phone-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipients" className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-phone-muted" />
      </div>
      {list.length === 0 && <p className="py-12 text-center text-sm text-phone-muted">No recipients match “{q}”</p>}
      <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5">
        {list.map((r, i) => (
          <motion.button
            type="button"
            key={r.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setSelected(r.id); setTimeout(() => onPick(r), 220); }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={cn("rounded-full p-0.5 ring-2 transition-all", selected === r.id ? "ring-zen-teal" : "ring-transparent")}>
              <Avatar r={r} size={60} />
            </div>
            <span className="text-xs font-semibold">{r.name}</span>
            <span className="w-full truncate text-[10px] text-phone-muted">{r.handle}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function Profile({ pz, onTx, account, onAccount }: { pz: PayZen; onTx: (t: Tx) => void; account: FirebaseAccount; onAccount: () => void }) {
  const { state } = pz;
  const reqs = state.txs.filter((t) => t.kind === "request");
  const currencies: Currency[] = ["INR", "USD", "EUR"];
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-5 pb-28 pt-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface p-4">
        <Avatar r={ME} size={52} />
        <div>
          <p className="break-words font-semibold">{account.profile?.displayName || account.user?.displayName || ME.name}</p>
          <p className="text-xs text-phone-muted">{account.user ? "Firebase account · simulated wallet" : "Local payment sandbox"}</p>
        </div>
      </div>
      <Press onClick={onAccount} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-phone-foreground py-3 text-sm font-semibold text-phone">
        <UserPlus className="size-4" />{account.loading ? "Connecting account…" : account.user ? "Manage account" : "Sign in / Create account"}
      </Press>
      {!account.configured && <p className="mt-2 text-center text-xs text-phone-muted">Firebase connection pending</p>}
      <p className="mb-2 mt-6 flex items-center gap-1.5 text-xs font-semibold text-phone-muted"><Settings2 className="size-3.5" />Display currency</p>
      <div className="flex gap-1 rounded-full bg-surface p-1">
        {currencies.map((c) => (
          <button key={c} type="button" onClick={() => pz.setCurrency(c)} className={cn("relative flex-1 rounded-full py-2 text-xs font-semibold", state.currency === c ? "text-phone" : "text-phone-muted")}>
            {state.currency === c && <motion.span layoutId="cur-pill" className="absolute inset-0 rounded-full bg-phone-foreground" />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <p className="mb-2 mt-6 text-xs font-semibold text-phone-muted">Payment requests</p>
      <div className="rounded-2xl bg-sheet px-3 py-1 text-foreground">
        {reqs.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No demo requests yet</p> : reqs.map((t, i) => <TxRow key={t.id} i={i} tx={t} recipients={state.recipients} currency={state.currency} onClick={() => onTx(t)} />)}
      </div>
      <Press
        onClick={() => { if (confirm("Reset all demo data to the starting state?")) { pz.reset(); toast.success("Demo data reset"); } }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-surface py-3 text-sm font-semibold"
      >
        <RotateCcw className="size-4" />Reset demo data
      </Press>
      <p className="mt-6 text-center text-[11px] leading-relaxed text-phone-muted">Payments and cards are simulated. Wallet data stays in this browser, separate from your Firebase profile. No real money moves.</p>
    </div>
  );
}
