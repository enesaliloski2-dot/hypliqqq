"use client";
import { useActionState } from "react";
import Link from "next/link";
import { resendVerification, type FormState } from "@/lib/auth/actions";
import { SubmitButton } from "./SubmitButton";
export function VerifyScreen({ email, next }: { email: string; next?: string }) {
  const [s, action] = useActionState<FormState, FormData>(resendVerification, {});
  return (
    <div style={{ display: "grid", gap: 16, textAlign: "center" }}>
      <h2 className="t-display" style={{ fontSize: 22 }}>One last step.</h2>
      <p className="muted" style={{ fontSize: 15 }}>Check your inbox to verify your email and complete your account.</p>
      <p className="faint">Sent to <strong style={{ color: "var(--text)" }}>{email}</strong>. The link opens your dashboard.</p>
      <form action={action} style={{ display: "grid", gap: 8 }}>
        <input type="hidden" name="email" value={email} />{next && <input type="hidden" name="next" value={next} />}
        {s.ok && <div className="ok-msg">{s.message}</div>}{s.error && <div className="err">{s.error}</div>}
        <SubmitButton pendingText="Sending…">Resend verification email</SubmitButton>
      </form>
      <Link href="/login" className="btn btn-secondary">Return to Login</Link>
    </div>
  );
}
