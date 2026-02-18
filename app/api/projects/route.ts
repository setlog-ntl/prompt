import { NextRequest, NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/project";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects - 프로젝트 목록 조회
 */
export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - 프로젝트 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.id || !body.name) {
      return NextResponse.json(
        { success: false, error: "id and name are required" },
        { status: 400 }
      );
    }

    const project = await createProject(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
