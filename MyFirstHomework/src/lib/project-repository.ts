import { readProjectSnapshot } from "@/lib/crawl-snapshot";
import { getNpopssYearOptions, searchNpopssLive } from "@/lib/npopss-live";
import { sampleProjects } from "@/lib/sample-projects";
import type {
  ProjectListItem,
  ProjectListQuery,
  ProjectListResponse,
  ProjectRecord,
  ProjectSource
} from "@/types/project";

function parsePage(value?: number): number {
  return value && value > 0 ? value : 1;
}

function parsePageSize(value?: number): number {
  return value && value > 0 ? Math.min(value, 50) : 20;
}

function sortProjects(projects: ProjectRecord[]): ProjectRecord[] {
  return [...projects].sort((left, right) => {
    const leftYear = left.year ?? 0;
    const rightYear = right.year ?? 0;

    if (leftYear !== rightYear) {
      return rightYear - leftYear;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function matchesKeyword(project: ProjectRecord, keyword: string): boolean {
  const haystack = [
    project.title,
    project.principalInvestigator,
    project.institution,
    project.keywords
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(keyword.toLowerCase());
}

function includesText(value: string | null | undefined, expected: string) {
  return (value ?? "").toLowerCase().includes(expected.toLowerCase());
}

function filterProjects(projects: ProjectRecord[], query: ProjectListQuery) {
  return sortProjects(projects).filter((project) => {
    if (query.source && project.source !== query.source) {
      return false;
    }

    if (query.year && project.year !== query.year) {
      return false;
    }

    if (query.title && !includesText(project.title, query.title)) {
      return false;
    }

    if (query.discipline && !includesText(project.discipline, query.discipline)) {
      return false;
    }

    if (query.institution && !includesText(project.institution, query.institution)) {
      return false;
    }

    if (query.q && !matchesKeyword(project, query.q)) {
      return false;
    }

    return true;
  });
}

function toListItem(project: ProjectRecord): ProjectListItem {
  return {
    id: project.id,
    source: project.source,
    title: project.title,
    principalInvestigator: project.principalInvestigator,
    institution: project.institution,
    discipline: project.discipline,
    fundType: project.fundType,
    year: project.year,
    projectNumber: project.projectNumber,
    status: project.status,
    keywords: project.keywords,
    summary: project.summary,
    updatedAt: project.updatedAt,
    sourceUrl: project.sourceUrl
  };
}

function buildResponse(projects: ProjectRecord[], query: ProjectListQuery): ProjectListResponse {
  const page = parsePage(query.page);
  const pageSize = parsePageSize(query.pageSize);
  const filtered = filterProjects(projects, query);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(toListItem);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total: filtered.length
    }
  };
}

async function getRuntimeProjects(): Promise<ProjectRecord[]> {
  const snapshotProjects = await readProjectSnapshot();
  return snapshotProjects.length > 0 ? snapshotProjects : sampleProjects;
}

function normalizeProjectId(value: string) {
  return value
    .trim()
    .normalize("NFC")
    .replace(/%3A/gi, "：")
    .replace(/%EF%BC%9A/gi, "：");
}

export async function listProjects(query: ProjectListQuery): Promise<ProjectListResponse> {
  const page = parsePage(query.page);
  const pageSize = parsePageSize(query.pageSize);

  if (query.source === "npopss") {
    return searchNpopssLive({
      ...query,
      page,
      pageSize
    });
  }

  const projects = await getRuntimeProjects();
  return buildResponse(projects, query);
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const projects = await getRuntimeProjects();
  const normalizedId = normalizeProjectId(decodeURIComponent(id));

  return (
    projects.find((project) => project.id === id) ??
    projects.find((project) => project.id === normalizedId) ??
    null
  );
}

export async function getAvailableSources(): Promise<ProjectSource[]> {
  const projects = await getRuntimeProjects();
  return [...new Set(projects.map((project) => project.source))].sort() as ProjectSource[];
}

export async function getAvailableYears(): Promise<number[]> {
  const projects = await getRuntimeProjects();

  return [
    ...new Set([
      ...projects.map((project) => project.year).filter(Boolean),
      ...getNpopssYearOptions()
    ] as number[])
  ].sort((a, b) => b - a);
}
