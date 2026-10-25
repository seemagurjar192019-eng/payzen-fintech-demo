import { useCallback, useEffect, useState } from "react";
import { makeRef, SEED, type Currency, type PayState, type Recipient, type Tx } from "./payzen";

const KEY = "payzen-demo-v1";

export function usePayZen() {
  const [state, setState] = useState<PayState>(SEED);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...SEED, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  const send = useCallback((r: Recipient, amount: number): Tx | null => {
    let tx: Tx | null = null;
    setState((s) => {
      if (amount <= 0 || amount > s.balance) return s; // never go negative
      tx = { id: crypto.randomUUID(), ref: makeRef(), name: r.name, icon: r.id, recipientId: r.id, amount: -amount, kind: "sent", status: "completed", date: new Date().toISOString() };
      return { ...s, balance: Math.round((s.balance - amount) * 100) / 100, txs: [tx, ...s.txs] };
    });
    return tx;
  }, []);

  const request = useCallback((r: Recipient, amount: number): Tx => {
    const tx: Tx = { id: crypto.randomUUID(), ref: makeRef(), name: r.name, icon: r.id, recipientId: r.id, amount, kind: "request", status: "pending", date: new Date().toISOString() };
    setState((s) => ({ ...s, txs: [tx, ...s.txs] }));
    return tx;
  }, []);

  const cancel = useCallback((id: string) => {
    setState((s) => ({ ...s, txs: s.txs.map((t) => (t.id === id && t.status === "pending" ? { ...t, status: "cancelled" } : t)) }));
  }, []);

  const addRecipient = useCallback((name: string) => {
    const r: Recipient = { id: crypto.randomUUID(), name, handle: `${name.toLowerCase().replace(/\s+/g, ".")}@payzen`, hue: Math.floor(Math.random() * 360) };
    setState((s) => ({ ...s, recipients: [r, ...s.recipients] }));
    return r;
  }, []);

  const setCurrency = useCallback((currency: Currency) => setState((s) => ({ ...s, currency })), []);
  const reset = useCallback(() => setState(SEED), []);

  return { state, send, request, cancel, addRecipient, setCurrency, reset };
}
export type PayZen = ReturnType<typeof usePayZen>;
