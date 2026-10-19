import { requireAdmin } from "@/lib/auth/require";
export default async function AdminWallets() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("wallet_connections").select("id,chain,provider,address,network,is_active,last_connected_at,profiles(email)").order("last_connected_at", { ascending: false }).limit(200);
  type Row = { id: string; chain: string; provider: string; address: string; network: string; is_active: boolean; last_connected_at: string; profiles: { email: string } | null };
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <section className="panel"><h3>Wallet connections</h3><p className="faint">Public connection metadata for support and operations only. No keys, signatures or spending capability exist anywhere in this system.</p></section>
      <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Provider</th><th>Network</th><th>Address</th><th>Status</th><th>Last connected</th></tr></thead><tbody>
        {rows.map(w => <tr key={w.id}><td>{w.profiles?.email}</td><td>{w.provider}</td><td>{w.network}</td><td className="mono">{w.address.slice(0, 8)}…{w.address.slice(-6)}</td><td><span className={`pill ${w.is_active ? "ok" : ""}`}>{w.is_active ? "connected" : "inactive"}</span></td><td>{new Date(w.last_connected_at).toLocaleString()}</td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="faint">No wallets connected yet.</td></tr>}
      </tbody></table></div>
    </>
  );
}
