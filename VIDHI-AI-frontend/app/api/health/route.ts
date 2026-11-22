import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://vidhi-ai-backend-production.up.railway.app"
        : "http://localhost:8000");

    const targetUrl = new URL("health", backendBase.replace(/\/$/, "") + "/");

    const response = await fetch(targetUrl);
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: "error",
          error: "Backend returned an unexpected response",
          detail: text.slice(0, 300),
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to communicate with backend service.";
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
