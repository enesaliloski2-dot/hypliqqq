"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/lib/dashboard/actions";
export type Notification = { id: string; title: string; body: string; read_at: string | null; created_at: string };
export function Notifications({ items }: { items: Notification[] }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const [, start] = useTransition();
  const unread = items.filter(n => !n.read_at).length;
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("click", h); return () => document.removeEventListener("click", h); }, []);
  const toggle = () => { const o = !open; setOpen(o); if (o && unread) start(() => markNotificationsRead()); };
  return (
    <div className="menu" ref={ref}>
      <button className="btn btn-ghost btn-sm" onClick={toggle} aria-haspopup="dialog" aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} style={{ position: "relative" }}>
        <Bell size={16} />{unread > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--blue)" }} />}
      </button>
      {open && (
        <div className="menu-pop" role="dialog" aria-label="Notifications" style={{ minWidth: 300, maxWidth: 360 }}>
          <div style={{ padding: "8px 10px", fontSize: 13, fontWeight: 600 }}>Notifications</div>
          {items.length === 0 ? <div className="faint" style={{ padding: "10px 10px 14px" }}>No notifications yet. Account and system events will appear here.</div>
            : items.map(n => <div key={n.id} style={{ padding: "9px 10px", borderTop: "1px solid var(--line)", opacity: n.read_at ? .75 : 1 }}><div style={{ fontSize: 13.5 }}>{n.title}</div><div className="faint">{n.body}</div><div className="faint" style={{ marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</div></div>)}
        </div>)}
    </div>
  );
}
