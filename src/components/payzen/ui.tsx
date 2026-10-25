import { animate, motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from "framer-motion";
import { Briefcase, Car, ChevronsRight, Coffee, ShoppingBag, Tv } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fmt, type Currency, type Recipient, type Tx } from "@/lib/payzen";

export function Press({ className, ...p }: HTMLMotionProps<"button">) {
  return <motion.button type="button" whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...p} />;
}

export function Avatar({ r, size = 44, className }: { r: Recipient; size?: number; className?: string }) {
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-full font-bold text-primary-foreground", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(140deg, oklch(0.72 0.14 ${r.hue}), oklch(0.5 0.14 ${r.hue + 40}))` }}
      aria-hidden
    >
      {r.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

const MERCHANT: Record<string, typeof Coffee> = { coffee: Coffee, tv: Tv, briefcase: Briefcase, car: Car, shopping: ShoppingBag };

export function TxIcon({ tx, recipients }: { tx: Tx; recipients: Recipient[] }) {
  const r = recipients.find((x) => x.id === tx.icon);
  if (r) return <Avatar r={r} size={36} />;
  const I = MERCHANT[tx.icon] ?? ShoppingBag;
  return (
    <div className="relative grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
      <I className="size-4" />
      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sheet bg-zen-teal" />
    </div>
  );
}

export function TxRow({ tx, recipients, currency, onClick, i = 0 }: { tx: Tx; recipients: Recipient[]; currency: Currency; onClick: () => void; i?: number }) {
  const d = new Date(tx.date);
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left"
    >
      <TxIcon tx={tx} recipients={recipients} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{tx.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {tx.kind === "request" && " · Request"}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("tabular text-sm font-semibold", tx.kind === "received" && "text-positive", tx.status === "cancelled" && "text-muted-foreground line-through")}>
          {tx.kind === "request" ? fmt(tx.amount, currency) : fmt(tx.amount, currency, { sign: true })}
        </p>
        {tx.status !== "completed" && (
          <p className={cn("text-[10px] font-semibold uppercase", tx.status === "pending" ? "text-pending" : "text-muted-foreground")}>{tx.status}</p>
        )}
      </div>
    </motion.button>
  );
}

/** Spring-animated money value. */
export function AnimatedMoney({ value, currency, className, split }: { value: number; currency: Currency; className?: string; split?: boolean }) {
  const mv = useSpring(value, { stiffness: 90, damping: 20 });
  useEffect(() => mv.set(value), [value, mv]);
  const [txt, setTxt] = useState(fmt(value, currency));
  useEffect(() => mv.on("change", (v) => setTxt(fmt(v, currency))), [mv, currency]);
  useEffect(() => setTxt(fmt(mv.get(), currency)), [currency, mv]);
  if (!split) return <span className={cn("tabular", className)}>{txt}</span>;
  const [a, b] = txt.split(".");
  return (
    <span className={cn("tabular", className)}>
      {a}
      <span className="text-[0.55em] font-semibold opacity-60">.{b}</span>
    </span>
  );
}

export function SwipeConfirm({ label, onConfirm, disabled, tone = "dark" }: { label: string; onConfirm: () => void; disabled?: boolean; tone?: "dark" | "light" }) {
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(240);
  const progress = useTransform(x, [0, max], [0, 1]);
  const fill = useTransform(progress, (p) => `${p * 100}%`);
  const textOpacity = useTransform(progress, [0, 0.6], [1, 0]);
  useEffect(() => {
    if (track.current) setMax(track.current.offsetWidth - 56);
  }, []);
  useEffect(() => {
    if (disabled) animate(x, 0);
  }, [disabled, x]);
  return (
    <div
      ref={track}
      className={cn("relative h-14 w-full overflow-hidden rounded-full", tone === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground", disabled && "opacity-40")}
    >
      <motion.div style={{ width: fill }} className="absolute inset-y-0 left-0 bg-success/40" />
      <motion.span style={{ opacity: textOpacity }} className="absolute inset-0 grid place-items-center pl-8 text-sm font-semibold">
        {label}
      </motion.span>
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.02}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => {
          if (x.get() > max * 0.85) {
            animate(x, max, { duration: 0.15 });
            onConfirm();
          } else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
        }}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === "ArrowRight")) onConfirm();
        }}
        className="absolute left-1 top-1 grid size-12 cursor-grab touch-none place-items-center rounded-full bg-sheet text-foreground shadow-lg active:cursor-grabbing"
      >
        <ChevronsRight className="size-5" />
      </motion.div>
    </div>
  );
}

export function Sheet({ children, onClose, className }: { children: ReactNode; onClose: () => void; className?: string }) {
  return (
    <motion.div className="absolute inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-phone/60" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, i) => {
          if (i.offset.y > 120) onClose();
        }}
        className={cn("absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-sheet p-5 pb-8 text-foreground shadow-sheet", className)}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {children}
      </motion.div>
    </motion.div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <p className={cn("rounded-full border border-current px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", className)}>
      Simulation only — no real money transferred
    </p>
  );
}
