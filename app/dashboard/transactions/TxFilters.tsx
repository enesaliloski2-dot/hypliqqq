"use client";
import { useRouter, useSearchParams } from "next/navigation";
export function TxFilters() {
  const sp = useSearchParams(); const router = useRouter();
  return (
    <form style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginTop: 12 }} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const p = new URLSearchParams(); f.forEach((v, k) => { if (v) p.set(k, String(v)); }); router.push(`?${p}`); }}>
      <input name="q" className="input" placeholder="Search merchant" defaultValue={sp.get("q") ?? ""} aria-label="Search merchant" />
      <select name="status" className="input" defaultValue={sp.get("status") ?? ""} aria-label="Status"><option value="">Any status</option><option value="pending">Pending</option><option value="settled">Settled</option><option value="declined">Declined</option><option value="refunded">Refunded</option></select>
      <input name="from" type="date" className="input" defaultValue={sp.get("from") ?? ""} aria-label="From date" />
      <input name="to" type="date" className="input" defaultValue={sp.get("to") ?? ""} aria-label="To date" />
      <button className="btn btn-secondary">Filter</button>
    </form>
  );
}
