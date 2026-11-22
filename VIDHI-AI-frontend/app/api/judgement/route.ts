import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Point to Railway backend by default in production
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://vidhi-ai-backend-production.up.railway.app"
        : "http://localhost:8000");

    const targetUrl = new URL("judgement", backendBase.replace(/\/$/, "") + "/");

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error:
            "Backend returned an unparseable response. Please ensure GROQ_API_KEY is configured in Vercel Project Settings.",
          detail: text.slice(0, 300),
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to communicate with backend service.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
