"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePromotion } from "@/lib/admin/actions";
import { useToast } from "@/components/ui/Toast";
export type Promotion = { id: string; slug: string; name: string; status: "planned" | "terms_published" | "open" | "paused" | "closed"; reward_amount: number | null; reward_currency: string; approved_budget: number | null; max_qualifying_users: number | null; starts_at: string | null; ends_at: string | null; eligibility_rules: string | null; geographic_restrictions: string | null; required_disclosures: string | null; terms_url: string | null; updated_at: string };
const d = (v: string | null) => v ? v.slice(0, 10) : "";
export function PromotionForm({ promo }: { promo: Promotion }) {
  const [p, setP] = useState(promo); const [pending, start] = useTransition(); const toast = useToast(); const router = useRouter();
  const set = (k: keyof Promotion, v: string) => setP(x => ({ ...x, [k]: v }));
  const num = (v: string) => v === "" ? null : Number(v);
  const save = () => start(async () => {
    const r = await updatePromotion(p.id, { status: p.status, reward_amount: num(String(p.reward_amount ?? "")), approved_budget: num(String(p.approved_budget ?? "")), max_qualifying_users: num(String(p.max_qualifying_users ?? "")), starts_at: p.starts_at || null, ends_at: p.ends_at || null, eligibility_rules: p.eligibility_rules || null, geographic_restrictions: p.geographic_restrictions || null, required_disclosures: p.required_disclosures || null, terms_url: p.terms_url || null });
    toast(r?.error ?? "Promotion saved", r?.error ? "err" : "ok"); if (!r?.error) router.refresh();
  });
  return (
    <section className="panel" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0 }}>{p.name}</h3><span className={`pill ${p.status === "open" ? "ok" : p.status === "planned" ? "" : "blue"}`}>{p.status.replace("_", " ")}</span></div>
      <div className="grid grid-2" style={{ gap: 10 }}>
        <div className="field"><label>Status</label><select className="input" value={p.status} onChange={e => set("status", e.target.value)}>{["planned", "terms_published", "open", "paused", "closed"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
        <div className="field"><label>Verified reward amount ({p.reward_currency})</label><input className="input" type="number" step="0.01" value={p.reward_amount ?? ""} onChange={e => set("reward_amount", e.target.value)} /></div>
        <div className="field"><label>Approved budget ({p.reward_currency})</label><input className="input" type="number" step="0.01" value={p.approved_budget ?? ""} onChange={e => set("approved_budget", e.target.value)} placeholder="Not approved" /></div>
        <div className="field"><label>Max qualifying users</label><input className="input" type="number" value={p.max_qualifying_users ?? ""} onChange={e => set("max_qualifying_users", e.target.value)} /></div>
        <div className="field"><label>Starts</label><input className="input" type="date" value={d(p.starts_at)} onChange={e => set("starts_at", e.target.value)} /></div>
        <div className="field"><label>Ends</label><input className="input" type="date" value={d(p.ends_at)} onChange={e => set("ends_at", e.target.value)} /></div>
      </div>
      <div className="field"><label>Eligibility rules</label><textarea className="input" style={{ minHeight: 70 }} value={p.eligibility_rules ?? ""} onChange={e => set("eligibility_rules", e.target.value)} /></div>
      <div className="field"><label>Geographic restrictions</label><textarea className="input" style={{ minHeight: 54 }} value={p.geographic_restrictions ?? ""} onChange={e => set("geographic_restrictions", e.target.value)} /></div>
      <div className="field"><label>Required disclosures</label><textarea className="input" style={{ minHeight: 54 }} value={p.required_disclosures ?? ""} onChange={e => set("required_disclosures", e.target.value)} /></div>
      <div className="field"><label>Official terms URL</label><input className="input" value={p.terms_url ?? ""} onChange={e => set("terms_url", e.target.value)} placeholder="https://" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="faint">Updated {new Date(p.updated_at).toLocaleString()}</span><button className="btn btn-primary btn-sm" disabled={pending} onClick={save}>Save</button></div>
    </section>
  );
}
