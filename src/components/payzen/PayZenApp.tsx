import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { CreditCard, Home as HomeIcon, User, Users } from "lucide-react";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { fmt, type Recipient, type Tx } from "@/lib/payzen";
import { usePayZen } from "@/lib/use-payzen";
import { AmountFlow } from "./AmountFlow";
import { Cards, Home, Profile, Recipients } from "./Screens";
import { Avatar, DemoBadge, Press, Sheet, TxIcon } from "./ui";

type Tab = "home" | "cards" | "recipients" | "profile";
const TABS: { id: Tab; I: typeof HomeIcon; label: string }[] = [
  { id: "recipients", I: Users, label: "Recipients" },
  { id: "home", I: HomeIcon, label: "Home" },
  { id: "cards", I: CreditCard, label: "Cards" },
  { id: "profile", I: User, label: "Profile" },
];

export function PayZenApp() {
  const pz = usePayZen();
  const { state } = pz;
  const [tab, setTab] = useState<Tab>("home");
  const [dir, setDir] = useState(1);
  const [flow, setFlow] = useState<{ mode: "send" | "request"; r: Recipient } | null>(null);
  const [detail, setDetail] = useState<Tx | null>(null);

  const go = (t: Tab) => {
    setDir(TABS.findIndex((x) => x.id === t) > TABS.findIndex((x) => x.id === tab) ? 1 : -1);
    setTab(t);
  };
  const open = (mode: "send" | "request", r: Recipient = state.recipients[0]) => setFlow({ mode, r });
  const live = detail ? state.txs.find((t) => t.id === detail.id) ?? detail : null;

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-[100dvh] items-center justify-center bg-background md:py-8">
        <div className="relative h-[100dvh] w-full overflow-hidden bg-phone text-phone-foreground md:h-[844px] md:w-[390px] md:rounded-[3rem] md:border-[10px] md:border-primary md:shadow-phone">
          <div className="flex items-center justify-center gap-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-phone-muted">
            <span className="text-phone-foreground">PayZen</span>· demo
          </div>
          <div className="relative h-[calc(100%-1.75rem)]">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={tab}
                custom={dir}
                variants={{ enter: (d: number) => ({ x: d * 60, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d * -60, opacity: 0 }) }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className="absolute inset-0"
              >
                {tab === "home" && <Home pz={pz} onSend={() => open("send")} onRequest={() => open("request")} onTx={setDetail} onCards={() => go("cards")} onProfile={() => go("profile")} />}
                {tab === "cards" && <Cards />}
                {tab === "recipients" && <Recipients pz={pz} onPick={(r) => open("send", r)} />}
                {tab === "profile" && <Profile pz={pz} onTx={setDetail} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <nav className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full bg-primary p-1.5 shadow-phone" aria-label="Main">
            {TABS.map(({ id, I, label }) => (
              <button key={id} type="button" aria-label={label} aria-current={tab === id} onClick={() => go(id)} className={cn("relative grid h-10 w-14 place-items-center rounded-full transition-colors", tab === id ? "text-primary" : "text-phone-muted")}>
                {tab === id && <motion.span layoutId="nav-pill" transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute inset-0 rounded-full bg-phone-foreground" />}
                <I className="relative size-[18px]" />
              </button>
            ))}
          </nav>

          <AnimatePresence>
            {flow && <AmountFlow key="flow" pz={pz} initialMode={flow.mode} initialRecipient={flow.r} onClose={() => { setFlow(null); setTab("home"); }} />}
          </AnimatePresence>

          <AnimatePresence>
            {live && (
              <Sheet key="detail" onClose={() => setDetail(null)}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <TxIcon tx={live} recipients={state.recipients} />
                  <p className="font-semibold">{live.name}</p>
                  <p className="tabular text-3xl font-extrabold">{live.kind === "request" ? fmt(live.amount, state.currency) : fmt(live.amount, state.currency, { sign: true })}</p>
                  <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase", live.status === "pending" ? "bg-pending/15 text-pending" : live.status === "cancelled" ? "bg-secondary text-muted-foreground" : "bg-positive/15 text-positive")}>
                    {live.kind === "request" ? "Request · " : ""}{live.status}
                  </span>
                </div>
                <dl className="mt-5 space-y-2 rounded-2xl bg-secondary p-4 text-xs">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Reference</dt><dd className="tabular font-semibold">{live.ref}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-semibold">{new Date(live.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd className="font-semibold capitalize">{live.kind}</dd></div>
                </dl>
                <DemoBadge className="mt-4 text-muted-foreground" />
                <div className="mt-4 flex gap-2">
                  {live.status === "pending" && (
                    <Press onClick={() => pz.cancel(live.id)} className="h-12 flex-1 rounded-full bg-secondary text-sm font-semibold text-destructive">Cancel request</Press>
                  )}
                  {live.recipientId && live.kind === "sent" && (() => {
                    const r = state.recipients.find((x) => x.id === live.recipientId);
                    return r ? <Press onClick={() => { setDetail(null); open("send", r); }} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-secondary text-sm font-semibold"><Avatar r={r} size={22} />Send again</Press> : null;
                  })()}
                  <Press onClick={() => setDetail(null)} className="h-12 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground">Close</Press>
                </div>
              </Sheet>
            )}
          </AnimatePresence>
          <Toaster position="top-center" />
        </div>
      </main>
    </MotionConfig>
  );
}
