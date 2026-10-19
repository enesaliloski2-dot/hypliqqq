import { Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth/require";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConnectWalletButton } from "@/components/wallet/ConnectWallet";
import { WalletCard, type WalletRow } from "@/components/wallet/WalletCard";
export default async function WalletsPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("wallet_connections").select("*").eq("user_id", user.id).order("last_connected_at", { ascending: false });
  const wallets = (data ?? []) as WalletRow[];
  return (
    <>
      <section className="panel" style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div><h3 style={{ margin: 0 }}>Connected wallets</h3><p className="faint">We read public addresses and on-chain balances only. It cannot move funds, and never requests keys or signatures to connect.</p></div>
        <ConnectWalletButton />
      </section>
      {wallets.length ? <div className="grid grid-3">{wallets.map(w => <WalletCard key={w.id} w={w} />)}</div>
        : <EmptyState icon={<Wallet size={20} />} title="No wallet connected" text="Connect your wallet to explore your digital assets." action={<ConnectWalletButton className="btn btn-secondary btn-sm" />} />}
    </>
  );
}
