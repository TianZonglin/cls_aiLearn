import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NormalizedProjectCandidate } from "@/crawlers/types";
import { repairProjectRecord } from "@/lib/text-repair";
import type { ProjectRecord } from "@/types/project";

const SNAPSHOT_DIR = path.join(process.cwd(), "data");
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, "projects.snapshot.json");

function repairBrokenJsonLine(line: string) {
  const quoteCount = [...line].filter((char, index) => {
    if (char !== '"') {
      return false;
    }

    return index === 0 || line[index - 1] !== "\\";
  }).length;

  if (quoteCount % 2 === 0) {
    return line;
  }

  if (line.trimEnd().endsWith(",")) {
    return line.replace(/,\s*$/, '",');
  }

  return `${line}"`;
}

function repairSnapshotJson(raw: string) {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .split(/\r?\n/)
    .map(repairBrokenJsonLine)
    .join("\n");
}

function toProjectRecord(
  project: NormalizedProjectCandidate,
  index: number
): ProjectRecord {
  const timestamp = new Date().toISOString();
  const rawId =
    project.projectNumber?.replace(/\s+/g, "-") ??
    project.sourceProjectId?.replace(/\s+/g, "-") ??
    `${project.source}-${index + 1}`;

  return {
    id: `${project.source}-${rawId}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...project
  };
}

function dedupeProjects(projects: ProjectRecord[]) {
  const map = new Map<string, ProjectRecord>();

  for (const project of projects) {
    const key = [
      project.source,
      project.projectNumber ?? "",
      project.title,
      project.principalInvestigator ?? "",
      project.year ?? ""
    ].join("::");

    map.set(key, project);
  }

  return [...map.values()];
}

async function ensureDir() {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
}

export async function readProjectSnapshot(): Promise<ProjectRecord[]> {
  try {
    const raw = await readFile(SNAPSHOT_FILE, "utf8");
    const parsed = JSON.parse(repairSnapshotJson(raw)) as { items?: ProjectRecord[] };
    return Array.isArray(parsed.items) ? parsed.items.map(repairProjectRecord) : [];
  } catch {
    return [];
  }
}

export async function writeProjectSnapshot(
  projects: NormalizedProjectCandidate[]
): Promise<string> {
  await ensureDir();

  const items = projects.map(toProjectRecord);
  const payload = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    items
  };

  await writeFile(SNAPSHOT_FILE, JSON.stringify(payload, null, 2), "utf8");

  return SNAPSHOT_FILE;
}

export async function mergeProjectSnapshot(
  projects: NormalizedProjectCandidate[]
): Promise<string> {
  await ensureDir();

  const existing = await readProjectSnapshot();
  const merged = dedupeProjects([...existing, ...projects.map(toProjectRecord)]);

  await writeFile(
    SNAPSHOT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: merged.length,
        items: merged
      },
      null,
      2
    ),
    "utf8"
  );

  return SNAPSHOT_FILE;
}

export function getProjectSnapshotPath() {
  return SNAPSHOT_FILE;
}
