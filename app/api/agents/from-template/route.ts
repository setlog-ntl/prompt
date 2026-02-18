import { NextRequest, NextResponse } from "next/server";
import { createAgentFromTemplate } from "@/lib/template";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/from-template - 템플릿에서 에이전트 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, agentId, agentName, projectId } = body;

    // 필수 필드 검증
    if (!templateId || !agentId || !agentName) {
      return NextResponse.json(
        { success: false, error: "templateId, agentId, and agentName are required" },
        { status: 400 }
      );
    }

    const agent = await createAgentFromTemplate(
      templateId,
      agentId,
      agentName,
      projectId
    );
    return NextResponse.json({ success: true, data: agent }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("not found") ? 404 :
                   message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
