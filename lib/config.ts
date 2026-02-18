import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

export interface ProjectMeta {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface SystemConfig {
  version: string;
  activeProject: string;
  defaults: {
    outputMode: "prompt" | "prompt+md";
    model: string;
  };
  projects: ProjectMeta[];
}

const DEFAULT_CONFIG: SystemConfig = {
  version: "1.0.0",
  activeProject: "default",
  defaults: {
    outputMode: "prompt",
    model: "gpt-4o-mini",
  },
  projects: [
    {
      id: "default",
      name: "Default Project",
      description: "",
      createdAt: new Date().toISOString(),
    },
  ],
};

/**
 * 시스템 설정 로드
 */
export async function getConfig(): Promise<SystemConfig> {
  try {
    const content = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content) as SystemConfig;
  } catch {
    // 설정 파일이 없으면 기본값 반환
    return DEFAULT_CONFIG;
  }
}

/**
 * 시스템 설정 저장
 */
export async function saveConfig(config: SystemConfig): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * 설정 부분 업데이트
 */
export async function updateConfig(
  updates: Partial<SystemConfig>
): Promise<SystemConfig> {
  const current = await getConfig();
  const updated = { ...current, ...updates };
  await saveConfig(updated);
  return updated;
}

/**
 * 활성 프로젝트 변경
 */
export async function setActiveProject(projectId: string): Promise<void> {
  const config = await getConfig();
  const projectExists = config.projects.some((p) => p.id === projectId);
  if (!projectExists) {
    throw new Error(`Project not found: ${projectId}`);
  }
  config.activeProject = projectId;
  await saveConfig(config);
}

/**
 * 프로젝트 메타 정보 추가
 */
export async function addProjectMeta(project: ProjectMeta): Promise<void> {
  const config = await getConfig();
  if (config.projects.some((p) => p.id === project.id)) {
    throw new Error(`Project already exists: ${project.id}`);
  }
  config.projects.push(project);
  await saveConfig(config);
}

/**
 * 프로젝트 메타 정보 삭제
 */
export async function removeProjectMeta(projectId: string): Promise<void> {
  const config = await getConfig();
  if (projectId === "default") {
    throw new Error("Cannot delete default project");
  }
  config.projects = config.projects.filter((p) => p.id !== projectId);
  if (config.activeProject === projectId) {
    config.activeProject = "default";
  }
  await saveConfig(config);
}
