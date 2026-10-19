import { requireAdmin } from "@/lib/auth/require";
import { setApplicationStatus } from "@/lib/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
export default async function Applications() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("card_applications").select("id,status,country,notes,created_at,profiles(full_name,email)").order("created_at", { ascending: false }).limit(200);
  type Row = { id: string; status: "submitted" | "under_review" | "approved" | "rejected" | "issued"; country: string | null; notes: string | null; created_at: string; profiles: { full_name: string; email: string } | null };
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <section className="panel"><h3>Card applications</h3><p className="faint">Review and approve interest registrations. "Issued" is set only by the issuer integration, never by hand.</p></section>
      <div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Country</th><th>Submitted</th><th>Status</th></tr></thead><tbody>
        {rows.map(a => <tr key={a.id}><td><div>{a.profiles?.full_name || "—"}</div><div className="faint">{a.profiles?.email}</div></td><td>{a.country ?? "—"}</td><td>{new Date(a.created_at).toLocaleDateString()}</td><td><StatusSelect value={a.status} options={["submitted", "under_review", "approved", "rejected"]} onChange={setApplicationStatus.bind(null, a.id)} /></td></tr>)}
        {!rows.length && <tr><td colSpan={4} className="faint">No applications yet.</td></tr>}
      </tbody></table></div>
    </>
  );
}
