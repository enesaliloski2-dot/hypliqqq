import Link from "next/link";
import { Wallet, Activity, ShieldAlert, CreditCard, ArrowLeftRight, Settings, Star } from "lucide-react";
import { requireUser } from "@/lib/auth/require";
import { Orbit } from "@/components/brand/Logo";
import { CardViewer } from "@/components/cards/CardViewer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConnectWalletButton } from "@/components/wallet/ConnectWallet";
import { WalletCard, type WalletRow } from "@/components/wallet/WalletCard";
import { Onboarding } from "./Onboarding";
import { FoundingRegister } from "./FoundingRegister";

const cardLabel: Record<string, [string, string]> = { not_issued: ["Coming soon", ""], application_pending: ["Application pending", "warn"], active: ["Active", "ok"], frozen: ["Frozen", "blue"], closed: ["Closed", "bad"] };

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string; founding?: string; verified?: string }> }) {
  const { profile, supabase, user } = await requireUser();
  const { denied, founding, verified } = await searchParams;
  const [{ data: wallets }, { data: card }, { data: events }, { data: reg }] = await Promise.all([
    supabase.from("wallet_connections").select("*").eq("user_id", user.id).order("last_connected_at", { ascending: false }),
    supabase.from("cards").select("status").eq("user_id", user.id).maybeSingle(),
    supabase.from("notifications").select("title, body, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
    supabase.from("founding_registrations").select("status,created_at").eq("user_id", user.id).maybeSingle(),
  ]);
  const first = (profile.full_name.split(" ")[0] || "there").toUpperCase();
  const [cl, cc] = cardLabel[card?.status ?? "not_issued"];
  const quick = [[ "/dashboard/wallets", "Connect wallet", Wallet ], ["/dashboard/card", "View card", CreditCard], ["/dashboard/transactions", "View transactions", ArrowLeftRight], ["/dashboard/settings", "Manage account", Settings]] as const;
  return (
    <>
      {verified && <div className="panel" style={{ borderColor: "rgba(79,216,164,.4)" }}>Email verified. Welcome aboard.</div>}
      {denied && <div className="panel" style={{ borderColor: "rgba(255,138,138,.4)", display: "flex", gap: 10, alignItems: "center" }}><ShieldAlert size={16} color="var(--danger)" /> That area is restricted to Hyperliquid Card administrators.</div>}
      {!profile.onboarding_done && <Onboarding />}
      <section className="hero-band"><Orbit className="orbit" /><div><h2 className="t-display" style={{ letterSpacing: ".01em" }}>Welcome back, {first}.</h2><p>Your digital assets. Your onchain experience.</p></div><div><ConnectWalletButton className="btn btn-primary" /></div></section>
      <div className="grid grid-4">{quick.map(([href, label, Icon]) => <Link key={href} href={href} className="panel" style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px" }}><span className="avatar" style={{ borderRadius: 10 }}><Icon size={15} /></span><span style={{ fontSize: 14 }}>{label}</span></Link>)}</div>
      {(founding || reg) && (
        <section className="panel" style={{ borderColor: "rgba(217,192,138,.3)", display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}><h3 style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}><Star size={15} color="var(--gold)" /> Founding member program</h3>{reg && <span className="pill warn">{reg.status.replace("_", " ")}</span>}</div>
          <p className="muted" style={{ fontSize: 14 }}>{reg ? `You registered interest on ${new Date(reg.created_at).toLocaleDateString()}. The program is proposed and not funded; registration creates no reward balance.` : "Register interest in the proposed 5,000 USDT founding reward (up to 1,000 qualifying customers). This records you for eligibility review only — nothing is funded, active or guaranteed."}</p>
          {!reg && <FoundingRegister />}
          <Link href="/#promo-terms" className="faint" style={{ textDecoration: "underline" }}>Program terms</Link>
        </section>)}
      <div className="grid grid-2">
        <section className="panel">
          <h3>Wallet</h3>
          {wallets && wallets.length > 0 ? <div className="grid">{(wallets as WalletRow[]).map(w => <WalletCard key={w.id} w={w} />)}</div>
            : <EmptyState icon={<Wallet size={20} />} title="Your wallet. Your control." text="Connect a supported wallet to explore your digital assets." action={<ConnectWalletButton className="btn btn-primary btn-sm" label="Connect Wallet →" />} />}
        </section>
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ margin: 0 }}>Card</h3><span className={`pill ${cc}`}>Card availability: {cl}</span></div>
          <CardViewer controls={false} size={420} />
          <p className="faint" style={{ marginTop: 14 }}>Concept artwork. Your own card details appear here only once issued by an authorized provider; the name, signature and code on the artwork are not credentials.</p>
          <Link href="/dashboard/card" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>Open My Card</Link>
        </section>
      </div>
      <section className="panel">
        <h3>Recent activity</h3>
        {events && events.length > 0 ? <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>{events.map((e, i) => <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}><span>{e.title} <span className="muted">— {e.body}</span></span><span className="faint">{new Date(e.created_at).toLocaleDateString()}</span></li>)}</ul>
          : <EmptyState icon={<Activity size={20} />} title="No activity to display yet." text="Account and wallet events will appear here as they happen." />}
      </section>
    </>
  );
}
