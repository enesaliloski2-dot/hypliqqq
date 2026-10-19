"use client";
import { useActionState } from "react";
import { registerFounding } from "@/lib/dashboard/actions";
import type { FormState } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
export function FoundingRegister() {
  const [s, action] = useActionState<FormState, FormData>(async () => registerFounding(), {});
  if (s.ok) return <div className="ok-msg">{s.message}</div>;
  return <form action={action}><SubmitButton pendingText="Registering…">Register for eligibility review</SubmitButton>{s.error && <div className="err">{s.error}</div>}</form>;
}
