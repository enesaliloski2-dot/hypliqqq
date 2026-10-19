import type { NavItem } from "./Nav";
export const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" }, { href: "/dashboard/card", label: "My Card", icon: "card" },
  { href: "/dashboard/wallets", label: "Wallets", icon: "wallet" }, { href: "/dashboard/transactions", label: "Activity", icon: "tx" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" }, { href: "/dashboard/support", label: "Support", icon: "support" },
];
export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" }, { href: "/admin/users", label: "Customers", icon: "users" },
  { href: "/admin/applications", label: "Applications", icon: "apps" }, { href: "/admin/wallets", label: "Wallets", icon: "link" },
  { href: "/admin/support", label: "Support", icon: "support" }, { href: "/admin/promotions", label: "Promotions", icon: "star" },
  { href: "/admin/settings", label: "Settings", icon: "sliders" }, { href: "/admin/audit", label: "Audit log", icon: "audit" }, { href: "/admin/design-review", label: "Design review", icon: "card" }, { href: "/preview", label: "Site preview", icon: "overview" },
];
