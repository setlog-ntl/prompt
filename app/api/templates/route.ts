import { NextResponse } from "next/server";
import { listTemplates, listTemplatesByCategory } from "@/lib/template";

export const dynamic = "force-dynamic";

/**
 * GET /api/templates - 템플릿 목록 조회
 * ?grouped=true - 카테고리별 그룹화
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get("grouped") === "true";

    if (grouped) {
      const templatesByCategory = await listTemplatesByCategory();
      return NextResponse.json({ success: true, data: templatesByCategory });
    }

    const templates = await listTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
