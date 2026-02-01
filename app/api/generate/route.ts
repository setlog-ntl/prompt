import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildCompilerInstruction,
  composeRunnablePrompt,
  readAgent,
  readProjectCore,
  splitCompilerOutput,
} from "@/lib/vibeprompt";

// GitHub Pages 빌드 시 static export 호환을 위해 설정
// Vercel에서는 POST 핸들러가 자동으로 dynamic으로 동작함
export const dynamic = "force-static";
export const revalidate = false;

type GenerateBody = {
  selectedScope: "project" | "agent";
  selectedAgents?: string[];
  userInput: string;
  outputMode: "prompt" | "prompt+md";
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: Request) {
  // GitHub Pages에서는 서버 API가 동작하지 않으므로, 실수로 호출될 경우 안내 메시지 반환
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return NextResponse.json(
      {
        error:
          "GitHub Pages는 정적 호스팅이라 /api/generate가 동작하지 않습니다. 로컬(dev) 또는 서버 배포(Vercel 등)에서 사용하세요.",
      },
      { status: 501 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const selectedScope = body.selectedScope;
  const selectedAgents = Array.isArray(body.selectedAgents)
    ? body.selectedAgents
    : [];
  const userInput = (body.userInput ?? "").trim();
  const outputMode = body.outputMode;

  if (selectedScope !== "project" && selectedScope !== "agent") {
    return badRequest("selectedScope must be 'project' or 'agent'.");
  }
  if (outputMode !== "prompt" && outputMode !== "prompt+md") {
    return badRequest("outputMode must be 'prompt' or 'prompt+md'.");
  }
  if (!userInput) {
    return badRequest("userInput is required.");
  }
  if (selectedScope === "agent" && selectedAgents.length === 0) {
    return badRequest("When selectedScope is 'agent', selectedAgents is required.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY가 설정되어 있지 않습니다. env.example을 참고해 환경변수를 설정하세요.",
      },
      { status: 500 },
    );
  }

  try {
    const core = await readProjectCore();
    const agents =
      selectedScope === "agent" || selectedAgents.length > 0
        ? await Promise.all(selectedAgents.map((id) => readAgent(id)))
        : [];

    const { basePrompt } = composeRunnablePrompt({ core, agents, userInput });
    const compilerInstruction = buildCompilerInstruction({ basePrompt, outputMode });

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const resp = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "You are a careful prompt compiler. Never invent design decisions or constraints. Be concise and structured.",
        },
        { role: "user", content: compilerInstruction },
      ],
    });

    const outputText = (resp as any).output_text ?? "";
    const { prompt, doc } = splitCompilerOutput({ outputText });

    return NextResponse.json({
      generatedPrompt: prompt || basePrompt,
      generatedDoc: outputMode === "prompt+md" ? doc ?? "" : undefined,
      meta: {
        model,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

