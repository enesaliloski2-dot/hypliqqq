"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/auth/actions";

async function me() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); return { supabase, user }; }

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const name = z.string().trim().min(2).max(80).safeParse(form.get("fullName"));
  if (!name.success) return { fieldErrors: { fullName: "Enter your full name." } };
  const { supabase, user } = await me(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("profiles").update({ full_name: name.data }).eq("id", user.id);
  if (error) return { error: "Couldn't save." };
  revalidatePath("/dashboard/settings"); return { ok: true, message: "Profile saved." };
}
export async function updateNotifications(_: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await me(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("profiles").update({ notify_email: form.get("notify_email") === "on", notify_product: form.get("notify_product") === "on", notify_alerts: form.get("notify_alerts") === "on" }).eq("id", user.id);
  if (error) return { error: "Couldn't save." };
  revalidatePath("/dashboard/settings"); return { ok: true, message: "Notification preferences saved." };
}
export async function createTicket(_: FormState, form: FormData): Promise<FormState> {
  const s = z.object({ subject: z.string().trim().min(3).max(120), body: z.string().trim().min(10).max(4000) }).safeParse(Object.fromEntries(form));
  if (!s.success) return { error: "Add a subject and a few words describing the issue." };
  const { supabase, user } = await me(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, ...s.data });
  if (error) return { error: "Couldn't send the request." };
  revalidatePath("/dashboard/support"); return { ok: true, message: "Support request sent." };
}
export async function applyForCard(_: FormState, form: FormData): Promise<FormState> {
  const country = z.string().trim().min(2).max(60).safeParse(form.get("country"));
  if (!country.success) return { fieldErrors: { country: "Enter your country." } };
  const { supabase, user } = await me(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("card_applications").insert({ user_id: user.id, country: country.data });
  if (error) return { error: "Couldn't submit your interest." };
  revalidatePath("/dashboard/card"); return { ok: true, message: "Interest registered. We'll review it when issuing opens in your region." };
}
export async function registerFounding(): Promise<FormState> {
  const { supabase, user } = await me(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("founding_registrations").upsert({ user_id: user.id }, { onConflict: "user_id" });
  if (error) return { error: "Couldn't register." };
  revalidatePath("/dashboard"); return { ok: true, message: "Registered for Founding 100 eligibility review." };
}
export async function completeOnboarding() {
  const { supabase, user } = await me(); if (!user) return;
  await supabase.from("profiles").update({ onboarding_done: true }).eq("id", user.id);
  revalidatePath("/dashboard");
}
export async function requestDeletion(): Promise<FormState> {
  const { supabase, user } = await me(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject: "Account deletion request", body: "The customer requested deletion of their account and data.", priority: "high" });
  if (error) return { error: "Couldn't send the request." };
  return { ok: true, message: "Deletion request sent. We'll confirm by email." };
}
export async function markNotificationsRead() {
  const { supabase, user } = await me(); if (!user) return;
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/dashboard");
}
