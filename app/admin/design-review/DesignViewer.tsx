"use client";
import { useState } from "react";
export function DesignViewer() {
  const [side, setSide] = useState<"front" | "back">("front");
  return (
    <section className="panel" style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <div style={{ position: "relative", width: "min(900px,100%)", aspectRatio: "1448/1086" }}>
        <img src="/api/concept/front.png" alt="Supplied concept mockup, front" width={1448} height={1086} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: side === "front" ? 1 : 0, transition: "opacity .5s" }} />
        <img src="/api/concept/back.png" alt="Supplied concept mockup, back" width={1448} height={1086} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: side === "back" ? 1 : 0, transition: "opacity .5s" }} />
      </div>
      <div className="seg" role="group" aria-label="Side"><button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")}>Front</button><button type="button" aria-pressed={side === "back"} onClick={() => setSide("back")}>Back</button></div>
    </section>
  );
}
