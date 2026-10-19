import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "./SignupForm";
export const metadata = { title: "Create account — Hyperliquid Card" };
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthShell title="Create your account" foot={<>Already have an account? <a href="/login">Log in</a></>}><SignupForm next={next} /></AuthShell>;
}
