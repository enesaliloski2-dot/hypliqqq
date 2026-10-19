import Link from "next/link";
import { Wordmark, Orbit } from "@/components/brand/Logo";
export function AuthShell({ title, children, foot }: { title: string; children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <main className="auth">
      <Orbit className="orbit" />
      <div className="auth-card">
        <Link href="/" aria-label="Home"><Wordmark height={18} className="logo" /></Link>
        <h1 className="t-display">{title}</h1>
        {children}
        {foot && <div className="foot">{foot}</div>}
      </div>
    </main>
  );
}
