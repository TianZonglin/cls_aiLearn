import type {
  NormalizationExample,
  NormalizedProjectCandidate,
  RawProjectInput
} from "@/crawlers/types";
import { PROJECT_SOURCES, type ProjectSource } from "@/types/project";

const SOURCE_ALIASES: Record<string, ProjectSource> = {
  moe: "moe",
  "教育部人文社科项目": "moe",
  "教育部人文社会科学研究一般项目": "moe",
  nsfc: "nsfc",
  "国家自然科学基金": "nsfc",
  npopss: "npopss",
  "国家社科基金": "npopss"
};

function cleanText(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeYear(value?: string | number | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/(19|20)\d{2}/);
  if (!match) {
    return null;
  }

  return Number(match[0]);
}

function normalizeKeywords(value?: string | string[] | null): string | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => cleanText(item))
      .filter((item): item is string => Boolean(item))
      .join(", ");
  }

  return cleanText(value)?.replace(/[，、；;]/g, ", ") ?? null;
}

function normalizeSource(value: string): ProjectSource {
  const normalized = cleanText(value);

  if (!normalized) {
    throw new Error("Project source is required.");
  }

  const alias = SOURCE_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  if ((PROJECT_SOURCES as readonly string[]).includes(normalized)) {
    return normalized as ProjectSource;
  }

  throw new Error(`Unsupported project source: ${normalized}`);
}

export function normalizeProjectInput(
  input: RawProjectInput
): NormalizedProjectCandidate {
  const title = cleanText(input.title);

  if (!title) {
    throw new Error("Project title is required.");
  }

  return {
    source: normalizeSource(input.source),
    sourceProjectId: cleanText(input.sourceProjectId),
    title,
    principalInvestigator: cleanText(input.principalInvestigator),
    institution: cleanText(input.institution),
    discipline: cleanText(input.discipline),
    fundType: cleanText(input.fundType),
    year: normalizeYear(input.year),
    projectNumber: cleanText(input.projectNumber),
    status: cleanText(input.status),
    keywords: normalizeKeywords(input.keywords),
    summary: cleanText(input.summary),
    sourceUrl: cleanText(input.sourceUrl),
    sourceRaw: input.raw ?? null
  };
}

export function buildPrimaryDedupKey(
  project: Pick<NormalizedProjectCandidate, "source" | "projectNumber">
): string | null {
  const projectNumber = cleanText(project.projectNumber);
  return projectNumber ? `${project.source}::${projectNumber}` : null;
}

export function buildFallbackDedupKey(
  project: Pick<
    NormalizedProjectCandidate,
    "source" | "title" | "principalInvestigator" | "year"
  >
): string {
  return [
    project.source,
    cleanText(project.title) ?? "",
    cleanText(project.principalInvestigator) ?? "",
    project.year ?? ""
  ].join("::");
}

export const normalizationExamples: NormalizationExample[] = [
  {
    name: "moe-basic-row",
    input: {
      source: "教育部人文社科项目",
      sourceProjectId: "MOE-2024-001",
      title: "  人工智能支持下高校课程评价机制研究  ",
      principalInvestigator: "周明",
      institution: "华中师范大学",
      discipline: "教育学",
      fundType: "青年基金项目",
      year: "2024年",
      projectNumber: "24YJC880018",
      status: "已立项",
      keywords: ["人工智能", "课程评价"],
      summary: " 聚焦人工智能支持下的课程评价机制与应用路径。 ",
      sourceUrl: "https://example.com/moe/24YJC880018",
      raw: {
        rowId: "MOE-2024-001"
      }
    },
    expected: {
      source: "moe",
      title: "人工智能支持下高校课程评价机制研究",
      year: 2024,
      keywords: "人工智能, 课程评价"
    }
  },
  {
    name: "nsfc-basic-row",
    input: {
      source: "国家自然科学基金",
      sourceProjectId: "NSFC-001",
      title: "  人工智能支持下的教育评价研究  ",
      principalInvestigator: "张三",
      institution: "某大学教育学院",
      discipline: "教育学",
      fundType: "面上项目",
      year: "2024年",
      projectNumber: "12345678",
      status: "已立项",
      keywords: ["人工智能", "教育评价"],
      summary: " 聚焦人工智能支持下的教育评价机制。 ",
      sourceUrl: "https://example.com/nsfc/12345678",
      raw: {
        rowId: "NSFC-001"
      }
    },
    expected: {
      source: "nsfc",
      title: "人工智能支持下的教育评价研究",
      year: 2024,
      keywords: "人工智能, 教育评价"
    }
  },
  {
    name: "npopss-missing-optional-fields",
    input: {
      source: "npopss",
      title: "新时代基础教育治理现代化研究",
      principalInvestigator: "李四",
      year: 2023,
      keywords: "基础教育；教育治理；现代化",
      raw: {
        sourcePage: "npopss-list"
      }
    },
    expected: {
      source: "npopss",
      title: "新时代基础教育治理现代化研究",
      year: 2023,
      keywords: "基础教育, 教育治理, 现代化"
    }
  }
];
