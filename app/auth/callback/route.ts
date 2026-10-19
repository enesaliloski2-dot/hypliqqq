import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
/* Exchanges the one-time code from verification / reset emails for a session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}${next.startsWith("/dashboard") ? (next.includes("?") ? "&" : "?") + "verified=1" : ""}`);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
