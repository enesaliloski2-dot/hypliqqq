"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  chain: z.enum(["evm", "solana"]), provider: z.string().min(1).max(60),
  address: z.string().min(20).max(120), network: z.string().min(1).max(60),
});
/* Stores only the public address the user approved in their wallet. Never keys, never signatures. */
export async function saveWalletConnection(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input); if (!parsed.success) return { error: "Invalid wallet details." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("wallet_connections").upsert(
    { user_id: user.id, ...parsed.data, is_active: true, last_connected_at: new Date().toISOString() }, { onConflict: "user_id,chain,address" });
  if (error) return { error: "Couldn't save the connection." };
  revalidatePath("/dashboard"); revalidatePath("/dashboard/wallets");
  return { ok: true };
}
export async function removeWalletConnection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wallet_connections").delete().eq("id", id); // RLS limits to own rows
  if (error) return { error: "Couldn't remove the wallet." };
  revalidatePath("/dashboard"); revalidatePath("/dashboard/wallets");
  return { ok: true };
}
