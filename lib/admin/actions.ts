"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require";

async function audit(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], actor: string, action: string, resource_type: string, resource_id: string, details?: object, outcome = "ok") {
  await supabase.from("audit_logs").insert({ actor_id: actor, action, resource_type, resource_id, details, outcome });
}

export async function setAccountStatus(userId: string, status: "active" | "restricted" | "closed") {
  const { supabase, user } = await requireAdmin();
  if (!z.string().uuid().safeParse(userId).success) return { error: "Invalid id." };
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
  await audit(supabase, user.id, "profile.status", "profile", userId, { status }, error ? "error" : "ok");
  if (error) return { error: "Update failed." };
  revalidatePath("/admin/users"); return { ok: true };
}

export async function setApplicationStatus(id: string, status: "submitted" | "under_review" | "approved" | "rejected" | "issued", notes?: string) {
  const { supabase, user } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid id." };
  if (status === "issued") return { error: "Cards are marked issued only through the issuer webhook, not by hand." };
  const { error } = await supabase.from("card_applications").update({ status, notes: notes ?? null }).eq("id", id);
  await audit(supabase, user.id, "application.status", "card_application", id, { status }, error ? "error" : "ok");
  if (error) return { error: "Update failed." };
  revalidatePath("/admin/applications"); return { ok: true };
}

export async function updateTicket(id: string, patch: { status?: "open" | "in_progress" | "resolved" | "closed"; priority?: "low" | "normal" | "high"; internal_notes?: string }) {
  const { supabase, user } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid id." };
  const { error } = await supabase.from("support_tickets").update(patch).eq("id", id);
  await audit(supabase, user.id, "ticket.update", "support_ticket", id, patch, error ? "error" : "ok");
  if (error) return { error: "Update failed." };
  revalidatePath("/admin/support"); return { ok: true };
}

export async function setFoundingStatus(id: string, status: "registered" | "eligibility_review" | "eligible" | "ineligible", admin_notes?: string) {
  const { supabase, user } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid id." };
  const { error } = await supabase.from("founding_registrations").update({ status, admin_notes: admin_notes ?? null }).eq("id", id);
  await audit(supabase, user.id, "founding.status", "founding_registration", id, { status }, error ? "error" : "ok");
  if (error) return { error: "Update failed." };
  revalidatePath("/admin/founding"); return { ok: true };
}

export async function setSetting(key: "waitlist_open" | "founding_promotion_status" | "card_availability_label", value: string | boolean) {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("platform_settings").upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
  await audit(supabase, user.id, "settings.update", "platform_setting", key, { value }, error ? "error" : "ok");
  if (error) return { error: "Update failed." };
  revalidatePath("/admin"); return { ok: true };
}

export async function setTicketStatus(id: string, status: "open" | "in_progress" | "resolved" | "closed") { return updateTicket(id, { status }); }
export async function setTicketPriority(id: string, priority: "low" | "normal" | "high") { return updateTicket(id, { priority }); }

export async function updatePromotion(id: string, patch: { status?: "planned" | "terms_published" | "open" | "paused" | "closed"; reward_amount?: number | null; approved_budget?: number | null; max_qualifying_users?: number | null; starts_at?: string | null; ends_at?: string | null; eligibility_rules?: string | null; geographic_restrictions?: string | null; required_disclosures?: string | null; terms_url?: string | null }) {
  const { supabase, user } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid id." };
  if (patch.status === "open") {
    const { data: p } = await supabase.from("promotions").select("approved_budget,terms_url,required_disclosures").eq("id", id).single();
    if (!p?.approved_budget || !p?.terms_url || !p?.required_disclosures) return { error: "A promotion can only open with an approved budget, published terms URL and required disclosures on record." };
  }
  const { error } = await supabase.from("promotions").update({ ...patch, updated_by: user.id }).eq("id", id);
  await audit(supabase, user.id, "promotion.update", "promotion", id, patch, error ? "error" : "ok");
  if (error) return { error: "Update failed." };
  revalidatePath("/admin/promotions"); return { ok: true };
}
