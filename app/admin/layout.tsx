import { requireAdmin } from "@/lib/auth/require";
import { Shell } from "@/components/dashboard/Shell";
import { adminNav } from "@/components/dashboard/nav-items";
/* Every /admin route re-checks the role from the database. Customers are redirected with an access-denied notice. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return <Shell profile={profile} items={adminNav} title="Hyperliquid Card — Operations" tag="Administration">{children}</Shell>;
}
