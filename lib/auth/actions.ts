"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, emailSchema, passwordSchema } from "@/lib/validation/auth";

export type FormState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean; message?: string; verifyEmail?: string; unverified?: boolean };
const safeNext = (v: unknown) => { const n = String(v ?? "/dashboard"); return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard"; };
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const fieldErrors = (e: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) =>
  Object.fromEntries(Object.entries(e.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]));

/* Per-instance limiter. Pair with Supabase's auth rate limits and an edge WAF in production. */
const attempts = new Map<string, { n: number; t: number }>();
function limited(key: string, max = 8, windowMs = 10 * 60_000) {
  const now = Date.now(); const a = attempts.get(key);
  if (!a || now - a.t > windowMs) { attempts.set(key, { n: 1, t: now }); return false; }
  a.n++; return a.n > max;
}
async function clientKey() { const h = await headers(); return h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local"; }

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  if (limited("signup:" + (await clientKey()), 5)) return { error: "Too many attempts. Try again in a few minutes." };
  const next = safeNext(form.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email, password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: /registered|exists/i.test(error.message) ? "An account with this email already exists. Try logging in." : error.message };
  if (data.user && data.user.identities?.length === 0) return { error: "An account with this email already exists. Try logging in." };
  if (data.session) redirect(next);
  return { ok: true, verifyEmail: parsed.data.email };
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  if (limited("login:" + (await clientKey()) + ":" + parsed.data.email)) return { error: "Too many sign-in attempts. Wait 10 minutes or reset your password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return error.message === "Email not confirmed" ? { error: "Verify your email first — check your inbox for the link.", unverified: true, verifyEmail: parsed.data.email } : { error: "Email or password is incorrect." };
  redirect(safeNext(form.get("next")));
}

export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { fieldErrors: { email: email.error.issues[0].message } };
  if (limited("reset:" + (await clientKey()), 5)) return { error: "Too many requests. Try again later." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${siteUrl()}/auth/callback?next=/auth/reset` });
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const pw = passwordSchema.safeParse(form.get("password"));
  if (!pw.success) return { fieldErrors: { password: pw.error.issues[0].message } };
  if (pw.data !== form.get("confirm")) return { fieldErrors: { confirm: "Passwords don't match." } };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) return { error: error.message };
  return { ok: true, message: "Password updated." };
}

export async function resendVerification(_: FormState, form: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  if (limited("resend:" + (await clientKey()) + ":" + email.data, 3, 15 * 60_000)) return { error: "We've already sent a few. Wait 15 minutes before requesting another." };
  const supabase = await createClient();
  const next = safeNext(form.get("next"));
  const { error } = await supabase.auth.resend({ type: "signup", email: email.data, options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` } });
  if (error) return { error: "Couldn't resend right now. Try again in a minute." };
  return { ok: true, message: "Verification email sent again." };
}
