import { NextResponse } from "next/server";
import { listAgentIds } from "@/lib/vibeprompt";

// Vercel에서는 동적으로 동작
// GitHub Pages 빌드 시에는 이 파일이 제외됨
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await listAgentIds();
    return NextResponse.json({ agents });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

