import fs from "node:fs/promises";
import path from "node:path";

export type SelectedScope = "project" | "agent";
export type OutputMode = "prompt" | "prompt+md";

export type AgentContext = {
  id: string; // filename without .md
  name?: string;
  role: string;
  designDecisions: string;
  constraints: string;
  promptBlueprint?: string;
  raw: string;
};

export type ProjectCore = {
  purpose: string;
  principles: string;
  direction: string;
  raw: string;
};

function normalizeNewlines(s: string) {
  return s.replace(/\r\n/g, "\n").trim();
}

function extractH2Section(md: string, heading: string): string {
  const src = normalizeNewlines(md);
  const re = new RegExp(
    `^##\\s+${heading.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*$`,
    "m",
  );
  const m = re.exec(src);
  if (!m) return "";
  const start = m.index + m[0].length;
  const rest = src.slice(start);
  const next = rest.search(/^##\s+/m);
  const body = next === -1 ? rest : rest.slice(0, next);
  return body.trim();
}

export async function readProjectCore(): Promise<ProjectCore> {
  const filePath = path.join(process.cwd(), "data", "project.core.md");
  const raw = normalizeNewlines(await fs.readFile(filePath, "utf8"));
  return {
    purpose: extractH2Section(raw, "Purpose"),
    principles: extractH2Section(raw, "Philosophy / Principles"),
    direction: extractH2Section(raw, "Long-term Direction"),
    raw,
  };
}

export async function listAgentIds(): Promise<string[]> {
  const dir = path.join(process.cwd(), "data", "agents");
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
    .map((e) => e.name.replace(/\.md$/i, ""))
    .sort((a, b) => a.localeCompare(b));
}

export async function readAgent(id: string): Promise<AgentContext> {
  if (!/^[a-z0-9._-]+$/i.test(id)) {
    throw new Error("Invalid agent id.");
  }
  const filePath = path.join(process.cwd(), "data", "agents", `${id}.md`);
  const raw = normalizeNewlines(await fs.readFile(filePath, "utf8"));

  // Optional: "# Sub-Agent: Name" parsing
  const firstLine = raw.split("\n")[0] ?? "";
  const nameMatch = firstLine.match(/^#\s*Sub-Agent:\s*(.+)\s*$/i);
  const name = nameMatch?.[1]?.trim();

  const role = extractH2Section(raw, "Role");
  const designDecisions = extractH2Section(raw, "Design Decisions");
  const constraints = extractH2Section(raw, "Constraints");
  const promptBlueprint = extractH2Section(raw, "Prompt Blueprint (옵션)");

  return {
    id,
    name,
    role,
    designDecisions,
    constraints,
    promptBlueprint: promptBlueprint || undefined,
    raw,
  };
}

function block(title: string, content: string) {
  const c = (content ?? "").trim();
  if (!c) return "";
  return `## ${title}\n${c}\n`;
}

export function composeRunnablePrompt(args: {
  core: ProjectCore;
  agents: AgentContext[];
  userInput: string;
}): { basePrompt: string } {
  const { core, agents, userInput } = args;

  const projectContext =
    `# PROJECT CONTEXT\n\n` +
    (block("Purpose", core.purpose) || "## Purpose\n- (비어있음)\n\n") +
    (block("Philosophy / Principles", core.principles) ||
      "## Philosophy / Principles\n- (비어있음)\n\n") +
    (block("Long-term Direction", core.direction) ||
      "## Long-term Direction\n- (비어있음)\n\n");

  const agentContext =
    agents.length === 0
      ? `# SUB-AGENT CONTEXT\n(없음)\n\n`
      : `# SUB-AGENT CONTEXT\n\n` +
        agents
          .map((a) => {
            const header = `## Agent: ${a.name ?? a.id}\n`;
            const role = block("Role", a.role) || "## Role\n- (비어있음)\n";
            const decisions =
              block("Design Decisions", a.designDecisions) ||
              "## Design Decisions\n- (비어있음)\n";
            const constraints =
              block("Constraints", a.constraints) ||
              "## Constraints\n- (비어있음)\n";
            const blueprint = a.promptBlueprint
              ? `## Prompt Blueprint\n${a.promptBlueprint.trim()}\n`
              : "";
            return `${header}${role}${decisions}${constraints}${blueprint}`.trim();
          })
          .join("\n\n") +
        "\n\n";

  const blueprints = agents
    .map((a) => a.promptBlueprint?.trim())
    .filter(Boolean) as string[];

  const blueprintInsert =
    blueprints.length === 0
      ? ""
      : `# SUB-AGENT PROMPT BLUEPRINTS\n` +
        blueprints.map((b, i) => `## Blueprint ${i + 1}\n${b}`).join("\n\n") +
        "\n\n---\n\n";

  const basePrompt =
    `# SYSTEM CONTEXT\n` +
    `You are assisting with a software project.\n` +
    `Do not invent new design decisions.\n` +
    `Only work within the given context.\n\n` +
    `---\n\n` +
    projectContext +
    `---\n\n` +
    agentContext +
    `---\n\n` +
    `# CHANGE REQUEST\n${userInput.trim()}\n\n` +
    `---\n\n` +
    blueprintInsert +
    `# TASK\n` +
    `- Apply the requested change only where relevant\n` +
    `- Respect all existing design decisions\n` +
    `- If something is ambiguous, ask questions before implementing\n` +
    `- Output the result for immediate use in vibe coding\n`;

  return { basePrompt: basePrompt.trim() + "\n" };
}

export function buildCompilerInstruction(args: {
  basePrompt: string;
  outputMode: OutputMode;
}) {
  const { basePrompt, outputMode } = args;

  const outputSpec =
    outputMode === "prompt+md"
      ? [
          "출력은 반드시 아래 마커 포맷으로만 제공한다.",
          "===PROMPT===",
          "(실행용 프롬프트 본문)",
          "===DOC===",
          "(옵션: 문서형 출력 마크다운 본문)",
        ].join("\n")
      : [
          "출력은 반드시 아래 마커 포맷으로만 제공한다.",
          "===PROMPT===",
          "(실행용 프롬프트 본문)",
        ].join("\n");

  return (
    `너는 "프롬프트 컴파일러"다.\n` +
    `아래 입력(base prompt)을 사람이 바로 Claude Code/GPT/Cursor에 붙여 넣어 실행할 수 있도록 다듬어라.\n` +
    `- 새로운 설계 결정을 발명하지 말 것\n` +
    `- 제공된 Design Decisions / Constraints를 우선 적용\n` +
    `- 중복 제거/문장 정리/빈 섹션 제거는 허용\n` +
    `- 모호하면 질문을 유도하는 형태로 TASK를 조정할 수 있음\n\n` +
    `${outputSpec}\n\n` +
    `---\n\n` +
    `BASE_PROMPT:\n` +
    basePrompt
  );
}

export function splitCompilerOutput(args: {
  outputText: string;
}): { prompt: string; doc?: string } {
  const text = normalizeNewlines(args.outputText);
  const p = text.indexOf("===PROMPT===");
  if (p === -1) return { prompt: text };
  const afterP = text.slice(p + "===PROMPT===".length).trim();
  const d = afterP.indexOf("===DOC===");
  if (d === -1) return { prompt: afterP.trim() };
  const prompt = afterP.slice(0, d).trim();
  const doc = afterP.slice(d + "===DOC===".length).trim();
  return { prompt, doc: doc || undefined };
}

