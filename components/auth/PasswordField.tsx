"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { passwordStrength } from "@/lib/validation/auth";

export function PasswordField({ name, label, autoComplete, error, strength = false }: { name: string; label: string; autoComplete: string; error?: string; strength?: boolean }) {
  const [show, setShow] = useState(false); const [v, setV] = useState("");
  const s = passwordStrength(v);
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="pw">
        <input id={name} name={name} className="input" type={show ? "text" : "password"} autoComplete={autoComplete} required aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined} onChange={e => setV(e.target.value)} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
      </div>
      {strength && v && <div className="strength" aria-label={`Password strength ${s} of 4`}>{[1, 2, 3, 4].map(i => <i key={i} className={i <= s ? "on" : ""} />)}</div>}
      <div className="err" id={`${name}-err`}>{error}</div>
    </div>
  );
}
