"use client";
import { useActionState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { updatePassword, type FormState } from "@/lib/auth/actions";
import { PasswordField } from "@/components/auth/PasswordField";
import { SubmitButton } from "@/components/auth/SubmitButton";
export default function ResetPage() {
  const [state, action] = useActionState<FormState, FormData>(updatePassword, {});
  return (
    <AuthShell title="Choose a new password" foot={state.ok ? <a href="/dashboard">Go to your dashboard</a> : undefined}>
      {state.ok ? <p className="ok-msg" style={{ textAlign: "center", fontSize: 15 }}>{state.message}</p> : (
        <form action={action} noValidate>
          <PasswordField name="password" label="New password" autoComplete="new-password" error={state.fieldErrors?.password} strength />
          <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" error={state.fieldErrors?.confirm} />
          {state.error && <div className="err" role="alert">{state.error}</div>}
          <SubmitButton pendingText="Saving…">Update password</SubmitButton>
        </form>)}
    </AuthShell>
  );
}
