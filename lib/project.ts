import fs from "fs/promises";
import path from "path";
import { getConfig, addProjectMeta, removeProjectMeta, ProjectMeta } from "./config";

const DATA_DIR = path.join(process.cwd(), "data");

export interface ProjectCore {
  purpose: string;
  principles: string;
  direction: string;
  raw: string;
}

export interface Project extends ProjectMeta {
  core: ProjectCore;
}

export interface CreateProjectInput {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  principles?: string;
  direction?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  purpose?: string;
  principles?: string;
  direction?: string;
}

/**
 * 프로젝트 코어 MD 파일 경로
 * v1: /data/project.core.md
 * v2: /data/projects/{id}/project.core.md
 */
function getProjectCorePath(projectId: string): string {
  if (projectId === "default") {
    // v1 호환: 기존 경로 사용
    return path.join(DATA_DIR, "project.core.md");
  }
  return path.join(DATA_DIR, "projects", projectId, "project.core.md");
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
 * 프로젝트 코어 파싱
 */
function parseProjectCore(content: string): ProjectCore {
  return {
    purpose: extractSection(content, "Purpose"),
    principles: extractSection(content, "Philosophy\\s*/\\s*Principles"),
    direction: extractSection(content, "Long-term Direction"),
    raw: content,
  };
}

/**
 * 프로젝트 코어 MD 생성
 */
function generateProjectCoreMd(data: {
  purpose?: string;
  principles?: string;
  direction?: string;
}): string {
  return `# Project Core

## Purpose
${data.purpose || "- (프로젝트 목적을 정의하세요)"}

## Philosophy / Principles
${data.principles || "- (설계 원칙을 정의하세요)"}

## Long-term Direction
${data.direction || "- (장기 방향성을 정의하세요)"}
`;
}

/**
 * 프로젝트 목록 조회
 */
export async function listProjects(): Promise<ProjectMeta[]> {
  const config = await getConfig();
  return config.projects;
}

/**
 * 프로젝트 상세 조회
 */
export async function getProject(projectId: string): Promise<Project> {
  const config = await getConfig();
  const meta = config.projects.find((p) => p.id === projectId);
  if (!meta) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const corePath = getProjectCorePath(projectId);
  let coreContent: string;
  try {
    coreContent = await fs.readFile(corePath, "utf-8");
  } catch {
    coreContent = generateProjectCoreMd({});
  }

  return {
    ...meta,
    core: parseProjectCore(coreContent),
  };
}

/**
 * 활성 프로젝트 조회
 */
export async function getActiveProject(): Promise<Project> {
  const config = await getConfig();
  return getProject(config.activeProject);
}

/**
 * 프로젝트 생성
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { id, name, description, purpose, principles, direction } = input;

  // ID 검증
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error("Project ID must be lowercase alphanumeric with hyphens only");
  }

  // 메타 정보 추가
  const meta: ProjectMeta = {
    id,
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  await addProjectMeta(meta);

  // 프로젝트 디렉토리 생성 (default가 아닌 경우)
  if (id !== "default") {
    const projectDir = path.join(DATA_DIR, "projects", id);
    const agentsDir = path.join(projectDir, "agents");
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(agentsDir, { recursive: true });
  }

  // 프로젝트 코어 파일 생성
  const corePath = getProjectCorePath(id);
  const coreContent = generateProjectCoreMd({ purpose, principles, direction });
  await fs.writeFile(corePath, coreContent, "utf-8");

  return {
    ...meta,
    core: parseProjectCore(coreContent),
  };
}

/**
 * 프로젝트 수정
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const project = await getProject(projectId);

  // 코어 내용 업데이트
  const newCore = generateProjectCoreMd({
    purpose: input.purpose ?? project.core.purpose,
    principles: input.principles ?? project.core.principles,
    direction: input.direction ?? project.core.direction,
  });

  const corePath = getProjectCorePath(projectId);
  await fs.writeFile(corePath, newCore, "utf-8");

  // 메타 정보 업데이트가 필요하면 config도 수정
  if (input.name || input.description !== undefined) {
    const config = await getConfig();
    const idx = config.projects.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
      if (input.name) config.projects[idx].name = input.name;
      if (input.description !== undefined)
        config.projects[idx].description = input.description;
      const { saveConfig } = await import("./config");
      await saveConfig(config);
    }
  }

  return getProject(projectId);
}

/**
 * 프로젝트 삭제
 */
export async function deleteProject(projectId: string): Promise<void> {
  if (projectId === "default") {
    throw new Error("Cannot delete default project");
  }

  // 메타 정보 삭제
  await removeProjectMeta(projectId);

  // 프로젝트 디렉토리 삭제
  const projectDir = path.join(DATA_DIR, "projects", projectId);
  try {
    await fs.rm(projectDir, { recursive: true, force: true });
  } catch {
    // 디렉토리가 없어도 무시
  }
}
