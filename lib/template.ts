import fs from "fs/promises";
import path from "path";
import { createAgent, Agent, CreateAgentInput } from "./agent";

const DATA_DIR = path.join(process.cwd(), "data");
const TEMPLATES_DIR = path.join(DATA_DIR, "templates", "agents");

export interface AgentTemplate {
  templateId: string;
  name: string;
  category: string;
  description: string;
  content: string;
}

/**
 * 템플릿 파일에서 메타데이터 파싱
 */
function parseTemplateMeta(content: string): {
  templateId: string;
  name: string;
  category: string;
  description: string;
} | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const lines = frontmatter.split("\n");
  const meta: Record<string, string> = {};

  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      meta[key.trim()] = valueParts.join(":").trim();
    }
  }

  return {
    templateId: meta.templateId || "",
    name: meta.name || "",
    category: meta.category || "",
    description: meta.description || "",
  };
}

/**
 * 템플릿 목록 조회
 */
export async function listTemplates(): Promise<AgentTemplate[]> {
  try {
    const files = await fs.readdir(TEMPLATES_DIR);
    const templates: AgentTemplate[] = [];

    for (const file of files) {
      if (file.endsWith(".template.md")) {
        const content = await fs.readFile(path.join(TEMPLATES_DIR, file), "utf-8");
        const meta = parseTemplateMeta(content);
        if (meta) {
          templates.push({
            ...meta,
            content,
          });
        }
      }
    }

    return templates;
  } catch {
    return [];
  }
}

/**
 * 특정 템플릿 조회
 */
export async function getTemplate(templateId: string): Promise<AgentTemplate> {
  const templates = await listTemplates();
  const template = templates.find((t) => t.templateId === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return template;
}

/**
 * 템플릿에서 에이전트 생성
 */
export async function createAgentFromTemplate(
  templateId: string,
  agentId: string,
  agentName: string,
  projectId?: string
): Promise<Agent> {
  const template = await getTemplate(templateId);

  // 템플릿 내용에서 frontmatter 제거
  const contentWithoutFrontmatter = template.content
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .trim();

  // {{AGENT_NAME}} 플레이스홀더 치환
  const finalContent = contentWithoutFrontmatter.replace(
    /\{\{AGENT_NAME\}\}/g,
    agentName
  );

  // 섹션 파싱
  const extractSection = (content: string, sectionName: string): string => {
    const regex = new RegExp(`##\\s*${sectionName}[\\s\\S]*?(?=##|$)`, "i");
    const match = content.match(regex);
    if (!match) return "";
    return match[0]
      .replace(new RegExp(`##\\s*${sectionName}`, "i"), "")
      .trim();
  };

  const input: CreateAgentInput = {
    id: agentId,
    name: agentName,
    category: template.category,
    role: extractSection(finalContent, "Role"),
    designDecisions: extractSection(finalContent, "Design Decisions"),
    constraints: extractSection(finalContent, "Constraints"),
    promptBlueprint: extractSection(finalContent, "Prompt Blueprint") || undefined,
    projectId,
  };

  return createAgent(input);
}

/**
 * 카테고리별 템플릿 그룹화
 */
export async function listTemplatesByCategory(): Promise<
  Record<string, AgentTemplate[]>
> {
  const templates = await listTemplates();
  const grouped: Record<string, AgentTemplate[]> = {};

  for (const template of templates) {
    const category = template.category || "uncategorized";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(template);
  }

  return grouped;
}
