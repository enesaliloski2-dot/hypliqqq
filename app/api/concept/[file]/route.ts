import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth/require";

/* Serves the supplied branded mockups to administrators only. They live outside /public on purpose:
   anything in /public is world-readable on static hosts, and these carry third-party marks. */
const ALLOWED: Record<string, string> = { "front.png": "image/png", "back.png": "image/png", "logo-keyed.png": "image/png" };
export const dynamic = "force-dynamic";
export async function GET(_: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const type = ALLOWED[file]; if (!type) return new NextResponse("Not found", { status: 404 });
  const me = await getProfile();
  if (!me || me.profile.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const buf = await readFile(path.join(process.cwd(), "private/card-concept", file));
  return new NextResponse(buf, { headers: { "content-type": type, "cache-control": "private, no-store", "x-robots-tag": "noindex" } });
}
