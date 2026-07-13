import { readProjectSnapshot } from "@/lib/crawl-snapshot";
import { sampleOutcomeLeads, type SampleOutcomeLead } from "@/lib/sample-outcomes";
import { sampleProjects } from "@/lib/sample-projects";
import { SOURCE_LABELS } from "@/lib/source-labels";
import type {
  MatchedProjectSummary,
  OutcomeExternalLink,
  OutcomeListItem,
  OutcomeListResponse,
  OutcomeQuery,
  OutcomeType
} from "@/types/outcome";
import type { ProjectRecord } from "@/types/project";

function cleanText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function includesText(value: string | null | undefined, expected?: string) {
  if (!expected) {
    return true;
  }

  return cleanText(value).toLowerCase().includes(cleanText(expected).toLowerCase());
}

function parsePage(value?: number) {
  return value && value > 0 ? value : 1;
}

function parsePageSize(value?: number) {
  return value && value > 0 ? Math.min(value, 20) : 12;
}

function sortProjects(projects: ProjectRecord[]) {
  return [...projects].sort((left, right) => {
    const rightYear = right.year ?? 0;
    const leftYear = left.year ?? 0;

    if (rightYear !== leftYear) {
      return rightYear - leftYear;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

async function getRuntimeProjects(): Promise<ProjectRecord[]> {
  const snapshotProjects = await readProjectSnapshot();
  const merged = [...snapshotProjects];

  for (const project of sampleProjects) {
    const exists = merged.some(
      (item) =>
        item.id === project.id ||
        (item.projectNumber && project.projectNumber && item.projectNumber === project.projectNumber)
    );

    if (!exists) {
      merged.push(project);
    }
  }

  return merged;
}

function filterProjects(projects: ProjectRecord[], query: OutcomeQuery) {
  return sortProjects(projects).filter((project) => {
    if (query.source && project.source !== query.source) {
      return false;
    }

    if (query.year && project.year !== query.year) {
      return false;
    }

    if (!includesText(project.title, query.projectTitle)) {
      return false;
    }

    if (!includesText(project.projectNumber, query.projectNumber)) {
      return false;
    }

    if (!includesText(project.principalInvestigator, query.principalInvestigator)) {
      return false;
    }

    if (!includesText(project.institution, query.institution)) {
      return false;
    }

    if (!includesText(project.discipline, query.discipline)) {
      return false;
    }

    return true;
  });
}

function toMatchedProjectSummary(project: ProjectRecord): MatchedProjectSummary {
  return {
    id: project.id,
    title: project.title,
    source: project.source,
    sourceLabel: SOURCE_LABELS[project.source],
    projectNumber: project.projectNumber,
    principalInvestigator: project.principalInvestigator,
    institution: project.institution,
    discipline: project.discipline,
    year: project.year,
    sourceUrl: project.sourceUrl
  };
}

function getOutcomeTypeLabel(type: OutcomeType) {
  if (type === "paper") {
    return "论文";
  }

  if (type === "book") {
    return "著作";
  }

  return "结项成果";
}

function getConfidence(score: number): {
  confidenceLevel: "high" | "medium" | "low";
  confidenceLabel: "高可信" | "中可信" | "低可信";
} {
  if (score >= 85) {
    return { confidenceLevel: "high", confidenceLabel: "高可信" };
  }

  if (score >= 60) {
    return { confidenceLevel: "medium", confidenceLabel: "中可信" };
  }

  return { confidenceLevel: "low", confidenceLabel: "低可信" };
}

function buildCnkiUrl(keyword: string) {
  return `https://kns.cnki.net/kns8/defaultresult/index?kw=${encodeURIComponent(keyword)}`;
}

function buildDuxiuUrl(keyword: string) {
  return `https://book.duxiu.com/search?Field=1&channel=search&ecode=utf-8&edtype=&searchtype=&sw=${encodeURIComponent(keyword)}&view=0`;
}

function buildWanfangUrl(keyword: string) {
  return `https://s.wanfangdata.com.cn/paper?q=${encodeURIComponent(keyword)}`;
}

function buildExternalLinks(keyword: string, sourceUrl?: string | null): OutcomeExternalLink[] {
  const links: OutcomeExternalLink[] = [
    {
      platform: "cnki",
      label: "知网检索",
      url: buildCnkiUrl(keyword),
      accessType: "jump"
    },
    {
      platform: "duxiu",
      label: "读秀检索",
      url: buildDuxiuUrl(keyword),
      accessType: "jump"
    },
    {
      platform: "wanfang",
      label: "万方检索",
      url: buildWanfangUrl(keyword),
      accessType: "jump"
    }
  ];

  if (sourceUrl) {
    links.push({
      platform: "source",
      label: "原始来源",
      url: sourceUrl,
      accessType: "public"
    });
  }

  return links;
}

function scoreLeadAgainstProject(lead: SampleOutcomeLead, project: ProjectRecord) {
  const normalizedLeadProjectNumber = cleanText(lead.projectNumber);
  const normalizedProjectNumber = cleanText(project.projectNumber);
  const normalizedLeadTitle = cleanText(lead.projectTitle);
  const normalizedProjectTitle = cleanText(project.title);
  const normalizedLeadPi = cleanText(lead.principalInvestigator);
  const normalizedProjectPi = cleanText(project.principalInvestigator);
  const normalizedLeadInstitution = cleanText(lead.institution);
  const normalizedProjectInstitution = cleanText(project.institution);

  if (normalizedLeadProjectNumber && normalizedLeadProjectNumber === normalizedProjectNumber) {
    return {
      score: 100,
      matchedBy: "批准号精确匹配"
    };
  }

  if (
    normalizedLeadTitle &&
    normalizedProjectTitle &&
    (normalizedLeadTitle === normalizedProjectTitle ||
      normalizedLeadTitle.includes(normalizedProjectTitle) ||
      normalizedProjectTitle.includes(normalizedLeadTitle))
  ) {
    return {
      score: 90,
      matchedBy: "项目名称匹配"
    };
  }

  if (
    normalizedLeadPi &&
    normalizedProjectPi &&
    normalizedLeadInstitution &&
    normalizedProjectInstitution &&
    normalizedLeadPi === normalizedProjectPi &&
    normalizedLeadInstitution === normalizedProjectInstitution
  ) {
    return {
      score: 60,
      matchedBy: "负责人+单位联合匹配"
    };
  }

  return null;
}

function mapLeadToOutcomeItem(
  lead: SampleOutcomeLead,
  project: ProjectRecord,
  score: number,
  matchedBy: string
): OutcomeListItem {
  const keyword = cleanText(lead.title || project.title || lead.projectNumber || "");
  const confidence = getConfidence(score);

  return {
    id: `${lead.id}::${project.id}`,
    title: lead.title,
    authors: lead.authors,
    outcomeType: lead.outcomeType,
    outcomeTypeLabel: getOutcomeTypeLabel(lead.outcomeType),
    publishYear: lead.publishYear,
    publisherOrJournal: lead.publisherOrJournal,
    sourcePlatform: lead.sourcePlatform,
    sourceUrl: buildCnkiUrl(keyword),
    abstractText: lead.abstractText,
    matchedProjectId: project.id,
    matchedProjectTitle: project.title,
    matchedProjectNumber: project.projectNumber,
    matchedBy,
    confidenceScore: score,
    confidenceLevel: confidence.confidenceLevel,
    confidenceLabel: confidence.confidenceLabel,
    externalLinks: buildExternalLinks(keyword, project.sourceUrl)
  };
}

function createFallbackOutcomeItems(project: ProjectRecord, outcomeType?: OutcomeType): OutcomeListItem[] {
  const types: OutcomeType[] = outcomeType ? [outcomeType] : ["paper", "book", "final"];

  return types.map((type) => {
    const typeLabel = getOutcomeTypeLabel(type);
    const searchTitle =
      type === "paper"
        ? `《${project.title}》相关论文检索线索`
        : type === "book"
          ? `《${project.title}》相关著作检索线索`
          : `《${project.title}》相关结项成果检索线索`;
    const keyword = cleanText(project.projectNumber || project.title);
    const score = project.projectNumber ? 88 : 72;
    const confidence = getConfidence(score);

    return {
      id: `fallback-${project.id}-${type}`,
      title: searchTitle,
      authors: cleanText(project.principalInvestigator) || "未标注作者",
      outcomeType: type,
      outcomeTypeLabel: typeLabel,
      publishYear: project.year,
      publisherOrJournal: "外部平台检索入口",
      sourcePlatform: "外部平台综合检索",
      sourceUrl: buildCnkiUrl(keyword),
      abstractText:
        "当前尚未整理到明确的公开成果条目，系统已基于匹配项目生成外部平台检索线索，便于继续查看相关论文、著作或结项成果。",
      matchedProjectId: project.id,
      matchedProjectTitle: project.title,
      matchedProjectNumber: project.projectNumber,
      matchedBy: project.projectNumber ? "批准号定位后生成检索线索" : "项目名称定位后生成检索线索",
      confidenceScore: score,
      confidenceLevel: confidence.confidenceLevel,
      confidenceLabel: confidence.confidenceLabel,
      externalLinks: buildExternalLinks(keyword, project.sourceUrl)
    };
  });
}

function buildOutcomeItems(projects: ProjectRecord[], query: OutcomeQuery) {
  const specificItems: OutcomeListItem[] = [];

  for (const project of projects) {
    for (const lead of sampleOutcomeLeads) {
      if (query.outcomeType && lead.outcomeType !== query.outcomeType) {
        continue;
      }

      const matched = scoreLeadAgainstProject(lead, project);

      if (!matched) {
        continue;
      }

      specificItems.push(mapLeadToOutcomeItem(lead, project, matched.score, matched.matchedBy));
    }
  }

  const uniqueSpecificItems = specificItems.filter(
    (item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index
  );

  if (uniqueSpecificItems.length > 0) {
    return {
      items: uniqueSpecificItems,
      notice: "当前优先展示已整理的公开成果线索，并补充知网、读秀、万方等外部平台入口。"
    };
  }

  const fallbackItems = projects.slice(0, 3).flatMap((project) => createFallbackOutcomeItems(project, query.outcomeType));

  return {
    items: fallbackItems,
    notice:
      fallbackItems.length > 0
        ? "当前未匹配到已整理的具体成果条目，已基于匹配项目生成外部平台检索线索，便于继续查找论文、著作与结项成果。"
        : "当前未匹配到相关项目或成果线索。"
  };
}

export async function listOutcomes(query: OutcomeQuery): Promise<OutcomeListResponse> {
  const page = parsePage(query.page);
  const pageSize = parsePageSize(query.pageSize);
  const runtimeProjects = await getRuntimeProjects();
  const matchedProjects = filterProjects(runtimeProjects, query).slice(0, 6);
  const { items: rawItems, notice } = buildOutcomeItems(matchedProjects, query);
  const start = (page - 1) * pageSize;
  const items = rawItems.slice(start, start + pageSize);

  return {
    matchedProjects: matchedProjects.map(toMatchedProjectSummary),
    items,
    pagination: {
      page,
      pageSize,
      total: rawItems.length
    },
    notice
  };
}
