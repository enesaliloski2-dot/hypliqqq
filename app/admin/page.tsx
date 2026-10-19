import { requireAdmin } from "@/lib/auth/require";
export default async function AdminOverview() {
  const { supabase } = await requireAdmin();
  const count = (t: string) => supabase.from(t).select("*", { count: "exact", head: true });
  const [users, pending, wallets, tickets, founding, logs] = await Promise.all([
    count("profiles"), supabase.from("card_applications").select("*", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
    supabase.from("wallet_connections").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    count("founding_registrations"),
    supabase.from("audit_logs").select("action,resource_type,created_at,outcome").order("created_at", { ascending: false }).limit(8),
  ]);
  const stats: [string, number | null][] = [["Registered users", users.count], ["Pending applications", pending.count], ["Connected wallets", wallets.count], ["Open support requests", tickets.count], ["Founding interest registrations", founding.count]];
  return (
    <>
      <div className="grid grid-4">{stats.map(([l, v]) => <div key={l} className="panel stat"><div className="l">{l}</div><div className="v num">{v ?? 0}</div></div>)}</div>
      <section className="panel"><h3>Recent administrative activity</h3>
        {logs.data?.length ? <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6, fontSize: 13.5 }}>{logs.data.map((l, i) => <li key={i} style={{ display: "flex", justifyContent: "space-between" }}><span className="mono">{l.action} <span className="muted">· {l.resource_type}</span></span><span className="faint">{new Date(l.created_at).toLocaleString()} · {l.outcome}</span></li>)}</ul> : <p className="faint">No administrative actions recorded yet.</p>}
      </section>
      <p className="faint">All figures are live counts from the database. Card issuance and reward payouts are never set from this panel; they require the issuer and a backend crediting service.</p>
    </>
  );
}
