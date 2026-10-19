"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, User, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import type { Profile } from "@/lib/auth/require";

export function AccountMenu({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("click", h); return () => document.removeEventListener("click", h); }, []);
  const initials = profile.full_name.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || profile.email[0].toUpperCase();
  return (
    <>
      <div className="menu" ref={ref}>
        <button className="avatar" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">{initials}</button>
        {open && (
          <div className="menu-pop" role="menu">
            <div style={{ padding: "8px 10px" }}><div style={{ fontSize: 13.5 }}>{profile.full_name || "Your account"}</div><div className="faint">{profile.email}</div></div>
            <Link href="/dashboard/settings#profile" role="menuitem"><User size={15} /> Profile</Link>
            <Link href="/dashboard/settings" role="menuitem"><Settings size={15} /> Settings</Link>
            <form action={signOut}><button type="submit" role="menuitem"><LogOut size={15} /> Sign out</button></form>
          </div>)}
      </div>
    </>
  );
}
