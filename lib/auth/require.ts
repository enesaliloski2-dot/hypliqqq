import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = { id: string; full_name: string; email: string; role: "customer" | "admin"; status: "active" | "restricted" | "closed"; onboarding_done: boolean; notify_email: boolean; notify_product: boolean; notify_alerts: boolean; created_at: string };

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!data) return null;
  return { user, profile: data as Profile, supabase };
}
export async function requireUser() { const ctx = await getProfile(); if (!ctx) redirect("/login"); return ctx; }
/* Role is read from the database on every request and cannot be set from the client (see RLS). */
export async function requireAdmin() { const ctx = await requireUser(); if (ctx.profile.role !== "admin") redirect("/dashboard?denied=1"); return ctx; }
