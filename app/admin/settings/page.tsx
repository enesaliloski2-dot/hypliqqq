import { requireAdmin } from "@/lib/auth/require";
import { SettingsPanel } from "./SettingsPanel";
export default async function AdminSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("platform_settings").select("key,value,updated_at");
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return <SettingsPanel waitlistOpen={map.waitlist_open === true} founding={String(map.founding_promotion_status ?? "planned")} cardLabel={String(map.card_availability_label ?? "")} />;
}
