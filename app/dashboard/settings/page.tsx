import { requireUser } from "@/lib/auth/require";
import { SettingsForms } from "./SettingsForms";
export default async function SettingsPage() {
  const { profile, user, supabase } = await requireUser();
  const { data: wallets } = await supabase.from("wallet_connections").select("id,provider,network").eq("user_id", user.id);
  return <SettingsForms profile={profile} emailVerified={!!user.email_confirmed_at} wallets={wallets ?? []} lastSignIn={user.last_sign_in_at ?? null} />;
}
