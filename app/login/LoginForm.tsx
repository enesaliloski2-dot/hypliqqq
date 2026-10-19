"use client";
import { useActionState } from "react";
import Link from "next/link";
import { signIn, type FormState } from "@/lib/auth/actions";
import { PasswordField } from "@/components/auth/PasswordField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { VerifyScreen } from "@/components/auth/VerifyScreen";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  if (state.unverified && state.verifyEmail) return <VerifyScreen email={state.verifyEmail} next={next} />;
  return (
    <form action={action} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" autoComplete="email" inputMode="email" required aria-invalid={!!state.fieldErrors?.email} /><div className="err">{state.fieldErrors?.email}</div></div>
      <PasswordField name="password" label="Password" autoComplete="current-password" error={state.fieldErrors?.password} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label className="check" style={{ alignItems: "center" }}><input type="checkbox" name="remember" defaultChecked /> Keep me signed in</label>
        <Link href="/forgot-password" className="faint" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Forgot password?</Link>
      </div>
      {state.error && <div className="err" role="alert">{state.error}</div>}
      <SubmitButton pendingText="Signing in…">Log in</SubmitButton>
    </form>
  );
}
