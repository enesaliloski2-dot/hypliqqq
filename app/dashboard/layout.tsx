import { requireUser } from "@/lib/auth/require";
import { Shell } from "@/components/dashboard/Shell";
import { customerNav } from "@/components/dashboard/nav-items";
import { WalletProviders } from "@/components/wallet/Providers";
import { ConnectWalletButton } from "@/components/wallet/ConnectWallet";
import { Notifications, type Notification } from "@/components/dashboard/Notifications";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase, user } = await requireUser();
  const { data: notes } = await supabase.from("notifications").select("id,title,body,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  const first = profile.full_name.split(" ")[0];
  return (
    <WalletProviders>
      <Shell profile={profile} items={customerNav} title={first ? `Welcome, ${first}` : "Hyperliquid Card"} rightSlot={<ConnectWalletButton />} bell={<Notifications items={(notes ?? []) as Notification[]} />}>{children}</Shell>
    </WalletProviders>
  );
}
