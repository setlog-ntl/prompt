import { NextResponse } from "next/server";
import { listAgentIds } from "@/lib/vibeprompt";

export async function GET() {
  try {
    const agents = await listAgentIds();
    return NextResponse.json({ agents });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

