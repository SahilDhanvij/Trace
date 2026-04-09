"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  MapPin, Route, Camera, Lock, Globe2, Plane, ImageIcon, Compass,
  BarChart3, Search, Users, ArrowRight, ChevronRight,
} from "lucide-react";

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Shared components ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function GoldRule() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent" />;
}

// ── Globe (hero background) ───────────────────────────────────────────────────
function HeroGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltX = useRef(0);
  const tiltY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const glowOpacity = useRef(0);
  const targetGlow = useRef(0);
  const scale = useRef(1);
  const targetScale = useRef(1);
  const frameId = useRef(0);

  const animate = useCallback(() => {
    tiltX.current += (targetX.current - tiltX.current) * 0.06;
    tiltY.current += (targetY.current - tiltY.current) * 0.06;
    glowOpacity.current += (targetGlow.current - glowOpacity.current) * 0.08;
    scale.current += (targetScale.current - scale.current) * 0.07;
    const el = wrapRef.current;
    if (el) {
      el.style.transform = `translate(-50%, -50%) perspective(1200px) rotateX(${tiltX.current}deg) rotateY(${tiltY.current}deg) scale(${scale.current})`;
      el.querySelectorAll<HTMLDivElement>("[data-glow]").forEach((g) => {
        g.style.opacity = String(glowOpacity.current);
      });
    }
    frameId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    frameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId.current);
  }, [animate]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    targetY.current = dx * 12;
    targetX.current = -dy * 10;
    targetGlow.current = 0.5 + Math.sqrt(dx * dx + dy * dy) * 0.35;
    targetScale.current = 1.04;
  }, []);

  const handleLeave = useCallback(() => {
    targetX.current = 0;
    targetY.current = 0;
    targetGlow.current = 0;
    targetScale.current = 1;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div
        ref={wrapRef}
        className="absolute will-change-transform"
        style={{ top: "50%", left: "50%", width: "max(100vw, 100vh)", height: "max(100vw, 100vh)", transform: "translate(-50%, -50%)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.07)_0%,transparent_60%)] pointer-events-none animate-[globe-breathe_6s_ease-in-out_infinite]" />
        <div data-glow className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.04) 30%, transparent 60%)", opacity: 0, filter: "blur(30px)" }} />
        <NextImage src="/hero-globe.png" alt="" fill className="object-contain pointer-events-none select-none" priority draggable={false} />
        <div data-glow className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 40% 35%, rgba(212,175,55,0.1) 0%, transparent 40%)", opacity: 0 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HERO  (awe + curiosity)
// ═══════════════════════════════════════════════════════════════════════════════
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <section className="group/hero relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-45 transition-opacity duration-700 group-hover/hero:opacity-80">
        <HeroGlobe />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050508_68%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#050508]/80 to-transparent pointer-events-none" />

      <nav className="relative z-20 flex items-center justify-between px-8 md:px-16 py-8 pointer-events-auto">
        <Link href="/" className="text-lg font-serif italic tracking-tighter text-white">Trace</Link>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-sm uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors duration-300">
            Login
          </Link>
          <Link href="/login?mode=join" className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20">
            Join
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 -mt-16">
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s" }}>
          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.05] tracking-tight mb-6" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5)" }}>
            Your life,{" "}<span className="hero-title-gold">mapped.</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg tracking-wide max-w-md mx-auto mb-10 leading-relaxed" style={{ textShadow: "0 2px 15px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.7)" }}>
            Every place you&apos;ve been. Every memory you made.<br />All in one private, living map.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Link href="/map" className="group relative px-8 py-4 rounded-full bg-[#D4AF37] text-black text-sm font-bold uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <span className="relative z-10">Reveal my map</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e5c44a] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link href="/login?mode=join" className="px-8 py-4 rounded-full border border-white/20 text-white text-sm uppercase tracking-[0.15em] hover:border-[#D4AF37]/40 hover:text-[#D4AF37]/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] transition-all duration-300" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              Get started
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: mounted ? 0.35 : 0, transition: "opacity 1s ease 1.5s" }}>
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. POSITIONING  (recognition — "that's me")
// ═══════════════════════════════════════════════════════════════════════════════
function PositioningSection() {
  return (
    <section className="py-28 md:py-36 px-6 md:px-16 max-w-3xl mx-auto text-center">
      <FadeIn>
        <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-10">
          Not a feed. Not a pinboard.<br />
          <span className="text-[#D4AF37] italic">A map of your life.</span>
        </h2>
      </FadeIn>
      <FadeIn delay={0.15}>
        <div className="text-base md:text-lg text-white/40 leading-relaxed max-w-xl mx-auto space-y-5">
          <p>Your travel history is scattered — photos buried in your camera roll, places saved across half a dozen apps, memories quietly fading.</p>
          <p className="text-white/70 font-medium">A single, visual record of everywhere you&apos;ve been — built on a globe, not a feed.</p>
        </div>
      </FadeIn>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. EMOTIONAL HIT  (identity — "damn, this is me")
// ═══════════════════════════════════════════════════════════════════════════════
function EmotionalHitSection() {
  const { ref, visible } = useInView(0.3);

  return (
    <section ref={ref} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-6">
      {/* Dimmed globe background */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <NextImage src="/hero-globe.png" alt="" fill className="object-contain" draggable={false} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#050508_65%)] pointer-events-none" />

      <div className={`relative max-w-2xl mx-auto text-center space-y-6 ${visible ? "emo-visible" : ""}`}>
        <p className="emo-line text-2xl md:text-4xl font-serif italic text-white/80 leading-snug">
          You&apos;ve crossed oceans.
        </p>
        <p className="emo-line text-2xl md:text-4xl font-serif italic text-white/80 leading-snug">
          Wandered cities at 3&nbsp;am.
        </p>
        <p className="emo-line text-2xl md:text-4xl font-serif italic text-white/80 leading-snug">
          Watched sunsets you&apos;ll never see again.
        </p>
        <p className="emo-line text-xl md:text-2xl text-[#D4AF37]/80 pt-6 font-medium tracking-wide">
          Every one of those moments happened somewhere.
        </p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CORE EXPERIENCE  (desire — "I want this")
// ═══════════════════════════════════════════════════════════════════════════════
const CORE_POINTS = [
  { icon: MapPin, title: "Pin your world", desc: "Drop a pin. It\u2019s yours forever." },
  { icon: Route, title: "Connect the dots", desc: "Watch arcs trace the distance you\u2019ve covered." },
  { icon: Camera, title: "Unlock a moment", desc: "Tap any place. Your photos, your story." },
];

function CoreExperienceSection() {
  return (
    <section className="relative py-32 px-6 md:px-16 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <FadeIn>
          <div className="relative aspect-[4/5] max-w-sm mx-auto md:mx-0 group overflow-hidden rounded-sm">
            <div className="absolute inset-0 border border-white/[0.06] rounded-sm z-10 pointer-events-none" />
            <NextImage src="/hero-mountain.png" alt="Explorer on a mountain peak" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </FadeIn>

        <div className="space-y-10">
          <FadeIn delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-3">
              Relive your world.
            </h2>
            <p className="text-base text-white/40 leading-relaxed">
              Every city you visit becomes part of your story — connected, visual, and alive.
            </p>
          </FadeIn>
          <div className="space-y-8">
            {CORE_POINTS.map((f, i) => (
              <FadeIn key={f.title} delay={0.15 + i * 0.1}>
                <div className="flex gap-4 group/item">
                  <div className="shrink-0 w-9 h-9 flex items-center justify-center border border-[#D4AF37]/20 rounded-sm mt-0.5 transition-all duration-300 group-hover/item:border-[#D4AF37]/50 group-hover/item:shadow-[0_0_12px_rgba(212,175,55,0.1)]">
                    <f.icon className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-white/90 mb-1 group-hover/item:text-white transition-colors">{f.title}</div>
                    <div className="text-sm text-white/35 leading-relaxed group-hover/item:text-white/50 transition-colors">{f.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. OUTCOMES  (confidence — "this is real")
// ═══════════════════════════════════════════════════════════════════════════════
const OUTCOMES = [
  { icon: Globe2, title: "See your life from above", desc: "Not a list. A living, breathing globe that shows everywhere you\u2019ve been." },
  { icon: Plane, title: "Never lose the thread", desc: "Every trip connects to the last. Your story stays whole." },
  { icon: ImageIcon, title: "Every photo finds its place", desc: "No more scrolling through camera rolls. Each memory belongs to a location." },
  { icon: Lock, title: "Yours alone. Always.", desc: "No likes. No followers. No algorithms. Just you and your map." },
];

function OutcomesSection() {
  return (
    <section className="py-32 px-6 md:px-16 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {OUTCOMES.map((o, i) => {
          const isEven = i % 2 === 1;
          return (
            <FadeIn key={o.title} delay={i * 0.1}>
              <div className="relative p-8 md:p-10 border border-white/[0.05] group transition-all duration-500 hover:border-[#D4AF37]/15 hover:bg-[#D4AF37]/[0.015]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className={`relative flex gap-5 ${isEven ? "flex-row-reverse text-right" : ""}`}>
                  <div className="shrink-0 w-11 h-11 flex items-center justify-center border border-white/10 rounded-full transition-all duration-500 group-hover:border-[#D4AF37]/30 group-hover:shadow-[0_0_14px_rgba(212,175,55,0.1)]">
                    <o.icon className="w-5 h-5 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white/80 mb-2 group-hover:text-white transition-colors duration-300">{o.title}</div>
                    <div className="text-sm text-white/30 leading-relaxed group-hover:text-white/45 transition-colors duration-300">{o.desc}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. STEPS  (ease — "I can do this right now")
// ═══════════════════════════════════════════════════════════════════════════════
const STEPS = [
  { n: "1", title: "Set your home city", desc: "Your journey begins here." },
  { n: "2", title: "Add places you\u2019ve visited", desc: "Watch your map come alive." },
  { n: "3", title: "Upload memories", desc: "Each place becomes a story." },
];

function StepsSection() {
  const { ref, visible } = useInView(0.2);

  return (
    <section className="py-32 px-6 md:px-16 max-w-4xl mx-auto">
      <FadeIn>
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">Start in seconds.</h2>
        </div>
      </FadeIn>

      <div ref={ref} className={`relative ${visible ? "timeline-visible" : ""}`}>
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[22px] left-[calc(16.67%+22px)] right-[calc(16.67%+22px)] h-px">
          <div className="timeline-line w-full h-full bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37]/20 to-[#D4AF37]/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={0.2 + i * 0.15}>
              <div className="flex flex-col items-center text-center px-6">
                <div className="relative z-10 w-11 h-11 flex items-center justify-center rounded-full border border-white/15 bg-[#050508] text-white/40 text-sm font-mono mb-6 transition-all duration-500 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] hover:shadow-[0_0_18px_rgba(212,175,55,0.12)]">
                  {s.n}
                </div>
                <div className="text-base font-semibold text-white/80 mb-2">{s.title}</div>
                <div className="text-sm text-white/30 leading-relaxed max-w-[180px]">{s.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. PRIVACY  (trust — "I feel safe")
// ═══════════════════════════════════════════════════════════════════════════════
function PrivacySection() {
  return (
    <section className="py-36 md:py-44 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_60%)] pointer-events-none" />
      <FadeIn>
        <h2 className="text-4xl md:text-6xl font-serif font-bold italic mb-8 max-w-lg mx-auto leading-tight">
          Built for you —<br />not an audience.
        </h2>
        <p className="text-base md:text-lg text-white/40 max-w-md mx-auto leading-relaxed">
          No performance. No pressure. No algorithms deciding what matters.<br />
          <span className="text-white/60">Your memories stay yours.</span>
        </p>
      </FadeIn>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. DIFFERENTIATION  (conviction — "nothing else does this")
// ═══════════════════════════════════════════════════════════════════════════════
function DifferentiationSection() {
  const { ref, visible } = useInView(0.3);

  return (
    <section ref={ref} className="py-32 md:py-40 px-6 md:px-16 max-w-3xl mx-auto text-center">
      <FadeIn>
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-14">
          Everything else got it wrong.
        </h2>
      </FadeIn>

      <div className={`text-lg md:text-xl text-white/50 leading-relaxed space-y-5 ${visible ? "diff-visible" : ""}`}>
        <p>
          <span className="strike-word text-white/70">Social apps</span>{" "}
          turned travel into performance.
        </p>
        <p>
          <span className="strike-word text-white/70">Maps</span>{" "}
          store locations, not memories.
        </p>
        <p>
          <span className="strike-word text-white/70">Journals</span>{" "}
          capture moments, but not movement.
        </p>
        <FadeIn delay={0.6}>
          <p className="text-[#D4AF37] font-medium pt-4 text-xl md:text-2xl">
            Trace connects all three — without the noise.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. FUTURE VISION  (excitement — "this is going somewhere")
// ═══════════════════════════════════════════════════════════════════════════════
const UPCOMING = [
  { icon: Compass, title: "Hidden Gems", desc: "Discover the quiet, overlooked spots that actually make a place special." },
  { icon: BarChart3, title: "Your Travel Dashboard", desc: "Cities, countries, distance — see your journey in numbers." },
  { icon: Search, title: "Smarter Discovery", desc: "Find the best places in any city, surfaced by real experiences." },
  { icon: Users, title: "Follow Explorers", desc: "See the world through people who travel like you." },
];

function FutureVisionSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Dashboard mockup background */}
      <div className="absolute inset-0 pointer-events-none">
        <NextImage src="/future-vision.png" alt="" fill className="object-cover object-center" draggable={false} />
        <div className="absolute inset-0 bg-[#050508]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508]" />
      </div>

      <div className="relative px-6 md:px-16 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#D4AF37]/40 mb-4">The next layer</div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Where this is going.</h2>
            <p className="text-sm text-white/40 max-w-xs mx-auto">Your map is just the beginning.</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
          {UPCOMING.map((u, i) => (
            <FadeIn key={u.title} delay={i * 0.08}>
              <div className="relative p-8 bg-[#050508]/50 backdrop-blur-sm border border-white/[0.04] group transition-all duration-500 hover:bg-[#050508]/70 hover:border-[#D4AF37]/10">
                <div className="flex gap-4">
                  <div className="shrink-0 w-9 h-9 flex items-center justify-center border border-white/[0.08] rounded-full transition-all duration-500 group-hover:border-[#D4AF37]/25">
                    <u.icon className="w-4 h-4 text-white/25 group-hover:text-[#D4AF37]/70 transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/70 mb-1 group-hover:text-white/90 transition-colors duration-300">{u.title}</div>
                    <div className="text-sm text-white/30 leading-relaxed group-hover:text-white/45 transition-colors duration-300">{u.desc}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <div className="text-center mt-10">
            <Link href="/roadmap" className="inline-flex items-center gap-2 text-sm text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors duration-300 group/link">
              Explore what&apos;s next
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. FINAL CTA  (action — "I'm in")
// ═══════════════════════════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section className="relative py-40 px-6 text-center overflow-hidden">
      {/* Globe callback — bookends with hero */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <NextImage src="/hero-globe.png" alt="" fill className="object-contain" draggable={false} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#050508_60%)] pointer-events-none" />

      <FadeIn>
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-5 max-w-xl mx-auto">
            You&apos;ve been more places than you remember.
          </h2>
          <p className="text-base text-white/40 mb-12">Your world is waiting.</p>
          <Link href="/login?mode=join" className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#D4AF37] text-black text-sm font-bold uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]">
            <span className="relative z-10">Reveal your map</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e5c44a] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10 px-8 md:px-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          {["Privacy", "Terms", "Contact"].map((item) => (
            <a key={item} href="#" className="text-xs uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors">{item}</a>
          ))}
        </div>
        <p className="text-xs tracking-[0.15em] text-white/15">
          <span className="font-serif italic">Trace</span> — Your life, mapped.
        </p>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      <div className="grain" />

      {/* 1. Awe */}
      <Hero />
      <GoldRule />

      {/* 2. Recognition */}
      <PositioningSection />
      <GoldRule />

      {/* 3. Identity */}
      <EmotionalHitSection />
      <GoldRule />

      {/* 4. Desire */}
      <CoreExperienceSection />
      <GoldRule />

      {/* 5. Confidence */}
      <OutcomesSection />
      <GoldRule />

      {/* 7. Ease */}
      <StepsSection />
      <GoldRule />

      {/* 8. Trust */}
      <PrivacySection />
      <GoldRule />

      {/* 9. Conviction */}
      <DifferentiationSection />
      <GoldRule />

      {/* 10. Excitement */}
      <FutureVisionSection />
      <GoldRule />

      {/* 11. Action */}
      <CTASection />

      <Footer />
    </main>
  );
}
