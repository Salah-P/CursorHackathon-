"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HakimPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-aurora px-6 text-center">
      <div className="pointer-events-none absolute inset-0 grid-fade" />

      <Link
        href="/"
        className="absolute left-6 top-6 rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-sand-50/90 transition hover:border-accent-400/60 hover:text-white"
      >
        ← Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative w-40 sm:w-48"
      >
        <div className="absolute inset-0 -z-10 animate-glow rounded-full bg-accent-500/30 blur-3xl" />
        <div className="animate-float overflow-hidden rounded-full border border-white/10 ring-1 ring-white/10">
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

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-8 text-4xl font-bold tracking-tight md:text-5xl"
      >
        Hakim<span className="text-accent-400"> AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-4 max-w-md text-lg text-sand-50/65"
      >
        Your decision intelligence companion is coming online. The full
        experience lands here next.
      </motion.p>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400 ring-1 ring-inset ring-accent-400/30"
      >
        <span className="h-2 w-2 animate-glow rounded-full bg-accent-400" />
        Coming soon
      </motion.span>
    </main>
  );
}
