import { useCallback, useEffect, useState } from "react";
import { isValidPin, lockoutAfter } from "./payzen";

const KEY = "payzen-lock-v1";
type Stored = { hash: string; lockOnResume: boolean };

async function hashPin(pin: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`payzen:${pin}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useAppLock() {
  const [stored, setStored] = useState<Stored | null>(null);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(true);
  const [fails, setFails] = useState(0);
  const [until, setUntil] = useState(0);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setStored(JSON.parse(raw)); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "hidden" && stored?.lockOnResume) setLocked(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [stored]);

  const save = (s: Stored | null) => { setStored(s); if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); };

  const setPin = useCallback(async (pin: string) => {
    if (!isValidPin(pin)) return false;
    save({ hash: await hashPin(pin), lockOnResume: stored?.lockOnResume ?? true });
    setLocked(false);
    return true;
  }, [stored]);

  /** Returns "ok" | "wrong" | "locked" */
  const verify = useCallback(async (pin: string) => {
    if (Date.now() < until) return "locked" as const;
    if (stored && (await hashPin(pin)) === stored.hash) { setFails(0); setLocked(false); return "ok" as const; }
    const n = fails + 1;
    const end = lockoutAfter(n, Date.now());
    if (end) { setUntil(end); setFails(0); return "locked" as const; }
    setFails(n);
    return "wrong" as const;
  }, [stored, fails, until]);

  const setLockOnResume = (v: boolean) => stored && save({ ...stored, lockOnResume: v });
  const removePin = () => { save(null); setLocked(false); };

  return { ready, hasPin: Boolean(stored), locked: Boolean(stored) && locked, lockOnResume: stored?.lockOnResume ?? false, until, fails, setPin, verify, lock: () => setLocked(true), setLockOnResume, removePin };
}
export type AppLock = ReturnType<typeof useAppLock>;
