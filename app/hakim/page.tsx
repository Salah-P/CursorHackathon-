"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { AnamClient } from "@anam-ai/js-sdk";

type Phase =
  | "loading"
  | "connecting"
  | "live"
  | "not_configured"
  | "error";

type Analysis = { answer: string; explanation?: string; source?: string };

const SAMPLE_QUESTIONS = [
  "Which district has the highest gross rental yield, and what is that yield?",
  "What is the average base sale price per square meter across all 20 districts?",
  "Rank the top 5 districts by infrastructure score.",
];

export default function HakimPage() {
  const clientRef = useRef<AnamClient | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [statusMsg, setStatusMsg] = useState("Waking Hakim up...");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [caption, setCaption] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [input, setInput] = useState("");

  // Browser handler for the analyze_dataset client tool: runs code_agent via
  // our API route and returns a grounded, sourced string back to the LLM.
  const runAnalysis = useCallback(async (query: string): Promise<string> => {
    setThinking(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/hakim/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        const msg =
          data.message || data.detail || "The analysis tool is unavailable.";
        return `I couldn't run the analysis: ${msg}`;
      }

      const answer = String(data.answer ?? "").trim();
      const explanation = String(data.explanation ?? "").trim();
      const source = String(data.source ?? "").trim();
      setAnalysis({ answer, explanation, source });

      const parts = [answer ? `Answer: ${answer}.` : "I analyzed the data."];
      if (explanation) parts.push(explanation);
      if (source) parts.push(`Source: ${source}.`);
      return parts.join(" ");
    } catch (err) {
      return `I couldn't reach the analysis service: ${
        err instanceof Error ? err.message : String(err)
      }`;
    } finally {
      setThinking(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let client: AnamClient | null = null;

    async function start() {
      try {
        const tokenRes = await fetch("/api/anam/session");
        if (tokenRes.status === 503) {
          if (!cancelled) setPhase("not_configured");
          return;
        }
        if (!tokenRes.ok) {
          const detail = await tokenRes.text();
          throw new Error(`Session token failed (${tokenRes.status}): ${detail}`);
        }
        const { sessionToken } = await tokenRes.json();
        if (cancelled) return;

        const { createClient, AnamEvent, MessageRole } = await import(
          "@anam-ai/js-sdk"
        );

        client = createClient(sessionToken);
        clientRef.current = client;

        client.registerToolCallHandler("analyze_dataset", {
          onStart: async (payload) => {
            const query = String(payload.arguments?.query ?? "");
            return runAnalysis(query);
          },
        });

        client.addListener(AnamEvent.SESSION_READY, () => {
          if (cancelled) return;
          setPhase("live");
          setStatusMsg("Listening");
        });
        client.addListener(AnamEvent.USER_SPEECH_STARTED, () => {
          if (!cancelled) setListening(true);
        });
        client.addListener(AnamEvent.USER_SPEECH_ENDED, () => {
          if (!cancelled) setListening(false);
        });
        client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          if (!cancelled) setStatusMsg("Connection closed");
        });
        client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages) => {
          if (cancelled) return;
          const lastPersona = [...messages]
            .reverse()
            .find((m) => m.role === MessageRole.PERSONA);
          if (lastPersona?.content) setCaption(lastPersona.content);
        });

        setPhase("connecting");
        setStatusMsg("Connecting...");
        await client.streamToVideoElement("hakim-video");
      } catch (err) {
        if (cancelled) return;
        console.error("[hakim] start failed:", err);
        setPhase("error");
        setStatusMsg(err instanceof Error ? err.message : "Failed to connect.");
      }
    }

    start();

    return () => {
      cancelled = true;
      clientRef.current?.stopStreaming().catch(() => {});
      clientRef.current = null;
    };
  }, [runAnalysis]);

  const ask = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || !clientRef.current || phase !== "live") return;
      clientRef.current.sendUserMessage(t);
    },
    [phase],
  );

  const sendTyped = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      ask(input);
      setInput("");
    },
    [ask, input],
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-night-950">
      {/* Full-bleed avatar video */}
      <video
        id="hakim-video"
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-top [transform:scale(0.9)] [transform-origin:top_center]"
      />

      {/* Readability gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 animate-glow rounded-full bg-accent-400 shadow-[0_0_16px_2px_rgba(56,189,248,0.7)]" />
          <span className="text-lg font-semibold tracking-tight text-white">
            Hakim<span className="text-accent-400"> AI</span>
          </span>
        </div>
        <Link
          href="/"
          className="rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition hover:border-white/40"
        >
          ← Back
        </Link>
      </div>

      {/* Status pill */}
      {(phase === "live" || phase === "connecting") && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            <span
              className={`h-2 w-2 rounded-full ${
                thinking
                  ? "animate-glow bg-amber-400"
                  : listening
                    ? "animate-glow bg-accent-400"
                    : "bg-white/40"
              }`}
            />
            {thinking
              ? "Analyzing the data..."
              : listening
                ? "Listening..."
                : statusMsg}
          </div>
        </div>
      )}

      {/* Sample questions — left rail */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-6 top-1/2 z-10 w-80 max-w-[85vw] -translate-y-1/2 rounded-2xl border border-white/15 bg-black/75 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-glow rounded-full bg-accent-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.7)]" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-400">
            Try asking
          </h2>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-white/60">
          Click a question, or just speak it out loud.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {SAMPLE_QUESTIONS.map((q, i) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              disabled={phase !== "live"}
              className="group flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] p-3 text-left text-sm leading-snug text-white/90 transition hover:border-accent-400/60 hover:bg-accent-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/25 text-[11px] font-semibold text-accent-300">
                {i + 1}
              </span>
              {q}
            </button>
          ))}
        </div>
      </motion.aside>

      {/* Analysis card (grounded answer + source) */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="absolute right-6 top-32 z-10 max-w-sm rounded-2xl border border-accent-400/20 bg-black/55 p-5 backdrop-blur-md"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
              Analysis
            </span>
            <p className="mt-2 text-base font-semibold leading-snug text-white">
              {analysis.answer}
            </p>
            {analysis.explanation && (
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {analysis.explanation}
              </p>
            )}
            {analysis.source && (
              <p className="mt-3 border-t border-white/10 pt-2 text-xs text-white/50">
                Source: {analysis.source}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption + input */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence>
            {caption && (
              <motion.p
                key={caption}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 text-center text-lg font-medium leading-relaxed text-white drop-shadow"
              >
                {caption}
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={sendTyped} className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={phase !== "live"}
              placeholder={
                phase === "live"
                  ? "Ask about districts, parcels, yields, investors..."
                  : "Connecting to Hakim..."
              }
              className="flex-1 rounded-full border border-white/15 bg-black/40 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none backdrop-blur transition focus:border-accent-400/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={phase !== "live" || !input.trim()}
              className="rounded-full bg-accent-500 px-5 py-3 text-sm font-semibold text-night-950 transition hover:bg-accent-400 disabled:opacity-40"
            >
              Ask
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-white/40">
            Speak out loud or type — Hakim runs the data analysis and answers
            with sources.
          </p>
        </div>
      </div>

      {/* Loading / not-configured / error overlays */}
      {phase !== "live" && phase !== "connecting" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-aurora px-6">
          <div className="pointer-events-none absolute inset-0 grid-fade" />
          <div className="relative max-w-lg text-center">
            {phase === "loading" && (
              <p className="text-lg text-white/80">{statusMsg}</p>
            )}

            {phase === "not_configured" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
                <h1 className="text-2xl font-bold text-white">
                  Hakim AI isn&apos;t set up yet
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Add your <code className="text-accent-400">ANAM_API_KEY</code>{" "}
                  (and an <code className="text-accent-400">OPENAI_API_KEY</code>{" "}
                  for the analysis tool) to{" "}
                  <code className="text-accent-400">.env.local</code>, then run:
                </p>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-black/50 px-4 py-3 text-left text-sm text-accent-400">
                  npm run setup:anam
                </pre>
                <p className="mt-3 text-xs text-white/50">
                  This creates the avatar, voice, tool, and persona once and
                  caches their IDs.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-block rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/90 transition hover:border-white/30"
                >
                  ← Back to home
                </Link>
              </div>
            )}

            {phase === "error" && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-8 backdrop-blur">
                <h1 className="text-2xl font-bold text-white">
                  Couldn&apos;t connect to Hakim
                </h1>
                <p className="mt-3 break-words text-sm leading-relaxed text-white/70">
                  {statusMsg}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-night-950 transition hover:bg-accent-400"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
