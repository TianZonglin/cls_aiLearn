import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CrawlRunRecord, CrawlRunStatus, ProjectSource } from "@/types/project";

const DATA_DIR = path.join(process.cwd(), "data");
const CRAWL_RUNS_FILE = path.join(DATA_DIR, "crawl-runs.json");

interface PersistedCrawlRun extends CrawlRunRecord {}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readRuns(): Promise<PersistedCrawlRun[]> {
  try {
    const raw = await readFile(CRAWL_RUNS_FILE, "utf8");
    const parsed = JSON.parse(raw) as { items?: PersistedCrawlRun[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export async function appendCrawlRun(input: {
  source: ProjectSource;
  status: CrawlRunStatus;
  totalFetched: number;
  totalSaved: number;
  errorMessage?: string;
  startedAt: Date;
  endedAt: Date;
}) {
  await ensureDir();
  const existing = await readRuns();
  const item: PersistedCrawlRun = {
    id: `${input.source}-${input.startedAt.getTime()}`,
    source: input.source,
    startedAt: input.startedAt.toISOString(),
    endedAt: input.endedAt.toISOString(),
    status: input.status,
    totalFetched: input.totalFetched,
    totalSaved: input.totalSaved,
    errorMessage: input.errorMessage ?? null
  };

  existing.push(item);

  await writeFile(
    CRAWL_RUNS_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        items: existing
      },
      null,
      2
    ),
    "utf8"
  );

  return item;
}

export async function listCrawlRuns() {
  return readRuns();
}

export function getCrawlRunsPath() {
  return CRAWL_RUNS_FILE;
}

