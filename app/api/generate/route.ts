import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildCompilerInstruction,
  composeRunnablePrompt,
  readAgent,
  readProjectCore,
  splitCompilerOutput,
} from "@/lib/vibeprompt";

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

