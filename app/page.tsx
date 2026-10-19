import { readFile } from "node:fs/promises";
import path from "node:path";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import "./home.css";

/* The public site is the approved static page (independent concept), served verbatim so layout, copy and disclosures
   stay exactly as signed off. When a customer is signed in, account links point at their dashboard. */
export default async function Home() {
  let html = await readFile(path.join(process.cwd(), "content/home.html"), "utf8");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    html = html
      .replace(/href="\/login" data-app="login">Log In<\/a>/g, 'href="/dashboard" data-app="dashboard">Dashboard</a>')
      .replace(/href="\/signup" data-app="signup">Create Account/g, 'href="/dashboard" data-app="dashboard">Open your account')
      .replace(/href="\/signup" data-app="signup">Create Account <svg/, 'href="/dashboard" data-app="dashboard">Open your account <svg')
      .replace('href="/signup?next=%2Fdashboard%3Ffounding%3D1" data-app="founding"', 'href="/dashboard?founding=1" data-app="dashboard"');
  }
  return (
    <>
      <div data-app="next" dangerouslySetInnerHTML={{ __html: html }} />
      <Script id="home-mark" strategy="beforeInteractive">{`document.body.dataset.app="next"`}</Script>
      <Script src="/home.js" strategy="afterInteractive" />
    </>
  );
}
