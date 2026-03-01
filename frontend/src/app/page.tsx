"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ChevronRight, Shield, MapPin, Compass, Globe, History, Sparkles, Mountain, Eye, TrendingUp, Lock, Palmtree, Award, Navigation } from "lucide-react";
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

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col items-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#D4AF37]/30 transition-colors group"
  >
    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-[#D4AF37]" />
    </div>
    <span className="text-4xl md:text-5xl font-serif italic mb-2">{value}</span>
    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</span>
  </motion.div>
);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 2 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/60">Invite only beta now open</span>
          </motion.div>

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

      {/* Stats — Global Footprint */}
      <section className="relative py-48 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-sm uppercase tracking-[0.4em] text-[#D4AF37] font-medium">Global Footprint</h2>
            <p className="text-3xl md:text-5xl font-serif italic">The world, as seen by Trace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={Globe} label="Countries Traced" value="142" />
            <StatCard icon={History} label="Miles Remembered" value="8.4M" />
            <StatCard icon={MapPin} label="Hidden Gems Found" value="12,402" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 p-12 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] text-center"
          >
            <p className="text-white/40 text-sm font-light italic max-w-xl mx-auto leading-relaxed">
              &ldquo;Trace isn&apos;t just a map. It&apos;s a way to see the threads of my life woven across the planet.
              I finally feel like I&apos;m not just visiting places, but keeping them.&rdquo;
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">A frequent explorer</span>
              <div className="w-8 h-px bg-white/10" />
            </div>
          </motion.div>
        </div>
      </section>

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

            {/* Rank progress */}
            <div className="border-t border-white/[0.05] px-6 py-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/25">Explorer &rarr; Globetrotter</span>
                  <span className="text-[9px] text-white/20">24 / 50 cities</span>
                </div>
                <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "48%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Achievement badges */}
            <div className="border-t border-white/[0.05] px-6 py-4">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3">Badges Earned</div>
              <div className="flex items-center gap-3">
                {[
                  { icon: MapPin, label: "10 Cities", earned: true },
                  { icon: Globe, label: "5 Countries", earned: true },
                  { icon: Palmtree, label: "Island Hop", earned: true },
                  { icon: Mountain, label: "Peak Seeker", earned: false },
                  { icon: Navigation, label: "Equator Cross", earned: false },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className={`relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border ${
                      badge.earned
                        ? "border-[#D4AF37]/20 bg-[#D4AF37]/[0.06]"
                        : "border-white/[0.04] bg-white/[0.01] opacity-35"
                    } flex-1 min-w-0`}
                  >
                    <badge.icon className={`w-3.5 h-3.5 ${badge.earned ? "text-[#D4AF37]" : "text-white/30"}`} />
                    <span className={`text-[7px] uppercase tracking-[0.1em] text-center leading-tight ${badge.earned ? "text-[#D4AF37]/70" : "text-white/20"}`}>
                      {badge.label}
                    </span>
                    {!badge.earned && (
                      <Lock className="absolute top-1 right-1 w-2 h-2 text-white/15" />
                    )}
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

      {/* Hidden Gems */}
      <section className="py-48 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,#D4AF3706_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/15 bg-[#D4AF37]/5">
                <Mountain className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">Hidden Gems</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif italic">Discovered by explorers like you.</h2>
              <p className="text-white/40 text-sm max-w-md leading-relaxed">The best travel stories come from places nobody told you about. See what the community has uncovered.</p>
            </div>
            <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white transition-colors whitespace-nowrap flex items-center gap-2 group">
              Explore all gems
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                img: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80",
                place: "Hallstatt",
                country: "Austria",
                tag: "Lakeside village frozen in time",
                by: "explorer_anna",
              },
              {
                img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
                place: "Chefchaouen",
                country: "Morocco",
                tag: "The blue pearl of the Rif Mountains",
                by: "wanderer_kai",
              },
              {
                img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
                place: "Lofoten Islands",
                country: "Norway",
                tag: "Arctic beauty above the circle",
                by: "north_seeker",
              },
            ].map((gem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden mb-5">
                  <img
                    src={gem.img}
                    alt={gem.place}
                    className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3 h-3 text-[#D4AF37]" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">Hidden Gem</span>
                    </div>
                    <h3 className="text-2xl font-serif italic">{gem.place}</h3>
                    <p className="text-white/50 text-xs mt-1">{gem.country}</p>
                  </div>
                </div>
                <p className="text-white/40 text-sm font-light italic leading-relaxed mb-2">&ldquo;{gem.tag}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30" />
                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">@{gem.by}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Memory, Not Metrics */}
      <section className="py-48 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,#D4AF3708_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="text-5xl md:text-7xl font-serif italic mb-10 leading-tight">
              Travel fades.<br />Memory shouldn&apos;t.
            </h2>
            <p className="text-xl text-white/50 font-light leading-relaxed mb-12">
              Photos get buried in a cloud. Notes disappear in old journals.
              Trace keeps each place alive — privately, beautifully, and in context.
            </p>
            <div className="space-y-6">
              {[
                "Automatic path generation",
                "Atmospheric time-of-day rendering",
                "Encrypted, offline-first storage",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span className="text-sm font-light tracking-wide">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative aspect-square flex items-center justify-center">
            <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-12 border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#D4AF37] rounded-full"
                  style={{ transform: `rotate(${i * 45}deg) translateY(-180px)` }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent backdrop-blur-2xl border border-[#D4AF37]/30 flex items-center justify-center">
                <Compass className="text-[#D4AF37] w-10 h-10 animate-pulse" />
              </div>
            </motion.div>
          </div>
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

      {/* 5. The Tease */}
      <section className="py-64 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="max-w-3xl mx-auto space-y-12 relative z-10"
        >
          <h2 className="text-5xl md:text-8xl font-serif italic tracking-tighter">
            There&apos;s a reason we don&apos;t show it here.
          </h2>
          <p className="text-xl md:text-3xl text-white/50 font-light leading-relaxed italic">
            &ldquo;Some things only make sense when they&apos;re yours.<br />
            Your map is one of them.&rdquo;
          </p>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto opacity-50" />
        </motion.div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-64 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="w-[1000px] h-[1000px] border border-[#D4AF37] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="relative z-10 space-y-16"
        >
          <h2 className="text-5xl md:text-8xl font-serif italic tracking-tighter">
            See your life<br />come together.
          </h2>

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
            <div className="space-y-2">
              <p className="text-white/40 text-sm font-light tracking-widest uppercase">Free • Private • Secure</p>
              <p className="text-white/20 text-[10px] uppercase tracking-widest">Takes less than a minute to start your journey</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/[0.05] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-2xl font-serif italic">Trace</div>
          <div className="flex gap-12">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors cursor-pointer">Contact</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">&copy; 2026 Trace. Your life, mapped.</p>
        </div>
      </footer>
    </div>
  );
}
