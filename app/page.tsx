"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-aurora">
      {/* Faint grid texture behind everything */}
      <div className="pointer-events-none absolute inset-0 grid-fade" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Nav ─────────────────────────────────────────────── */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-glow rounded-full bg-accent-400 shadow-[0_0_16px_2px_rgba(56,189,248,0.7)]" />
            <span className="text-lg font-semibold tracking-tight">
              Hakim<span className="text-accent-400"> AI</span>
            </span>
          </div>
          <Link
            href="/hakim"
            className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-sand-50/90 transition hover:border-accent-400/60 hover:text-white"
          >
            Try Now
          </Link>
        </motion.nav>

        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="grid items-center gap-10 pb-20 pt-10 md:grid-cols-2 md:pt-20">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center rounded-full bg-accent-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400 ring-1 ring-inset ring-accent-400/30">
                Track 4 · Decision Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              The layer between
              <br />
              <span className="text-gradient">data and the decision.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-5 max-w-xl text-lg text-sand-50/65"
            >
              Meet <span className="font-semibold text-sand-50">Hakim AI</span> —
              your decision-making companion that turns fragmented city data into
              one clear, explainable answer, the moment it matters.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/hakim"
                className="group inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-night-950 shadow-[0_0_32px_-4px_rgba(14,165,233,0.7)] transition hover:bg-accent-400"
              >
                Try Hakim AI
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <a
                href="#track"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-sand-50/90 transition hover:border-white/30"
              >
                Learn more
              </a>
            </motion.div>
          </motion.div>

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute inset-0 -z-10 animate-glow rounded-[2rem] bg-accent-500/25 blur-3xl" />
            <div className="animate-float overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl ring-1 ring-white/5">
              <Image
                src="/hakim.png"
                alt="Hakim AI avatar"
                width={1024}
                height={683}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </section>

        {/* ── Problem / Solution ──────────────────────────────── */}
        <section id="track" className="scroll-mt-20 pb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-sand-50/40"
          >
            How can AI help decision-makers act?
          </motion.h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300/80">
                Problem
              </span>
              <p className="mt-4 text-xl leading-relaxed text-sand-50/85">
                The hardest part of city data isn&apos;t collecting it — it&apos;s
                getting a clear answer out of it at the moment a decision is made.
                Decision-makers drown in dashboards while the answer stays buried.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-accent-400/20 bg-accent-500/[0.06] p-8 backdrop-blur"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
                Solution
              </span>
              <p className="mt-4 text-xl leading-relaxed text-sand-50/85">
                <span className="font-semibold text-white">Hakim AI</span> — the
                intelligence layer between raw city data and the decision-maker.
                It turns fragmented datasets into one clear, explainable answer
                the instant a decision is made.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="border-t border-white/10 py-8 text-xs text-sand-50/40">
          Abu Dhabi AI PropTech Challenge — Building the Intelligence Layer for
          Land, Investment and Communities. Hosted by Cursor × eVoost AI at Hub71.
        </footer>
      </div>
    </main>
  );
}
