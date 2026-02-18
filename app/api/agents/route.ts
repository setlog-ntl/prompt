import { NextRequest, NextResponse } from "next/server";
import { listAgents, createAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";

/**
 * GET /api/agents - 에이전트 목록 조회
 * ?projectId=xxx - 특정 프로젝트의 에이전트만 조회
 * ?idsOnly=true - ID 목록만 반환 (기존 호환성)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;
    const idsOnly = searchParams.get("idsOnly") === "true";

    const agents = await listAgents(projectId);

    if (idsOnly) {
      // 기존 API 호환성 유지
      return NextResponse.json({ agents: agents.map((a) => a.id) });
    }

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents - 에이전트 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.id || !body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: "id, name, and role are required" },
        { status: 400 }
      );
    }

    const agent = await createAgent(body);
    return NextResponse.json({ success: true, data: agent }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

