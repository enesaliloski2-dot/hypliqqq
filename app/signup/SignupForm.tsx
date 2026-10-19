"use client";
import { useActionState } from "react";
import { signUp, type FormState } from "@/lib/auth/actions";
import { PasswordField } from "@/components/auth/PasswordField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { VerifyScreen } from "@/components/auth/VerifyScreen";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signUp, {});
  if (state.ok && state.verifyEmail) return <VerifyScreen email={state.verifyEmail} next={next} />;
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" className="input" autoComplete="name" required aria-invalid={!!fe.fullName} /><div className="err">{fe.fullName}</div></div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" autoComplete="email" inputMode="email" required aria-invalid={!!fe.email} /><div className="err">{fe.email}</div></div>
      <PasswordField name="password" label="Password" autoComplete="new-password" error={fe.password} strength />
      <PasswordField name="confirm" label="Confirm password" autoComplete="new-password" error={fe.confirm} />
      <label className="check"><input type="checkbox" name="terms" /> <span>I accept the <a href="/#terms">Terms</a> and <a href="/#privacy">Privacy Policy</a>. Creating an account does not issue a card or confer reward eligibility.</span></label>
      <div className="err">{fe.terms}</div>
      {state.error && <div className="err" role="alert">{state.error}</div>}
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}
