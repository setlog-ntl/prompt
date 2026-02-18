import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/config - 시스템 설정 조회
 */
export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config - 시스템 설정 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateConfig(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
