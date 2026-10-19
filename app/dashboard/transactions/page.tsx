import { ArrowLeftRight } from "lucide-react";
import { requireUser } from "@/lib/auth/require";
import { EmptyState } from "@/components/ui/EmptyState";
import { TxFilters } from "./TxFilters";

const PAGE = 25;
export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string; page?: string }> }) {
  const { supabase, user } = await requireUser();
  const sp = await searchParams; const page = Math.max(1, Number(sp.page ?? 1));
  let q = supabase.from("card_transactions").select("*", { count: "exact" }).eq("user_id", user.id).order("occurred_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  if (sp.q) q = q.ilike("merchant", `%${sp.q.replace(/[%_]/g, "")}%`);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.from) q = q.gte("occurred_at", sp.from); if (sp.to) q = q.lte("occurred_at", sp.to + "T23:59:59Z");
  const { data, count } = await q;
  const rows = data ?? []; const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  return (
    <>
      <section className="panel"><h3>Card transactions</h3><p className="faint">Only purchases reported by the card issuer appear here. Wallet transfers are visible in your wallet's explorer link and are not card transactions.</p><TxFilters /></section>
      {rows.length === 0 ? <EmptyState icon={<ArrowLeftRight size={20} />} title="No card transactions yet" text="Transactions appear once a card is issued and used at a supported merchant." /> : (
        <div className="table-wrap"><table><thead><tr><th>Date</th><th>Merchant</th><th>Amount</th><th>Settled from</th><th>Status</th><th>Reference</th></tr></thead><tbody>
          {rows.map(t => <tr key={t.id}><td>{new Date(t.occurred_at).toLocaleString()}</td><td>{t.merchant ?? "—"}</td><td className="num">{(t.amount_minor / 100).toLocaleString(undefined, { style: "currency", currency: t.currency })}</td><td>{t.settled_asset ?? "—"}</td><td><span className={`pill ${t.status === "settled" ? "ok" : t.status === "declined" ? "bad" : ""}`}>{t.status}</span></td><td className="mono faint">{t.issuer_transaction_id ?? "—"}</td></tr>)}
        </tbody></table></div>)}
      {pages > 1 && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>{Array.from({ length: pages }, (_, i) => <a key={i} className={`btn btn-sm ${page === i + 1 ? "btn-secondary" : "btn-ghost"}`} href={`?${new URLSearchParams({ ...sp, page: String(i + 1) })}`}>{i + 1}</a>)}</div>}
    </>
  );
}
