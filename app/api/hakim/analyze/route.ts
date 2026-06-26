import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

export async function POST(request: Request) {
  let query = "";
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!query.trim()) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  try {
    const res = await fetch(`${AGENT_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "agent_failed", status: res.status, detail },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        error: "agent_unreachable",
        message:
          "Could not reach the code_agent sidecar. Is `npm run agent` running on " +
          AGENT_URL +
          "?",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
