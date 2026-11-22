import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // BACKEND_URL is injected by Vercel services binding; fall back to local dev URL
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";

    const targetUrl = new URL("judgement", backendBase.replace(/\/$/, "") + "/");

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to communicate with backend service.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
