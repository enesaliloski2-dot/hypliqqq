"use client";
import { useActionState } from "react";
import { applyForCard } from "@/lib/dashboard/actions";
import type { FormState } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
export function CardApply() {
  const [s, action] = useActionState<FormState, FormData>(applyForCard, {});
  if (s.ok) return <p className="ok-msg" style={{ marginTop: 10 }}>{s.message}</p>;
  return (
    <form action={action} style={{ display: "grid", gap: 10, marginTop: 12 }} noValidate>
      <div className="field"><label htmlFor="country">Country of residence</label><input id="country" name="country" className="input" autoComplete="country-name" required /><div className="err">{s.fieldErrors?.country}</div></div>
      {s.error && <div className="err">{s.error}</div>}
      <SubmitButton pendingText="Sending…">Register interest in a card</SubmitButton>
      <p className="faint">This is not an application for credit and does not issue a card. Identity verification will be requested where required before issuing.</p>
    </form>
  );
}
