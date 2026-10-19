import { requireUser } from "@/lib/auth/require";
import { CardViewer } from "@/components/cards/CardViewer";
import { CardApply } from "./CardApply";
const cardLabel: Record<string, [string, string]> = { not_issued: ["Coming soon", ""], application_pending: ["Application pending", "warn"], active: ["Active", "ok"], frozen: ["Frozen", "blue"], closed: ["Closed", "bad"] };
export default async function CardPage() {
  const { supabase, user } = await requireUser();
  const [{ data: card }, { data: app }] = await Promise.all([
    supabase.from("cards").select("status,last4,issuer_reference").eq("user_id", user.id).maybeSingle(),
    supabase.from("card_applications").select("status,country,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const status = card?.status ?? "not_issued"; const [cl, cc] = cardLabel[status];
  const live = status === "active" || status === "frozen";
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)", alignItems: "start" }}>
      <section className="panel"><CardViewer size={560} /><p className="faint" style={{ marginTop: 14, textAlign: "center" }}>Concept artwork. Cardholder name, signature and the sample code are not your credentials; real card details are delivered only through the issuer's secure interface.</p></section>
      <div className="grid">
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0 }}>Card availability</h3><span className={`pill ${cc}`}>{cl}</span></div>
          {card?.last4 && <div className="mono" style={{ marginTop: 10 }}>•••• {card.last4}</div>}
          <p className="muted" style={{ fontSize: 14, marginTop: 10 }}>{status === "not_issued" ? "Card issuing isn't configured yet. Register your interest below and we'll review it when issuing opens in your region." : status === "application_pending" ? `Your interest was registered${app?.created_at ? " on " + new Date(app.created_at).toLocaleDateString() : ""} and is being reviewed.` : "Status is reported by the issuing provider."}</p>
          {status === "not_issued" && !app && <CardApply />}
          {app && <div className="faint" style={{ marginTop: 8 }}>Application: {app.status.replace("_", " ")}{app.country ? ` · ${app.country}` : ""}</div>}
        </section>
        <section className="panel">
          <h3>Card controls</h3>
          <div className="grid" style={{ gap: 8 }}>
            {[["Freeze card", "Pause all authorizations instantly."], ["Spending preferences", "Limits and merchant categories."], ["Transaction notifications", "An alert for every authorization."], ["Card support", "Lost card, disputes, replacement."]].map(([t, d]) => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 12 }}>
                <div><div style={{ fontSize: 14 }}>{t}</div><div className="faint">{d}</div></div>
                <span className={`pill ${live ? "blue" : ""}`}>{live ? "Available" : "Planned"}</span>
              </div>))}
          </div>
          <p className="faint" style={{ marginTop: 10 }}>Controls activate when a real card is issued and connected to an authorized issuer. Nothing here simulates a result on a card that doesn't exist.</p>
        </section>
      </div>
    </div>
  );
}
