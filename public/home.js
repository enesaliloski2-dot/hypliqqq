
(() => {
"use strict";
document.documentElement.classList.add("js");
const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
let tT; const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tT); tT = setTimeout(() => t.classList.remove("show"), 2400); };

/* Nav */
const nav = $("#nav"), tg = $("#navToggle");
tg.addEventListener("click", () => { const o = nav.dataset.open !== "true"; nav.dataset.open = String(o); tg.setAttribute("aria-expanded", String(o)); tg.setAttribute("aria-label", o ? "Close menu" : "Open menu"); });
$$("#navMobile a").forEach(a => a.addEventListener("click", () => { nav.dataset.open = "false"; tg.setAttribute("aria-expanded", "false"); }));
document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.dataset.open === "true") tg.click(); });
const links = $$(".nav-links a"), secs = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const nio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach(s => nio.observe(s));
}

/* Reveal: fade-up once; content is always visible without JS or with reduced motion */
const rv = $$(".reveal");
if (RM || !("IntersectionObserver" in window)) rv.forEach(el => el.classList.add("in"));
else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" }); rv.forEach(el => io.observe(el)); }
setTimeout(() => rv.forEach(el => el.classList.add("in")), 4000); // safety net

/* Card viewer: crossfade between the two original photographs */
const imgF = $("#imgFront"), imgB = $("#imgBack"), showCard = $("#showCard");
$$(".seg button").forEach(b => b.addEventListener("click", () => {
  const back = b.dataset.side === "back";
  imgF.classList.toggle("on", !back); imgB.classList.toggle("on", back);
  showCard.setAttribute("aria-label", back ? "Card concept, back side: magnetic stripe, holographic signature panel, security code area and world map" : "Card concept, front side");
  $$(".seg button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
}));

/* Cursor tilt, max ~5°, desktop pointers only; the artwork itself is never altered */
if (!RM && matchMedia("(pointer:fine)").matches) $$(".tilt").forEach(card => {
  const zone = card.closest(".visual, .frame") || card.parentElement; let raf;
  zone.addEventListener("pointermove", e => { const r = zone.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { card.style.transform = `perspective(1400px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`; card.style.setProperty("--lx", `${120 - (px + .5) * 160}%`); }); });
  zone.addEventListener("pointerleave", () => { card.style.transform = ""; card.style.removeProperty("--lx"); });
});
/* Entrance: rise, fade, settle, then float */
const he = $("#heroEnter"); if (he) { if (RM) he.classList.add("in"); else requestAnimationFrame(() => setTimeout(() => he.classList.add("in"), 120)); setTimeout(() => he.classList.add("in"), 3000); }

/* Founding 100 details */
const fm = $("#foundingMore"), fd = $("#foundingDetails");
if (fm && fd) fm.addEventListener("click", () => { const open = fd.hidden; fd.hidden = !open; fm.setAttribute("aria-expanded", String(open)); fm.textContent = open ? "Hide details" : "Promotion details"; });

/* Account links. In the deployed app these are relative routes and just work.
   On the static preview, APP_BASE_URL points them at the deployed app; if it is empty,
   accounts aren't available yet, so say so and offer early access instead of a dead link. */
const APP_BASE_URL = "";
$$("[data-app]").forEach(a => {
  const route = a.getAttribute("href");
  if (document.body.dataset.app === "next") return;                        // served by the Next.js app
  if (APP_BASE_URL) { a.setAttribute("href", APP_BASE_URL.replace(/\/$/, "") + route); return; }
  a.addEventListener("click", e => { e.preventDefault(); toast("Accounts open when the app is deployed. Join early access and we'll let you know."); $("#access")?.scrollIntoView({ behavior: RM ? "auto" : "smooth" }); $("#wlEmail")?.focus({ preventScroll: true }); });
});

/* Footer disclosure links open their panel */
const openHash = () => { const el = location.hash && $(location.hash); if (el && el.tagName === "DETAILS") el.open = true; };
addEventListener("hashchange", openHash); openHash();

/* Waitlist — set WAITLIST_ENDPOINT to a POST route that validates server-side, checks the
   honeypot "website" field, rate-limits, stores {email, consent, consentAt, source} and
   sends a double-opt-in email. Empty = preview mode, nothing stored. */
const WAITLIST_ENDPOINT = "";
const form = $("#wlForm"), email = $("#wlEmail"), consent = $("#wlConsent"), err = $("#wlErr"), done = $("#wlDone"), btn = $("#wlSubmit");
form.addEventListener("submit", async e => {
  e.preventDefault(); err.textContent = "";
  const v = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { err.textContent = "Enter a valid email address."; email.focus(); return; }
  if (!consent.checked) { err.textContent = "Tick the box to confirm you'd like early-access updates."; consent.focus(); return; }
  if (form.website && form.website.value) return;
  btn.disabled = true;
  try {
    if (WAITLIST_ENDPOINT) { const r = await fetch(WAITLIST_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: v, consent: true, consentAt: new Date().toISOString(), source: "hlcard-landing" }) }); if (!r.ok) throw new Error(); }
    else { await new Promise(r => setTimeout(r, 500)); done.querySelector("p").insertAdjacentHTML("beforeend", " <em>Preview mode: no backend endpoint is configured, so this submission wasn't stored.</em>"); }
    form.dataset.state = "done"; done.dataset.state = "done";
    try { localStorage.setItem("hlcard:waitlist", "1"); } catch (_) {}
  } catch (_) { err.textContent = "Couldn't reach the early-access service. Check your connection and try again."; btn.disabled = false; }
});
email.addEventListener("input", () => err.textContent = "");
})();
