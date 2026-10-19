import { requireAdmin } from "@/lib/auth/require";
import { setAccountStatus } from "@/lib/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { Search } from "@/components/admin/Search";
export default async function Users({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await requireAdmin(); const { q } = await searchParams;
  let query = supabase.from("profiles").select("id,full_name,email,role,status,created_at").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.or(`email.ilike.%${q.replace(/[%_,]/g, "")}%,full_name.ilike.%${q.replace(/[%_,]/g, "")}%`);
  const { data } = await query;
  return (
    <>
      <section className="panel"><h3>Customers</h3><Search placeholder="Search by name or email" /></section>
      <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Email</th><th>Registered</th><th>Role</th><th>Status</th></tr></thead><tbody>
        {(data ?? []).map(u => <tr key={u.id}><td><div>{u.full_name || "—"}</div><div className="faint mono">{u.id.slice(0, 8)}</div></td><td>{u.email}</td><td>{new Date(u.created_at).toLocaleDateString()}</td><td><span className={`pill ${u.role === "admin" ? "violet" : ""}`}>{u.role}</span></td><td><StatusSelect value={u.status} options={["active", "restricted", "closed"]} onChange={setAccountStatus.bind(null, u.id)} /></td></tr>)}
        {!data?.length && <tr><td colSpan={5} className="faint">No customers match.</td></tr>}
      </tbody></table></div>
      <p className="faint">Admin roles are granted only in the database (see README). There is no control here to promote a user.</p>
    </>
  );
}
