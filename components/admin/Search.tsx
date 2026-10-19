"use client";
import { useRouter, useSearchParams } from "next/navigation";
export function Search({ placeholder }: { placeholder: string }) {
  const sp = useSearchParams(); const router = useRouter();
  return <form onSubmit={e => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); router.push(q ? `?q=${encodeURIComponent(String(q))}` : "?"); }} style={{ display: "flex", gap: 8 }}><input name="q" className="input" placeholder={placeholder} defaultValue={sp.get("q") ?? ""} aria-label={placeholder} style={{ maxWidth: 360 }} /><button className="btn btn-secondary">Search</button></form>;
}
