import { requireAdmin } from "@/lib/auth/require";
import { setFoundingStatus } from "@/lib/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { PromotionForm, type Promotion } from "./PromotionForm";

export default async function Promotions() {
  const { supabase } = await requireAdmin();
  const [{ data: promos }, { data: regs }, { data: rewards }] = await Promise.all([
    supabase.from("promotions").select("*").order("created_at"),
    supabase.from("founding_registrations").select("id,status,admin_notes,created_at,profiles(full_name,email)").order("created_at", { ascending: true }).limit(1000),
    supabase.from("reward_records").select("id,amount,currency,status,payment_reference,created_at,promotions(name),profiles(email)").order("created_at", { ascending: false }).limit(200),
  ]);
  type Reg = { id: string; status: "registered" | "eligibility_review" | "eligible" | "ineligible"; admin_notes: string | null; created_at: string; profiles: { full_name: string; email: string } | null };
  type Rew = { id: string; amount: number; currency: string; status: string; payment_reference: string | null; created_at: string; promotions: { name: string } | null; profiles: { email: string } | null };
  const rows = (regs ?? []) as unknown as Reg[]; const rew = (rewards ?? []) as unknown as Rew[];
  return (
    <>
      <section className="panel"><h3>Promotion configuration</h3><p className="faint">Status, budget, dates, eligibility, caps and disclosures. A promotion cannot be set to <em>open</em> without an approved budget, a published terms URL and disclosures on record. Nothing here credits a customer.</p></section>
      <div className="grid grid-2" style={{ alignItems: "start" }}>{((promos ?? []) as Promotion[]).map(p => <PromotionForm key={p.id} promo={p} />)}</div>
      <section className="panel"><h3>Reward ledger</h3><p className="faint">Written only by the backend crediting process with a payment reference. The app has no policy that lets it insert rows here.</p>
        {rew.length ? <div className="table-wrap" style={{ marginTop: 10 }}><table><thead><tr><th>When</th><th>Customer</th><th>Promotion</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody>{rew.map(r => <tr key={r.id}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.profiles?.email}</td><td>{r.promotions?.name}</td><td className="num">{r.amount} {r.currency}</td><td><span className={`pill ${r.status === "credited" ? "ok" : r.status === "failed" ? "bad" : ""}`}>{r.status}</span></td><td className="mono faint">{r.payment_reference ?? "—"}</td></tr>)}</tbody></table></div> : <p className="faint" style={{ marginTop: 8 }}>No rewards have been credited. None can be until a promotion is open and a crediting service is connected.</p>}
      </section>
      <section className="panel"><h3>Founding member interest queue</h3><p className="faint">In order received. Marking someone eligible records a review decision only.</p>
        <div className="table-wrap" style={{ marginTop: 10 }}><table><thead><tr><th>#</th><th>Member</th><th>Registered</th><th>Review</th></tr></thead><tbody>
          {rows.map((r, i) => <tr key={r.id}><td className="num">{i + 1}</td><td><div>{r.profiles?.full_name || "—"}</div><div className="faint">{r.profiles?.email}</div></td><td>{new Date(r.created_at).toLocaleString()}</td><td><StatusSelect value={r.status} options={["registered", "eligibility_review", "eligible", "ineligible"]} onChange={setFoundingStatus.bind(null, r.id)} /></td></tr>)}
          {!rows.length && <tr><td colSpan={4} className="faint">No registrations yet.</td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
