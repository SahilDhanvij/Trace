"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ChevronRight, Shield, MapPin, Compass, Globe, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const PARTICLES = [
  { x: 12, y: 85, o: 0.17, dur: 7, del: 0.2 },
  { x: 34, y: 36, o: 0.33, dur: 12, del: 1.1 },
  { x: 20, y: 5, o: 0.19, dur: 9, del: 3.8 },
  { x: 39, y: 68, o: 0.06, dur: 14, del: 0.7 },
  { x: 59, y: 35, o: 0.22, dur: 6, del: 2.4 },
  { x: 33, y: 99, o: 0.29, dur: 11, del: 4.2 },
  { x: 61, y: 80, o: 0.28, dur: 8, del: 1.6 },
  { x: 17, y: 43, o: 0.12, dur: 13, del: 3.1 },
  { x: 69, y: 71, o: 0.05, dur: 7, del: 0.9 },
  { x: 55, y: 82, o: 0.40, dur: 10, del: 4.7 },
  { x: 16, y: 2, o: 0.30, dur: 15, del: 2.0 },
  { x: 48, y: 81, o: 0.44, dur: 6, del: 3.5 },
  { x: 84, y: 37, o: 0.47, dur: 12, del: 1.3 },
  { x: 31, y: 10, o: 0.22, dur: 9, del: 4.0 },
  { x: 83, y: 7, o: 0.16, dur: 14, del: 0.5 },
  { x: 3, y: 84, o: 0.31, dur: 8, del: 2.8 },
  { x: 26, y: 1, o: 0.10, dur: 11, del: 1.8 },
  { x: 66, y: 23, o: 0.03, dur: 7, del: 3.3 },
  { x: 10, y: 97, o: 0.39, dur: 13, del: 4.5 },
  { x: 91, y: 53, o: 0.43, dur: 10, del: 0.4 },
];

const AbstractBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,#1a1510_0%,transparent_70%)] opacity-40" />
      <svg className="w-full h-full opacity-30" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        {[...Array(5)].map((_, i) => (
          <motion.path
            key={i}
            d={`M -100 ${400 + i * 50} Q ${200 + i * 100} ${100 + i * 50} 500 500 T 1100 ${400 + i * 30}`}
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 - i * 0.05 }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
          />
        ))}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-[#D4AF37] rounded-full"
          initial={{
            x: p.x + "%",
            y: p.y + "%",
            opacity: p.o,
          }}
          animate={{
            y: [null, "-20%"],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "linear",
            delay: p.del,
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  return (
    <div className="relative bg-[#050505] text-white font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      <div className="grain" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference">
        <div className="text-xl font-serif italic tracking-tighter">Trace</div>
        <div className="flex gap-8 items-center">
          <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/login?mode=join" className="px-6 py-2 bg-white text-black rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#D4AF37] hover:text-white transition-all">
            Join
          </Link>
        </div>
      </nav>

      {/* 1. Hero */}
      <motion.section
        style={{ opacity, scale }}
        className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      >
        <AbstractBackground />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="z-10"
        >
          <h1 className="text-6xl md:text-[10rem] font-serif italic tracking-tighter leading-[0.85] mb-8">
            Your life,<br />mapped.
          </h1>
          <p className="text-lg md:text-2xl text-white/50 font-light tracking-wide mb-16 max-w-2xl mx-auto leading-relaxed">
            A private visual record of everywhere you&apos;ve been.<br />
            <span className="italic opacity-60">Beautifully preserved, forever yours.</span>
          </p>

          <div className="flex flex-col items-center gap-8">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-black rounded-full font-bold tracking-widest uppercase text-xs transition-all hover:bg-[#D4AF37] hover:text-white group flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]"
              >
                Reveal my map
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-px h-24 bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
        </motion.div>
      </motion.section>


      {/* Explorer Dashboard Preview */}
      <section className="py-36 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <h2 className="text-sm uppercase tracking-[0.4em] text-[#D4AF37] font-medium">Your Explorer Dashboard</h2>
            <p className="text-3xl md:text-5xl font-serif italic">See how far you&apos;ve come.</p>
          </div>

          {/* Dashboard mock panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm overflow-hidden"
          >
            {/* Profile header */}
            <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37]/40 to-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">A</div>
                <div>
                  <div className="text-sm font-medium">@alex_wanderer</div>
                  <div className="text-[10px] text-white/25">Mumbai, India</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/15">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[9px] uppercase tracking-[0.15em] text-[#D4AF37] font-medium">Explorer</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 divide-x divide-white/[0.05]">
              {[
                { val: "24", label: "Cities", icon: MapPin },
                { val: "9", label: "States", icon: TrendingUp },
                { val: "7", label: "Countries", icon: Globe },
                { val: "3", label: "Continents", icon: Compass },
              ].map((s, i) => (
                <div key={i} className="py-6 px-4 text-center">
                  <s.icon className="w-4 h-4 text-[#D4AF37]/50 mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-serif italic mb-1">{s.val}</div>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/25">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Recent cities */}
            <div className="border-t border-white/[0.05] px-6 py-4">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3">Recent Vaults</div>
              <div className="space-y-2">
                {[
                  { city: "Tokyo", days: "3d ago", photos: 12, unlocked: true },
                  { city: "Dubai", days: "2w ago", photos: 8, unlocked: true },
                  { city: "Paris", days: "1mo ago", photos: 15, unlocked: true },
                  { city: "Bangkok", days: "2mo ago", photos: 4, unlocked: false },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.unlocked ? "bg-[#D4AF37]" : "bg-white/15"}`} />
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors">{c.city}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-white/20">{c.photos} photos</span>
                      <span className="text-[10px] text-white/15">{c.days}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

          <p className="text-center text-white/20 text-[10px] uppercase tracking-[0.2em] mt-8">This is what your dashboard looks like inside Trace</p>
        </div>
      </section>

      {/* 2. The Promise */}
      <section className="py-48 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">
          {[
            { title: "One origin.", desc: "Everything starts from where you call home. The anchor for every journey you'll ever take." },
            { title: "Every place.", desc: "From the bustling streets of Tokyo to a quiet bench in Paris. Stored, remembered, never lost." },
            { title: "All connected.", desc: "Your journey isn't a series of dots. It's a single, beautiful story that only you can tell." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="text-4xl font-serif italic text-[#D4AF37] opacity-80">0{i + 1}</div>
              <h3 className="text-2xl font-serif italic">{item.title}</h3>
              <p className="text-white/40 font-light leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* 4. Private by Design */}
      <section className="py-48 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 mb-12">
            <Shield className="text-[#D4AF37] w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif italic mb-16">Private by Design</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { heading: "Zero Pressure", body: "No likes, no comments, no social feed. Just you and your memories." },
              { heading: "Total Control", body: "Your data is yours. Export it, delete it, or keep it forever. We never sell it." },
              { heading: "Invisible Sync", body: "Nothing is public unless you explicitly choose to share a snapshot." },
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <h4 className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold">{item.heading}</h4>
                <p className="text-white/50 font-light text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-64 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.05 + i * 0.02, 1], opacity: [0.03, 0.07, 0.03] }}
              transition={{ duration: 8 + i * 3, repeat: Infinity, delay: i * 1.5 }}
              className="absolute rounded-full border border-[#D4AF37]"
              style={{ width: 500 + i * 300, height: 500 + i * 300 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="relative z-10"
        >
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent mx-auto mb-16" />

          <p className="text-white/30 text-xs uppercase tracking-[0.3em] mb-8">Your globe is waiting</p>

          <h2 className="text-5xl md:text-8xl font-serif italic tracking-tighter mb-8">
            See your life<br />come together.
          </h2>

          <p className="text-lg text-white/30 font-light leading-relaxed max-w-lg mx-auto mb-16">
            Every journey you&apos;ve taken, every place you&apos;ve loved &mdash;
            rendered on a globe that belongs only to you.
          </p>

          <div className="flex flex-col items-center gap-8">
            <Link href="/login?mode=join">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(212,175,55,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-6 bg-[#D4AF37] text-white rounded-full font-bold tracking-[0.2em] uppercase text-xs shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all"
              >
                Create my map
              </motion.button>
            </Link>
            <p className="text-white/40 text-sm font-light tracking-widest uppercase">Free &middot; Private &middot; Secure</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/[0.05] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-2xl font-serif italic">Trace</div>
          <div className="flex gap-12">
            <Link href="/privacy" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Terms</Link>
            <a href="mailto:contact@trace.app" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">&copy; 2026 Trace. Your life, mapped.</p>
        </div>
      </footer>
    </div>
  );
}
