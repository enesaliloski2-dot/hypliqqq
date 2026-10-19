import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
export default function NotFound() { return <AuthShell title="Page not found" foot={<Link href="/">Back to the site</Link>}><p className="muted" style={{ textAlign: "center" }}>That page doesn't exist or has moved.</p></AuthShell>; }
