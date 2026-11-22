import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";

    const targetUrl = new URL("health", backendBase.replace(/\/$/, "") + "/");

    const response = await fetch(targetUrl);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to communicate with backend service.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
