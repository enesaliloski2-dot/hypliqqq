import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";
export const metadata = { title: "Log in — Hyperliquid Card" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; verified?: string }> }) {
  const { next, verified } = await searchParams;
  return (
    <AuthShell title="Welcome back" foot={<>New to Hyperliquid Card? <a href="/signup">Create an account</a></>}>
      {verified && <p className="ok-msg" style={{ textAlign: "center" }}>Email verified. You can log in now.</p>}
      <Suspense><LoginForm next={next} /></Suspense>
    </AuthShell>
  );
}
