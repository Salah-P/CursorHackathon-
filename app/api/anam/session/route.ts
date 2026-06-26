import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

type AnamConfig = { personaId?: string };

function readConfig(): AnamConfig | null {
  try {
    const p = path.join(process.cwd(), "anam.config.json");
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.ANAM_API_KEY;
  const config = readConfig();

  if (!apiKey || !config?.personaId) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Hakim AI is not set up yet. Add ANAM_API_KEY to .env.local and run `npm run setup:anam`.",
      },
      { status: 503 },
    );
  }

  const res = await fetch("https://api.anam.ai/v1/auth/session-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personaConfig: { personaId: config.personaId },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "session_failed", status: res.status, detail },
      { status: 502 },
    );
  }

  const data = await res.json();
  return NextResponse.json({ sessionToken: data.sessionToken });
}
