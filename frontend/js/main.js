gsap.registerPlugin(ScrollTrigger);

// Force semua reveal langsung visible dulu
// baru GSAP yang animasiin
ScrollTrigger.defaults({
  toggleActions: "play none none none"
});

// ── HERO ─────────────────────────────────────────────────
gsap.from(".hero-bg-text", {
  opacity: 0, scale: 1.2, duration: 2, ease: "power2.out"
});

gsap.from(".red-line", {
  width: 0, duration: 1, delay: 0.3, ease: "power2.out"
});

gsap.from(".hero-title", {
  y: 60, opacity: 0, duration: 1, delay: 0.5, ease: "power3.out"
});

gsap.from(".hero-sub", {
  y: 20, opacity: 0, duration: 0.8, delay: 0.8, ease: "power2.out"
});

gsap.from("#fighter-left", {
  x: -150, opacity: 0, duration: 1.2, delay: 1, ease: "power3.out"
});

gsap.from("#fighter-right", {
  x: 150, opacity: 0, duration: 1.2, delay: 1, ease: "power3.out"
});

gsap.from(".ground-line", {
  scaleX: 0, duration: 1, delay: 1.5, ease: "power2.out"
});

gsap.from(".scroll-hint", {
  y: 10, opacity: 0, duration: 0.8, delay: 1.8, ease: "power2.out"
});

// ── IDLE ANIMATION ────────────────────────────────────────
gsap.to("#fighter-left", {
  y: -8, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2
});

gsap.to("#fighter-right", {
  y: -8, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.3
});

// ── PARALLAX SCROLL ───────────────────────────────────────
gsap.to("#fighter-left", {
  x: -30,
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

gsap.to("#fighter-right", {
  x: 30,
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

gsap.to(".hero-bg-text", {
  y: 100,
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

// ── REVEAL SCROLL ─────────────────────────────────────────
// Pakai GSAP bukan IntersectionObserver biar konsisten
gsap.utils.toArray(".reveal").forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
    }
  });
});

// ── BELT BADGE ────────────────────────────────────────────
gsap.from(".belt-badge", {
  y: 20,
  opacity: 0,
  stagger: 0.1,
  duration: 0.6,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".belt-row",
    start: "top 85%",
  }
});

// ── FEATURE CARD ──────────────────────────────────────────
gsap.from(".feature-card", {
  y: 30,
  opacity: 0,
  stagger: 0.1,
  duration: 0.6,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".feature-grid",
    start: "top 85%",
  }
});

// ── CTA BUTTON ────────────────────────────────────────────
gsap.from(".cta-btn", {
  scale: 0.8,
  opacity: 0,
  duration: 0.8,
  ease: "back.out(1.7)",
  scrollTrigger: {
    trigger: "#cta",
    start: "top 85%",
  }
});

// ── BELT BADGE KLIK ───────────────────────────────────────
document.querySelectorAll(".belt-badge").forEach(badge => {
  badge.addEventListener("click", () => {
    document.querySelectorAll(".belt-badge").forEach(b => b.classList.remove("active"));
    badge.classList.add("active");
    gsap.from(badge, { scale: 0.8, duration: 0.3, ease: "back.out(2)" });
  });
});