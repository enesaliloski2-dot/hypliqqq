"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type T = { id: number; kind: "ok" | "err" | "info"; text: string };
const Ctx = createContext<(text: string, kind?: T["kind"]) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const push = useCallback((text: string, kind: T["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setItems(i => [...i, { id, kind, text }]);
    setTimeout(() => setItems(i => i.filter(t => t.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map(t => <div key={t.id} className={`toast ${t.kind}`}>{t.kind === "ok" ? <CheckCircle2 size={16} color="var(--ok)" /> : t.kind === "err" ? <AlertCircle size={16} color="var(--danger)" /> : <Info size={16} color="var(--blue)" />}{t.text}</div>)}
      </div>
    </Ctx.Provider>
  );
}
