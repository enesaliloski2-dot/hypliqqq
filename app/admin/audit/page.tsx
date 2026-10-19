import { requireAdmin } from "@/lib/auth/require";
export default async function Audit() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("audit_logs").select("id,action,resource_type,resource_id,outcome,details,created_at,profiles(email)").order("created_at", { ascending: false }).limit(300);
  type Row = { id: string; action: string; resource_type: string; resource_id: string | null; outcome: string; details: unknown; created_at: string; profiles: { email: string } | null };
  const rows = (data ?? []) as unknown as Row[];
  return (
    <div className="table-wrap"><table><thead><tr><th>When</th><th>Administrator</th><th>Action</th><th>Resource</th><th>Outcome</th><th>Details</th></tr></thead><tbody>
      {rows.map(l => <tr key={l.id}><td>{new Date(l.created_at).toLocaleString()}</td><td>{l.profiles?.email ?? "—"}</td><td className="mono">{l.action}</td><td><span className="faint">{l.resource_type}</span> <span className="mono">{l.resource_id?.slice(0, 8)}</span></td><td><span className={`pill ${l.outcome === "ok" ? "ok" : "bad"}`}>{l.outcome}</span></td><td className="mono faint" style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{JSON.stringify(l.details)}</td></tr>)}
      {!rows.length && <tr><td colSpan={6} className="faint">No entries yet.</td></tr>}
    </tbody></table></div>
  );
}
