import { NextResponse } from "next/server";
import { listAgentIds } from "@/lib/vibeprompt";

// GitHub Pages(static export) 빌드 시에만 적용됨 (Vercel에서는 무시됨)
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  try {
    const agents = await listAgentIds();
    return NextResponse.json({ agents });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

