import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { SideNav, MobileNav, type NavItem } from "./Nav";
import { AccountMenu } from "./AccountMenu";
import type { Profile } from "@/lib/auth/require";

export function Shell({ profile, items, title, children, tag, rightSlot, bell }: { profile: Profile; items: NavItem[]; title: string; children: ReactNode; tag?: string; rightSlot?: ReactNode; bell?: ReactNode }) {
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/" aria-label="Home"><Wordmark height={15} className="logo" /></Link>
        {tag && <div className="tag">{tag}</div>}
        <SideNav items={items} />
        <div className="spacer" />
        <div className="faint" style={{ padding: "8px 12px" }}>Early access · no card issued</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <h1>{title}</h1><span className="faint" style={{ display: "none" }} />
          <div className="right">{rightSlot}{bell}<AccountMenu profile={profile} /></div>
        </header>
        <main className="content">{children}</main>
      </div>
      <MobileNav items={items} />
    </div>
  );
}
