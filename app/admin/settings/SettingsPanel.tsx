"use client";
import { useState, useTransition } from "react";
import { setSetting } from "@/lib/admin/actions";
import { useToast } from "@/components/ui/Toast";
export function SettingsPanel({ waitlistOpen, founding, cardLabel }: { waitlistOpen: boolean; founding: string; cardLabel: string }) {
  const [w, setW] = useState(waitlistOpen); const [f, setF] = useState(founding); const [c, setC] = useState(cardLabel);
  const [pending, start] = useTransition(); const toast = useToast();
  const save = () => start(async () => { const rs = await Promise.all([setSetting("waitlist_open", w), setSetting("founding_promotion_status", f), setSetting("card_availability_label", c)]); const e = rs.find(r => r?.error); toast(e?.error ?? "Settings saved", e ? "err" : "ok"); });
  return (
    <section className="panel" style={{ maxWidth: 640, display: "grid", gap: 14 }}>
      <h3 style={{ margin: 0 }}>Platform settings</h3>
      <label className="check" style={{ alignItems: "center" }}><input type="checkbox" checked={w} onChange={e => setW(e.target.checked)} /> Waitlist open</label>
      <div className="field"><label>Founding promotion status (public label)</label><select className="input" value={f} onChange={e => setF(e.target.value)}><option value="planned">planned</option><option value="terms_published">terms published</option><option value="open">open</option><option value="closed">closed</option></select><div className="faint">"open" must only be set once funding and official terms are in place.</div></div>
      <div className="field"><label>Card availability label</label><input className="input" value={c} onChange={e => setC(e.target.value)} /></div>
      <div><button className="btn btn-primary" disabled={pending} onClick={save}>Save settings</button></div>
    </section>
  );
}
