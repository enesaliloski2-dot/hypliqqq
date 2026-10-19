import { readFile } from "node:fs/promises";
import path from "node:path";
import Script from "next/script";
import { requireAdmin } from "@/lib/auth/require";
import "../home.css";

/* Owner-only design preview: the public page with the supplied, unmodified branded mockups swapped in
   via the card CSS variables. Admin-gated and ribboned; the public route keeps the mark-free artwork. */
export default async function Preview() {
  await requireAdmin();
  let html = await readFile(path.join(process.cwd(), "content/home.html"), "utf8");
  // preview-only: the supplied logo (keyed from the uploaded JPG) in place of the independent lockup
  html = html
    .replace('<i aria-hidden="true"></i>Hyperliquid Card <small>Independent concept</small>', '<img src="/api/concept/logo-keyed.png" alt="Hyperliquid" style="height:22px;width:auto"> <small>Independent concept</small>')
    .replace('<span class="brand"><i aria-hidden="true"></i>Hyperliquid Card</span>', '<span class="brand"><img src="/api/concept/logo-keyed.png" alt="Hyperliquid" style="height:20px;width:auto"></span>');
  return (
    <>
      <style>{`:root{--card-front:url(/api/concept/front.png)!important;--card-back:url(/api/concept/back.png)!important}
        .spin-stage,.ncard{aspect-ratio:1448/1086!important}
        .preview-ribbon{position:fixed;left:0;right:0;bottom:0;z-index:70;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));background:#0A1412;border-top:1px solid #2A4A43;color:#F5FAF8;font-size:12.5px;text-align:center;letter-spacing:.04em}
        .preview-ribbon strong{color:#98FCE4;font-weight:600;letter-spacing:.12em;text-transform:uppercase;margin-right:10px}`}</style>
      <div data-app="next" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="preview-ribbon" role="note"><strong>Design preview</strong>Original supplied mockups with third-party marks · owner review only · not for publication</div>
      <Script id="home-mark" strategy="beforeInteractive">{`document.body.dataset.app="next"`}</Script>
      <Script src="/home.js" strategy="afterInteractive" />
    </>
  );
}
