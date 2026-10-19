"use client";
import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/dashboard/actions";
const steps = [
  ["What this is", "An independent crypto-card concept for users of the Hyperliquid ecosystem, not affiliated with Hyperliquid Labs or any card network. Your account is in early access while an issuer and conversion partners are engaged."],
  ["How wallet connections work", "Connect Wallet asks your wallet app for permission to share a public address. Hyperliquid Card reads balances; it never asks for seed phrases, keys, or spending approval."],
  ["Where things live", "My Card shows card status and controls. Wallets lists connections. Transactions separates on-chain activity from card purchases. Settings covers security and notifications."],
  ["How card availability is determined", "Issuing depends on your region, identity verification where required, and an authorized issuer. You'll be notified here and by email when it opens for you."],
];
export function Onboarding() {
  const [i, setI] = useState(0); const [done, setDone] = useState(false); const [pending, start] = useTransition();
  if (done) return null;
  const finish = () => { setDone(true); start(() => completeOnboarding()); };
  return (
    <section className="panel" style={{ borderColor: "rgba(56,130,255,.35)", display: "grid", gap: 10 }}>
      <div className="faint">Getting started · {i + 1} of {steps.length}</div>
      <h3 style={{ margin: 0 }}>{steps[i][0]}</h3><p className="muted" style={{ fontSize: 14 }}>{steps[i][1]}</p>
      <div style={{ display: "flex", gap: 8 }}>
        {i < steps.length - 1 ? <button className="btn btn-primary btn-sm" onClick={() => setI(i + 1)}>Next</button> : <button className="btn btn-primary btn-sm" onClick={finish} disabled={pending}>Done</button>}
        <button className="btn btn-ghost btn-sm" onClick={finish}>Skip</button>
      </div>
    </section>
  );
}
