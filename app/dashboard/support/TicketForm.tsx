"use client";
import { useActionState } from "react";
import { createTicket } from "@/lib/dashboard/actions";
import type { FormState } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
export function TicketForm() {
  const [s, action] = useActionState<FormState, FormData>(createTicket, {});
  return (
    <form action={action} className="grid" noValidate>
      <div className="field"><label htmlFor="subject">Subject</label><input id="subject" name="subject" className="input" required /></div>
      <div className="field"><label htmlFor="body">How can we help?</label><textarea id="body" name="body" className="input" required /></div>
      {s.ok && <div className="ok-msg">{s.message}</div>}{s.error && <div className="err">{s.error}</div>}
      <div><SubmitButton pendingText="Sending…">Send request</SubmitButton></div>
      <p className="faint">Never share seed phrases, private keys or full card numbers with support. We will never ask for them.</p>
    </form>
  );
}
