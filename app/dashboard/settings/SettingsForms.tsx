"use client";
import { useActionState } from "react";
import Link from "next/link";
import { updateProfile, updateNotifications, requestDeletion } from "@/lib/dashboard/actions";
import { signOut, updatePassword, type FormState } from "@/lib/auth/actions";
import { PasswordField } from "@/components/auth/PasswordField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import type { Profile } from "@/lib/auth/require";

export function SettingsForms({ profile, emailVerified, wallets, lastSignIn }: { profile: Profile; emailVerified: boolean; wallets: { id: string; provider: string; network: string }[]; lastSignIn: string | null }) {
  const [p, pa] = useActionState<FormState, FormData>(updateProfile, {});
  const [n, na] = useActionState<FormState, FormData>(updateNotifications, {});
  const [pw, pwa] = useActionState<FormState, FormData>(updatePassword, {});
  const [d, da] = useActionState<FormState, FormData>(async () => requestDeletion(), {});
  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <section className="panel" id="profile"><h3>Profile</h3>
        <form action={pa} className="grid" noValidate>
          <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" className="input" defaultValue={profile.full_name} /><div className="err">{p.fieldErrors?.fullName}</div></div>
          <div className="field"><label>Email</label><input className="input" value={profile.email} disabled /><div className="faint">{emailVerified ? "Verified" : "Not verified — check your inbox for the link."} · Member since {new Date(profile.created_at).toLocaleDateString()}</div></div>
          {p.ok && <div className="ok-msg">{p.message}</div>}{p.error && <div className="err">{p.error}</div>}
          <div><SubmitButton pendingText="Saving…">Save profile</SubmitButton></div>
        </form>
      </section>
      <section className="panel" id="security"><h3>Account security</h3>
        <form action={pwa} className="grid" noValidate>
          <PasswordField name="password" label="New password" autoComplete="new-password" error={pw.fieldErrors?.password} strength />
          <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" error={pw.fieldErrors?.confirm} />
          {pw.ok && <div className="ok-msg">{pw.message}</div>}{pw.error && <div className="err">{pw.error}</div>}
          <div><SubmitButton pendingText="Updating…">Change password</SubmitButton></div>
        </form>
        <div className="faint" style={{ marginTop: 14 }}>Multi-factor authentication: available when enabled in the authentication provider's dashboard. Last sign-in: {lastSignIn ? new Date(lastSignIn).toLocaleString() : "—"}.</div>
        <form action={signOut} style={{ marginTop: 10 }}><button className="btn btn-secondary btn-sm">Sign out of this session</button></form>
      </section>
      <section className="panel" id="notifications"><h3>Notifications</h3>
        <form action={na} className="grid" style={{ gap: 10 }}>
          <label className="check" style={{ alignItems: "center" }}><input type="checkbox" name="notify_email" defaultChecked={profile.notify_email} /> Email notifications</label>
          <label className="check" style={{ alignItems: "center" }}><input type="checkbox" name="notify_product" defaultChecked={profile.notify_product} /> Product announcements</label>
          <label className="check" style={{ alignItems: "center" }}><input type="checkbox" name="notify_alerts" defaultChecked={profile.notify_alerts} /> Account alerts</label>
          {n.ok && <div className="ok-msg">{n.message}</div>}
          <div><SubmitButton pendingText="Saving…">Save preferences</SubmitButton></div>
        </form>
      </section>
      <section className="panel" id="privacy"><h3>Privacy</h3>
        <p className="muted" style={{ fontSize: 14 }}>We store your name, email, consent records, and the public addresses of wallets you connect. Wallet permissions are read-only; disconnect them any time from <Link href="/dashboard/wallets" style={{ textDecoration: "underline" }}>Wallets</Link>.</p>
        <div className="faint" style={{ marginTop: 8 }}>{wallets.length} connected wallet{wallets.length === 1 ? "" : "s"}.</div>
        <form action={da} style={{ marginTop: 12 }}>{d.ok ? <div className="ok-msg">{d.message}</div> : <button className="btn btn-danger btn-sm">Request account deletion</button>}{d.error && <div className="err">{d.error}</div>}</form>
      </section>
    </div>
  );
}
