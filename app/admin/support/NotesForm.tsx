"use client";
import { useState, useTransition } from "react";
import { updateTicket } from "@/lib/admin/actions";
import { useToast } from "@/components/ui/Toast";
export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [v, setV] = useState(notes); const [pending, start] = useTransition(); const toast = useToast();
  return (
    <div style={{ display: "grid", gap: 6 }}><label className="faint" htmlFor={`n-${id}`}>Internal notes (never shown to the customer)</label>
      <textarea id={`n-${id}`} className="input" style={{ minHeight: 70 }} value={v} onChange={e => setV(e.target.value)} />
      <div><button className="btn btn-secondary btn-sm" disabled={pending} onClick={() => start(async () => { const r = await updateTicket(id, { internal_notes: v }); toast(r?.error ?? "Notes saved", r?.error ? "err" : "ok"); })}>Save notes</button></div>
    </div>
  );
}
