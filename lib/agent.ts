import fs from "fs/promises";
import path from "path";
import { getConfig } from "./config";

const DATA_DIR = path.join(process.cwd(), "data");

export interface Agent {
  id: string;
  name: string;
  category?: string;
  role: string;
  designDecisions: string;
  constraints: string;
  promptBlueprint?: string;
  createdAt?: string;
  raw: string;
}

export interface CreateAgentInput {
  id: string;
  name: string;
  category?: string;
  role: string;
  designDecisions: string;
  constraints: string;
  promptBlueprint?: string;
  projectId?: string;
}

export interface UpdateAgentInput {
  name?: string;
  category?: string;
  role?: string;
  designDecisions?: string;
  constraints?: string;
  promptBlueprint?: string;
}

/**
 * 에이전트 디렉토리 경로
 */
function getAgentsDir(projectId: string): string {
  if (projectId === "default") {
    return path.join(DATA_DIR, "agents");
  }
  return path.join(DATA_DIR, "projects", projectId, "agents");
}

/**
 * 에이전트 파일 경로
 */
function getAgentPath(agentId: string, projectId: string): string {
  return path.join(getAgentsDir(projectId), `${agentId}.md`);
}

/**
 * Markdown에서 섹션 추출
 */
function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`##\\s*${sectionName}[\\s\\S]*?(?=##|$)`, "i");
  const match = content.match(regex);
  if (!match) return "";
  return match[0]
    .replace(new RegExp(`##\\s*${sectionName}`, "i"), "")
    .trim();
}

/**
 * 에이전트 MD 파싱
 */
function parseAgent(id: string, content: string): Agent {
  // 이름 추출 (# Sub-Agent: Name 형식)
  const nameMatch = content.match(/^#\s*Sub-Agent:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : id;

  return {
    id,
    name,
    role: extractSection(content, "Role"),
    designDecisions: extractSection(content, "Design Decisions"),
    constraints: extractSection(content, "Constraints"),
    promptBlueprint: extractSection(content, "Prompt Blueprint") || undefined,
    raw: content,
  };
}

/**
 * 에이전트 MD 생성
 */
function generateAgentMd(data: CreateAgentInput | Agent): string {
  let content = `# Sub-Agent: ${data.name}

## Role
${data.role || "- (에이전트 역할을 정의하세요)"}

## Design Decisions
${data.designDecisions || "- (설계 결정을 정의하세요)"}

## Constraints
${data.constraints || "- (제약 조건을 정의하세요)"}`;

  if (data.promptBlueprint) {
    content += `

## Prompt Blueprint (옵션)
${data.promptBlueprint}`;
  }

  return content;
}

/**
 * 에이전트 목록 조회
 */
export async function listAgents(projectId?: string): Promise<Agent[]> {
  const config = await getConfig();
  const targetProjectId = projectId || config.activeProject;
  const agentsDir = getAgentsDir(targetProjectId);

  try {
    const files = await fs.readdir(agentsDir);
    const agents: Agent[] = [];

    for (const file of files) {
      if (file.endsWith(".md")) {
        const id = file.replace(/\.md$/, "");
        const content = await fs.readFile(path.join(agentsDir, file), "utf-8");
        agents.push(parseAgent(id, content));
      }
    }

    return agents;
  } catch {
    return [];
  }
}

/**
 * 에이전트 ID 목록 조회
 */
export async function listAgentIds(projectId?: string): Promise<string[]> {
  const config = await getConfig();
  const targetProjectId = projectId || config.activeProject;
  const agentsDir = getAgentsDir(targetProjectId);

  try {
    const files = await fs.readdir(agentsDir);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

/**
 * 에이전트 상세 조회
 */
export async function getAgent(agentId: string, projectId?: string): Promise<Agent> {
  const config = await getConfig();
  const targetProjectId = projectId || config.activeProject;
  const agentPath = getAgentPath(agentId, targetProjectId);

  try {
    const content = await fs.readFile(agentPath, "utf-8");
    return parseAgent(agentId, content);
  } catch {
    throw new Error(`Agent not found: ${agentId}`);
  }
}

/**
 * 에이전트 생성
 */
export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const { id, projectId } = input;
  const config = await getConfig();
  const targetProjectId = projectId || config.activeProject;

  // ID 검증
  if (!/^[a-z0-9.-]+$/.test(id)) {
    throw new Error("Agent ID must be lowercase alphanumeric with dots and hyphens only");
  }

  // 디렉토리 확인/생성
  const agentsDir = getAgentsDir(targetProjectId);
  await fs.mkdir(agentsDir, { recursive: true });

  // 중복 확인
  const agentPath = getAgentPath(id, targetProjectId);
  try {
    await fs.access(agentPath);
    throw new Error(`Agent already exists: ${id}`);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }

  // 에이전트 파일 생성
  const content = generateAgentMd(input);
  await fs.writeFile(agentPath, content, "utf-8");

  return parseAgent(id, content);
}

/**
 * 에이전트 수정
 */
export async function updateAgent(
  agentId: string,
  input: UpdateAgentInput,
  projectId?: string
): Promise<Agent> {
  const config = await getConfig();
  const targetProjectId = projectId || config.activeProject;
  const agent = await getAgent(agentId, targetProjectId);

  const updated: Agent = {
    ...agent,
    name: input.name ?? agent.name,
    category: input.category ?? agent.category,
    role: input.role ?? agent.role,
    designDecisions: input.designDecisions ?? agent.designDecisions,
    constraints: input.constraints ?? agent.constraints,
    promptBlueprint: input.promptBlueprint ?? agent.promptBlueprint,
    raw: "",
  };

  const content = generateAgentMd(updated);
  updated.raw = content;

  const agentPath = getAgentPath(agentId, targetProjectId);
  await fs.writeFile(agentPath, content, "utf-8");

  return updated;
}

/**
 * 에이전트 삭제
 */
export async function deleteAgent(agentId: string, projectId?: string): Promise<void> {
  const config = await getConfig();
  const targetProjectId = projectId || config.activeProject;
  const agentPath = getAgentPath(agentId, targetProjectId);

  try {
    await fs.unlink(agentPath);
  } catch {
    throw new Error(`Agent not found: ${agentId}`);
  }
}
