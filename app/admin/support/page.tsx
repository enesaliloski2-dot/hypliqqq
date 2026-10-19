import { requireAdmin } from "@/lib/auth/require";
import { setTicketStatus, setTicketPriority } from "@/lib/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { NotesForm } from "./NotesForm";
export default async function AdminSupport() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("support_tickets").select("id,subject,body,status,priority,internal_notes,created_at,profiles(full_name,email)").order("created_at", { ascending: false }).limit(200);
  type Row = { id: string; subject: string; body: string; status: "open" | "in_progress" | "resolved" | "closed"; priority: "low" | "normal" | "high"; internal_notes: string | null; created_at: string; profiles: { full_name: string; email: string } | null };
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <section className="panel"><h3>Support requests</h3></section>
      <div className="grid">{rows.map(t => (
        <section key={t.id} className="panel" style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div><div style={{ fontWeight: 500 }}>{t.subject}</div><div className="faint">{t.profiles?.full_name} · {t.profiles?.email} · {new Date(t.created_at).toLocaleString()}</div></div>
            <div style={{ display: "flex", gap: 8 }}><StatusSelect value={t.priority} options={["low", "normal", "high"]} onChange={setTicketPriority.bind(null, t.id)} /><StatusSelect value={t.status} options={["open", "in_progress", "resolved", "closed"]} onChange={setTicketStatus.bind(null, t.id)} /></div></div>
          <p style={{ fontSize: 14, whiteSpace: "pre-wrap" }} className="muted">{t.body}</p>
          <NotesForm id={t.id} notes={t.internal_notes ?? ""} />
        </section>))}
        {!rows.length && <p className="faint">No support requests.</p>}</div>
    </>
  );
}
