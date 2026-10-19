"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
export function StatusSelect<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => Promise<{ error?: string; ok?: boolean }> }) {
  const [pending, start] = useTransition(); const toast = useToast(); const router = useRouter();
  return (
    <select className="input" style={{ height: 34, fontSize: 13, width: "auto" }} value={value} disabled={pending} onChange={e => { const v = e.target.value as T; start(async () => { const r = await onChange(v); if (r?.error) toast(r.error, "err"); else { toast("Saved", "ok"); router.refresh(); } }); }}>
      {options.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  );
}
