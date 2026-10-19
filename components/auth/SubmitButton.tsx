"use client";
import { useFormStatus } from "react-dom";
export function SubmitButton({ children, pendingText }: { children: React.ReactNode; pendingText: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn-primary" disabled={pending} aria-busy={pending}>{pending ? pendingText : children}</button>;
}
