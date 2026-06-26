/**
 * anam-setup.mjs — one-time, idempotent provisioning of the Hakim AI persona.
 *
 * Creates (once) an Anam avatar, picks a male voice, creates the
 * `analyze_dataset` client tool, and creates the "Hakim AI" persona, then
 * caches every id in anam.config.json. Re-running is a no-op once configured.
 *
 * Runs automatically via `predev`; also available as `npm run setup:anam`.
 * If ANAM_API_KEY is missing it warns and exits 0 so `npm run dev` still works.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "anam.config.json");
const IMAGE_PATH = path.join(ROOT, "public", "hakim.png");

const ANAM_BASE = "https://api.anam.ai";
// Built-in GPT OSS 120B — supports tool calls (see Anam docs).
const BUILTIN_LLM_ID = "a7cf662c-2ace-4de1-a21e-ef0fbf144bb7";
// Stock fallback avatar used only if custom avatar creation is not permitted.
const FALLBACK_AVATAR_ID = "30fa96d0-26c4-4e55-94a0-517025942e18";

const SYSTEM_PROMPT = `You are Hakim AI, a decision-intelligence assistant for Abu Dhabi land, investment and community data. You sit between raw city data and the decision-maker and give one clear, sourced answer the moment a decision is made.

Rules:
- For ANY question that needs a fact, number, ranking, comparison, trend or analysis of the data, you MUST call the analyze_dataset tool with the user's question. Never compute, estimate or guess figures yourself.
- After the tool returns, give a short, confident spoken answer, then ALWAYS state the source using the "source" provided in the tool result (the datasets the analysis used).
- Keep replies concise and conversational — you are speaking out loud. One or two sentences plus the source is ideal.
- For greetings or small talk, reply briefly and invite the user to ask a data question about districts, parcels, listings, transactions, investors, communities or amenities.
- The data is synthetic demo data for the Abu Dhabi AI PropTech Challenge; never claim it is real market data.`;

const TOOL_CONFIG = {
  name: "analyze_dataset",
  description:
    "Analyze the Abu Dhabi proptech datasets (districts, parcels, listings, transactions, investors, communities, amenities) to answer any factual/quantitative question about prices, yields, districts, parcels, investors, communities or amenities. Returns a grounded answer, an explanation built from real computed values, and the data sources used.",
  type: "CLIENT",
  config: {
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user's question in plain language",
        },
      },
      required: ["query"],
    },
    awaitResult: true,
    toolTimeoutSeconds: 45,
  },
};

function loadEnv() {
  // Load .env.local then .env (without adding a dependency).
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

async function anam(apiKey, route, init = {}) {
  const res = await fetch(`${ANAM_BASE}${route}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  return { ok: res.ok, status: res.status, body };
}

async function createAvatar(apiKey) {
  const sharp = (await import("sharp")).default;
  if (!fs.existsSync(IMAGE_PATH)) {
    console.warn(`[anam-setup] ${IMAGE_PATH} not found — using stock avatar.`);
    return FALLBACK_AVATAR_ID;
  }
  // Compress to comfortably under Anam's 4.5MB upload limit.
  const jpeg = await sharp(IMAGE_PATH)
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  console.log(
    `[anam-setup] compressed avatar image to ${(jpeg.length / 1024 / 1024).toFixed(2)} MB`,
  );

  const form = new FormData();
  form.append("displayName", "Hakim AI");
  form.append("avatarModel", "cara-4");
  form.append(
    "imageFile",
    new Blob([jpeg], { type: "image/jpeg" }),
    "hakim.jpg",
  );

  const res = await fetch(`${ANAM_BASE}/v1/avatars`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text();
    console.warn(
      `[anam-setup] avatar creation failed (${res.status}): ${detail}\n` +
        "[anam-setup] falling back to a stock avatar so the demo still runs.",
    );
    return FALLBACK_AVATAR_ID;
  }
  const avatar = await res.json();
  console.log(`[anam-setup] created avatar ${avatar.id}`);
  return avatar.id;
}

async function pickVoice(apiKey) {
  const { ok, body } = await anam(apiKey, "/v1/voices");
  // The API returns either a bare array or { data: [...] }.
  const voices = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  if (!ok || voices.length === 0) {
    console.warn("[anam-setup] could not list voices — leaving voice unset.");
    return undefined;
  }
  const isEnglish = (v) =>
    !v.country || ["GB", "US", "AU", "CA", "IE"].includes(v.country);
  const male = voices.filter((v) => v.gender === "MALE");
  const chosen =
    male.find(isEnglish) || male[0] || voices.find(isEnglish) || voices[0];
  console.log(
    `[anam-setup] selected voice ${chosen.id} (${chosen.displayName || "?"}, ${chosen.gender || "?"})`,
  );
  return chosen.id;
}

async function createTool(apiKey) {
  const { ok, status, body } = await anam(apiKey, "/v1/tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(TOOL_CONFIG),
  });
  if (!ok) {
    throw new Error(`tool creation failed (${status}): ${JSON.stringify(body)}`);
  }
  console.log(`[anam-setup] created tool ${body.id} (analyze_dataset)`);
  return body.id;
}

async function createPersona(apiKey, { avatarId, voiceId, toolId }) {
  const payload = {
    name: "Hakim AI",
    description:
      "Decision Intelligence for Abu Dhabi — the layer between city data and the decision.",
    avatarId,
    avatarModel: "cara-4",
    llmId: BUILTIN_LLM_ID,
    systemPrompt: SYSTEM_PROMPT,
    toolIds: [toolId],
  };
  if (voiceId) payload.voiceId = voiceId;

  const { ok, status, body } = await anam(apiKey, "/v1/personas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!ok) {
    throw new Error(
      `persona creation failed (${status}): ${JSON.stringify(body)}`,
    );
  }
  console.log(`[anam-setup] created persona ${body.id} (Hakim AI)`);
  return body.id;
}

async function main() {
  loadEnv();

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      if (cfg.personaId) {
        console.log(
          `[anam-setup] already configured (persona ${cfg.personaId}) — skipping.`,
        );
        return;
      }
    } catch {
      // fall through and recreate
    }
  }

  const apiKey = process.env.ANAM_API_KEY;
  if (!apiKey) {
    console.warn(
      "[anam-setup] ANAM_API_KEY not set — skipping Anam provisioning.\n" +
        "[anam-setup] Add it to .env.local and run `npm run setup:anam` to enable /hakim.",
    );
    return;
  }

  try {
    const avatarId = await createAvatar(apiKey);
    const voiceId = await pickVoice(apiKey);
    const toolId = await createTool(apiKey);
    const personaId = await createPersona(apiKey, { avatarId, voiceId, toolId });

    const config = {
      avatarId,
      voiceId: voiceId ?? null,
      toolId,
      personaId,
      llmId: BUILTIN_LLM_ID,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
    console.log(`[anam-setup] wrote ${path.relative(ROOT, CONFIG_PATH)} ✓`);
  } catch (err) {
    console.error(`[anam-setup] setup failed: ${err.message}`);
    // Do not block `npm run dev`.
    process.exitCode = 0;
  }
}

main();
