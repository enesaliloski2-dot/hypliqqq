import { LifeBuoy } from "lucide-react";
import { requireUser } from "@/lib/auth/require";
import { EmptyState } from "@/components/ui/EmptyState";
import { TicketForm } from "./TicketForm";
export default async function SupportPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("support_tickets").select("id,subject,status,priority,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  const rows = data ?? [];
  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <section className="panel"><h3>Contact support</h3><TicketForm /></section>
      <section className="panel"><h3>Your requests</h3>
        {rows.length ? <div className="grid" style={{ gap: 8 }}>{rows.map(t => <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 12 }}><div><div style={{ fontSize: 14 }}>{t.subject}</div><div className="faint">{new Date(t.created_at).toLocaleDateString()}</div></div><span className={`pill ${t.status === "resolved" ? "ok" : t.status === "in_progress" ? "blue" : ""}`}>{t.status.replace("_", " ")}</span></div>)}</div>
          : <EmptyState icon={<LifeBuoy size={20} />} title="No support requests" text="Questions about your account, wallets or card availability? Send us a note." />}
      </section>
    </div>
  );
}
