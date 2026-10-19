"use client";
import { useActionState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { requestPasswordReset, type FormState } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
export default function ForgotPage() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, {});
  return (
    <AuthShell title="Reset your password" foot={<a href="/login">Back to log in</a>}>
      {state.ok ? <p className="ok-msg" style={{ textAlign: "center", fontSize: 15 }}>{state.message}</p> : (
        <form action={action} noValidate>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" autoComplete="email" required /><div className="err">{state.fieldErrors?.email}</div></div>
          {state.error && <div className="err" role="alert">{state.error}</div>}
          <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
        </form>)}
    </AuthShell>
  );
}
