"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Wallet, ArrowLeftRight, Settings, LifeBuoy, Users, FileCheck, Link2, Star, ScrollText, SlidersHorizontal, type LucideIcon } from "lucide-react";
/* Icons are referenced by name so nav config can cross the server→client boundary. */
const icons: Record<string, LucideIcon> = { overview: LayoutDashboard, card: CreditCard, wallet: Wallet, tx: ArrowLeftRight, settings: Settings, support: LifeBuoy, users: Users, apps: FileCheck, link: Link2, star: Star, sliders: SlidersHorizontal, audit: ScrollText };
export type NavItem = { href: string; label: string; icon: keyof typeof icons };
const isActive = (p: string, href: string) => href === "/dashboard" || href === "/admin" ? p === href : p.startsWith(href);
export function SideNav({ items }: { items: NavItem[] }) {
  const p = usePathname();
  return <nav aria-label="Sections">{items.map(i => { const I = icons[i.icon]; return <Link key={i.href} href={i.href} className={isActive(p, i.href) ? "active" : ""}><I /> {i.label}</Link>; })}</nav>;
}
export function MobileNav({ items }: { items: NavItem[] }) {
  const p = usePathname();
  return <nav className="mobile-nav" aria-label="Sections">{items.slice(0, 5).map(i => { const I = icons[i.icon]; return <Link key={i.href} href={i.href} className={isActive(p, i.href) ? "active" : ""}><I />{i.label}</Link>; })}</nav>;
}
