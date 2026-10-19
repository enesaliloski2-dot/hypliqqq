/* Independent product identity: a text lockup, deliberately not a third-party logo. */
export function Wordmark({ height = 16, className = "" }: { height?: number; className?: string; white?: boolean }) {
  return <span className={`lockup ${className}`} style={{ fontSize: Math.round(height * .75) }} aria-label="Hyperliquid Card"><i aria-hidden="true" />Hyperliquid Card</span>;
}
export function Monogram({ height = 18, className = "" }: { height?: number; className?: string }) {
  return <span className={className} style={{ display: "inline-block", width: height, height, borderRadius: "50%", border: "3px solid var(--mint)" }} aria-label="Hyperliquid Card" />;
}
export function Orbit({ className = "", dot = "var(--mint)" }: { className?: string; dot?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 60 C 60 10, 140 90, 198 40" fill="none" stroke="currentColor" strokeWidth=".6" vectorEffect="non-scaling-stroke" />
      <circle cx="170" cy="48" r="1.6" fill={dot} />
    </svg>
  );
}
