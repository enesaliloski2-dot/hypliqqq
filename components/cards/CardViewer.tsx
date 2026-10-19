"use client";
import { useEffect, useRef, useState } from "react";

/* Presents the two official card images. Tilt ≤5°, a light sweep masked to the card's alpha,
   and a crossfade between sides. The artwork itself is never redrawn or recolored. */
export function CardViewer({ side: initial = "front", controls = true, size = 520, label }: { side?: "front" | "back"; controls?: boolean; size?: number; label?: string }) {
  const [side, setSide] = useState<"front" | "back">(initial);
  const [entered, setEntered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setEntered(true), rm ? 0 : 120);
    const z = zone.current, c = ref.current;
    if (!z || !c || rm || !matchMedia("(pointer:fine)").matches) return () => clearTimeout(t);
    let raf = 0;
    const move = (e: PointerEvent) => { const r = z.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { c.style.transform = `perspective(1400px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`; c.style.setProperty("--lx", `${120 - (px + .5) * 160}%`); }); };
    const leave = () => { c.style.transform = ""; c.style.removeProperty("--lx"); };
    z.addEventListener("pointermove", move); z.addEventListener("pointerleave", leave);
    return () => { clearTimeout(t); z.removeEventListener("pointermove", move); z.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <div ref={zone} className={`enter ${entered ? "in" : ""}`} style={{ width: "100%", maxWidth: size }}>
        <div className="float">
          <div ref={ref} className="ncard" role="img" aria-label={label ?? (side === "front" ? "Card, front side" : "Card, back side")}>
            <div className={`side front ${side === "front" ? "on" : ""}`} />
            <div className={`side back ${side === "back" ? "on" : ""}`} />
          </div>
        </div>
      </div>
      {controls && (
        <div className="seg" role="group" aria-label="Card side">
          <button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")}>Front</button>
          <button type="button" aria-pressed={side === "back"} onClick={() => setSide("back")}>Back</button>
        </div>
      )}
    </div>
  );
}
