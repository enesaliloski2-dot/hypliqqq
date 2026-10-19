import { requireAdmin } from "@/lib/auth/require";
import { DesignViewer } from "./DesignViewer";
/* Owner-only review of the supplied branded mockups, byte-for-byte originals, plain <img>, no masks or effects.
   Admin-gated on purpose: these renders carry third-party marks and are not shown on public surfaces. */
export default async function DesignReview() {
  await requireAdmin();
  return (
    <>
      <section className="panel"><h3>Supplied concept mockups (originals)</h3><p className="faint">Rendered from <code>/public/api/concept/front.png</code> and <code>back.png</code>, unmodified copies of the uploaded files (hashes in <code>SHA256.txt</code>). Shown here for design review only; the public site uses mark-free artwork until brand authorization exists.</p></section>
      <DesignViewer />
    </>
  );
}
