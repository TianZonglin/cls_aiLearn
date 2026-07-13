import { readProjectSnapshot } from "@/lib/crawl-snapshot";
import { sampleProjects } from "@/lib/sample-projects";
import { SOURCE_LABELS } from "@/lib/source-labels";
import type { ProjectRecord, ProjectSource } from "@/types/project";

export interface InsightNode {
  id: string;
  label: string;
  value: number;
  searchText: string;
}

export interface InsightEdge {
  source: string;
  target: string;
  weight: number;
}

export interface HotMatrixCell {
  year: number;
  term: string;
  count: number;
  intensity: number;
  searchText: string;
}

export interface YearSummary {
  year: number;
  total: number;
  topDiscipline?: string;
}

export interface HotInsightBlock {
  discipline: string;
  keyword: string;
  windowYears: number;
  rangeLabel: string;
  totalInRange: number;
  yearSummaries: YearSummary[];
  disciplineShares: Array<{ label: string; count: number; ratio: number }>;
  hotTerms: string[];
  hotCloudTerms: Array<{ term: string; count: number; searchText: string }>;
  hotMatrix: HotMatrixCell[];
}

export interface FrontierInsightBlock {
  discipline: string;
  keyword: string;
  windowYears: number;
  rangeLabel: string;
  graphNodes: InsightNode[];
  graphEdges: InsightEdge[];
  cloudTerms: Array<{ term: string; count: number; searchText: string }>;
}

export interface HomeInsights {
  totalProjects: number;
  sourceLabel: string;
  filterSource: string;
  hot: HotInsightBlock;
  frontier: FrontierInsightBlock;
}

interface HomeInsightsOptions {
  source?: string;
  hotDiscipline?: string;
  hotWindowYears?: number;
  hotKeyword?: string;
  frontierDiscipline?: string;
  frontierWindowYears?: number;
  frontierKeyword?: string;
}

const STOP_TERMS = new Set([
  "研究",
  "视域",
  "我国",
  "中国",
  "路径",
  "机制",
  "问题",
  "背景",
  "建设",
  "发展",
  "治理",
  "体系",
  "模式",
  "逻辑",
  "影响",
  "应用",
  "比较",
  "实践",
  "项目",
  "基金",
  "课题",
  "视角",
  "导向",
  "取向",
  "改革",
  "创新",
  "优化",
  "提升",
  "新时代",
  "现代化",
  "教育",
  "高校",
  "大学"
]);

const EXPLICIT_BAD_TERMS = new Set(["工智", "能支", "制研", "径研", "略研"]);

const GENERIC_TITLE_PARTS = [
  "研究",
  "机制",
  "路径",
  "体系",
  "模式",
  "逻辑",
  "治理",
  "建设",
  "发展",
  "问题",
  "视域",
  "背景",
  "应用",
  "实践",
  "比较",
  "创新",
  "提升",
  "改革",
  "评价",
  "分析",
  "阐释",
  "转型",
  "重构",
  "框架",
  "范式",
  "方法",
  "表达",
  "传播",
  "叙事",
  "协同",
  "演化",
  "制度"
];

const LEADING_CONTEXT_PARTS = [
  "我国",
  "中国",
  "高校",
  "高等教育",
  "教育",
  "新时代",
  "新时期",
  "当代",
  "面向",
  "围绕"
];

const TITLE_BREAKERS =
  /支持下|支撑下|驱动下|赋能下|引领下|背景下|视域下|框架下|语境下|情境下|过程中的|中的|下的|以及|及其|与|和|及/g;

const STOP_CHARACTERS = /[的了与及和在对下中上为其并从将把等各类性化式论新]/;
const BROKEN_TOKEN_ENDINGS = ["研究", "机制"];
const BROKEN_TOKEN_PREFIXES = ["制", "径", "略", "式", "性", "化"];

const BROKEN_GENERIC_SUFFIXES = [
  "路径研",
  "机制研",
  "策略研",
  "方略研",
  "实践研",
  "实证研",
  "体系研",
  "模式研",
  "评价研",
  "建构研",
  "效应研",
  "影响研",
  "逻辑研",
  "治理研",
  "发展研",
  "改革研",
  "优化研",
  "提升研",
  "协同研"
];

function cleanText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

async function getRuntimeProjects(): Promise<ProjectRecord[]> {
  const snapshotProjects = await readProjectSnapshot();
  return snapshotProjects.length > 0 ? snapshotProjects : sampleProjects;
}

function clampWindow(value: number | undefined, fallback: number) {
  if (!value || value < 1) {
    return fallback;
  }

  return Math.min(value, 10);
}

function toSourceLabel(source?: string) {
  if (!source || source === "all") {
    return "多来源";
  }

  return SOURCE_LABELS[source as ProjectSource] ?? "多来源";
}

function countTop(items: Array<string | null | undefined>) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const value = cleanText(item);
    if (!value) {
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

function isUsefulToken(token: string) {
  if (token.length < 2 || token.length > 8) {
    return false;
  }

  if (EXPLICIT_BAD_TERMS.has(token)) {
    return false;
  }

  if (STOP_TERMS.has(token)) {
    return false;
  }

  if (!/[\u4e00-\u9fa5A-Za-z]/.test(token)) {
    return false;
  }

  if (token.length <= 3 && [...token].some((char) => STOP_CHARACTERS.test(char))) {
    return false;
  }

  if (
    token.length === 2 &&
    BROKEN_TOKEN_ENDINGS.some((ending) => token.endsWith(ending)) &&
    BROKEN_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix))
  ) {
    return false;
  }

  return true;
}

function isDisplayableInsightTerm(token: string) {
  if (!isUsefulToken(token)) {
    return false;
  }

  if (token.length < 3) {
    return false;
  }

  if (token.length <= 3 && /[研支略径制]$/.test(token)) {
    return false;
  }

  return true;
}

function normalizeTitleSegments(title: string) {
  return cleanText(title)
    .replace(/[()（）【】《》“”"'，。；：、·•\-]/g, "|")
    .replace(/基于|面向|围绕|针对|关于|视域下|背景下|语境下|框架下|情境下|过程中的|中的|下的|以及|及其|与|及|和|对|在|从/g, "|")
    .split("|")
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function splitTitlePhrase(value: string) {
  return cleanText(value)
    .replace(TITLE_BREAKERS, "|")
    .split("|")
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function trimGenericSuffix(value: string) {
  let current = value;

  while (current.length > 2) {
    const matched = GENERIC_TITLE_PARTS.find((part) => current.endsWith(part));
    if (!matched) {
      break;
    }
    current = current.slice(0, -matched.length).trim();
  }

  return current;
}

function trimLeadingContext(value: string) {
  let current = value;

  if (current.startsWith("中国式")) {
    return current;
  }

  while (current.length > 2) {
    const matched = LEADING_CONTEXT_PARTS.find(
      (part) => current.startsWith(part) && current.length > part.length + 2
    );

    if (!matched) {
      break;
    }

    current = current.slice(matched.length).trim();
  }

  return current;
}

function trimBrokenGenericSuffix(value: string) {
  let current = value;

  while (current.length > 2) {
    const matched = BROKEN_GENERIC_SUFFIXES.find((part) => current.endsWith(part));

    if (matched) {
      current = current.slice(0, -matched.length).trim();
      continue;
    }

    if (current.length >= 4 && current.endsWith("研")) {
      current = current.slice(0, -1).trim();
      continue;
    }

    break;
  }

  return current;
}

function polishInsightSegment(value: string) {
  return cleanText(value)
    .replace(/^[的之及与和对从向以]*?/u, "")
    .replace(/[的之及与和]\s*$/u, "")
    .replace(/[—\-:：;；,.，。/\\]+$/u, "")
    .trim();
}

function hasGenericSubstring(value: string) {
  return GENERIC_TITLE_PARTS.some((item) => value.includes(item));
}

function collectAnchoredSubterms(segment: string) {
  const terms = new Set<string>();

  if (!/^[\u4e00-\u9fa5]+$/.test(segment)) {
    return terms;
  }

  if (segment.length < 4) {
    return terms;
  }

  for (const size of [2]) {
    if (size === segment.length) {
      continue;
    }

    const prefix = segment.slice(0, size);
    const suffix = segment.slice(segment.length - size);

    if (isUsefulToken(prefix) && !hasGenericSubstring(prefix)) {
      terms.add(prefix);
    }

    if (isUsefulToken(suffix) && !hasGenericSubstring(suffix)) {
      terms.add(suffix);
    }
  }

  return terms;
}

function collectTitleTerms(title: string) {
  const terms = new Set<string>();

  for (const rawSegment of normalizeTitleSegments(title)) {
    for (const splitSegment of splitTitlePhrase(rawSegment)) {
      const segment = polishInsightSegment(
        trimGenericSuffix(
          trimBrokenGenericSuffix(trimLeadingContext(trimGenericSuffix(splitSegment)))
        )
      );

      if (segment.length >= 2 && segment.length <= 14 && isUsefulToken(segment)) {
        terms.add(segment);
      }

      for (const candidate of collectAnchoredSubterms(segment)) {
        terms.add(candidate);
      }
    }
  }

  return [...terms];
}

function collapseOverlappingTerms(items: Array<{ term: string; count: number }>) {
  const kept: Array<{ term: string; count: number }> = [];

  for (const item of items) {
    const duplicate = kept.find(
      (existing) =>
        existing.term !== item.term &&
        (existing.term.includes(item.term) || item.term.includes(existing.term)) &&
        (item.term.length <= 4 || existing.term.length <= 4 || hasGenericSubstring(item.term))
    );

    if (!duplicate) {
      kept.push(item);
    }
  }

  return kept;
}

function extractProjectTerms(project: ProjectRecord) {
  const terms = new Set<string>();

  for (const token of collectTitleTerms(project.title)) {
    terms.add(token);
  }

  for (const token of cleanText(project.keywords)
    .split(/[,，、；;]/)
    .map((item) => cleanText(item))
    .filter(Boolean)) {
    if (isUsefulToken(token)) {
      terms.add(token);
    }
  }

  return [...terms];
}

function extractProjectTitleTerms(project: ProjectRecord) {
  return collectTitleTerms(project.title);
}

function getTopTerms(
  projects: ProjectRecord[],
  limit: number,
  extractor: (project: ProjectRecord) => string[] = extractProjectTerms,
  minCount = 2
) {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const term of extractor(project)) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()]
    .filter(([term, count]) => count >= minCount && isDisplayableInsightTerm(term))
    .sort(
      (left, right) =>
        right[1] - left[1] ||
        right[0].length - left[0].length ||
        left[0].localeCompare(right[0])
    )
    .map(([term, count]) => ({ term, count }));

  return collapseOverlappingTerms(ranked).slice(0, limit);
}

function buildGraph(
  projects: ProjectRecord[],
  extractor: (project: ProjectRecord) => string[] = extractProjectTerms,
  minNodeCount = 2,
  minEdgeWeight = 2
) {
  const nodeCounts = new Map<string, number>();
  const edgeCounts = new Map<string, number>();

  for (const project of projects) {
    const terms = extractor(project).slice(0, 8);
    for (const term of terms) {
      nodeCounts.set(term, (nodeCounts.get(term) ?? 0) + 1);
    }
    for (let i = 0; i < terms.length; i += 1) {
      for (let j = i + 1; j < terms.length; j += 1) {
        const pair = [terms[i], terms[j]].sort();
        const key = `${pair[0]}::${pair[1]}`;
        edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const rankedNodes = [...nodeCounts.entries()]
    .filter(([label, value]) => value >= minNodeCount && isDisplayableInsightTerm(label))
    .sort(
      (left, right) =>
        right[1] - left[1] ||
        right[0].length - left[0].length ||
        left[0].localeCompare(right[0])
    )
    .map(([term, count]) => ({ term, count }));

  const graphNodes = collapseOverlappingTerms(rankedNodes)
    .slice(0, 14)
    .map(({ term: label, count: value }) => ({
      id: label,
      label,
      value,
      searchText: label
    }));

  const nodeSet = new Set(graphNodes.map((item) => item.id));

  let graphEdges = [...edgeCounts.entries()]
    .map(([key, weight]) => {
      const [source, target] = key.split("::");
      return { source, target, weight };
    })
    .filter((item) => item.weight >= minEdgeWeight && nodeSet.has(item.source) && nodeSet.has(item.target))
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 18);

  if (graphNodes.length > 1 && graphEdges.length < Math.min(4, graphNodes.length - 1)) {
    const centerId = graphNodes[0]?.id;

    if (centerId) {
      const connected = new Set(graphEdges.flatMap((edge) => [edge.source, edge.target]));
      const fallbackEdges = graphNodes
        .slice(1)
        .filter((node) => !connected.has(node.id))
        .slice(0, 10)
        .map((node) => ({
          source: centerId,
          target: node.id,
          weight: 1
        }));

      graphEdges = [...graphEdges, ...fallbackEdges].slice(0, 18);
    }
  }

  return { graphNodes, graphEdges };
}

function filterByDiscipline(projects: ProjectRecord[], discipline?: string) {
  if (!discipline) {
    return projects;
  }

  return projects.filter((project) => cleanText(project.discipline) === discipline);
}

function buildRangeLabel(years: number[]) {
  if (years.length > 1) {
    return `${years[years.length - 1]}-${years[0]}`;
  }

  return `${years[0] ?? new Date().getFullYear()}`;
}

function filterByKeyword(projects: ProjectRecord[], keyword?: string) {
  const normalized = cleanText(keyword);
  if (!normalized) {
    return projects;
  }

  return projects.filter((project) => {
    const haystack = [project.title, project.keywords, project.summary].map(cleanText).join(" ");
    return haystack.toLowerCase().includes(normalized.toLowerCase());
  });
}

function buildHotBlock(
  projects: ProjectRecord[],
  discipline: string,
  windowYears: number,
  keyword: string
): HotInsightBlock {
  const filteredProjects = filterByKeyword(filterByDiscipline(projects, discipline), keyword);
  const years = [...new Set(filteredProjects.map((project) => project.year).filter(Boolean) as number[])]
    .sort((left, right) => right - left)
    .slice(0, windowYears);

  const yearSummaries = years.map((year) => {
    const sameYearProjects = filteredProjects.filter((project) => project.year === year);
    const topDiscipline = countTop(sameYearProjects.map((project) => project.discipline))[0]?.[0];
    return {
      year,
      total: sameYearProjects.length,
      topDiscipline
    };
  });

  const rangeProjects = filteredProjects.filter(
    (project) => project.year && years.includes(project.year)
  );
  const totalInRange = rangeProjects.length;
  const disciplineCounts = countTop(rangeProjects.map((project) => project.discipline)).slice(0, 6);
  const disciplineShares = disciplineCounts.map(([label, count]) => ({
    label,
    count,
    ratio: totalInRange > 0 ? count / totalInRange : 0
  }));

  const hotTermUniverse = years.flatMap((year) =>
    getTopTerms(
      filteredProjects.filter((project) => project.year === year),
      3,
      extractProjectTitleTerms
    ).map((item) => item.term)
  );

  const hotTerms = [...new Set(hotTermUniverse)].slice(0, 8);
  const hotCloudTerms = getTopTerms(rangeProjects, 18, extractProjectTitleTerms).map((item) => ({
    term: item.term,
    count: item.count,
    searchText: item.term
  }));

  const rawCells = years.flatMap((year) => {
    const sameYearProjects = filteredProjects.filter((project) => project.year === year);
    const counts = new Map<string, number>();

    for (const project of sameYearProjects) {
      const terms = extractProjectTitleTerms(project);
      for (const term of hotTerms) {
        if (terms.includes(term)) {
          counts.set(term, (counts.get(term) ?? 0) + 1);
        }
      }
    }

    return hotTerms.map((term) => ({
      year,
      term,
      count: counts.get(term) ?? 0,
      searchText: term
    }));
  });

  const maxCount = Math.max(...rawCells.map((item) => item.count), 1);
  const hotMatrix = rawCells.map((item) => ({
    ...item,
    intensity: item.count / maxCount
  }));

  return {
    discipline,
    keyword,
    windowYears,
    rangeLabel: buildRangeLabel(years),
    totalInRange,
    yearSummaries,
    disciplineShares,
    hotTerms,
    hotCloudTerms,
    hotMatrix
  };
}

function buildFrontierBlock(
  projects: ProjectRecord[],
  discipline: string,
  windowYears: number,
  keyword: string
): FrontierInsightBlock {
  const filteredProjects = filterByKeyword(filterByDiscipline(projects, discipline), keyword);
  const years = [...new Set(filteredProjects.map((project) => project.year).filter(Boolean) as number[])]
    .sort((left, right) => right - left)
    .slice(0, windowYears);
  const scopedProjects = filteredProjects.filter(
    (project) => project.year && years.includes(project.year)
  );
  const relaxed = Boolean(keyword);
  const { graphNodes, graphEdges } = buildGraph(
    scopedProjects,
    extractProjectTitleTerms,
    relaxed ? 1 : 2,
    relaxed ? 1 : 2
  );
  const cloudTerms = getTopTerms(
    scopedProjects,
    18,
    extractProjectTitleTerms,
    relaxed ? 1 : 2
  ).map((item) => ({
    term: item.term,
    count: item.count,
    searchText: item.term
  }));

  return {
    discipline,
    keyword,
    windowYears,
    rangeLabel: buildRangeLabel(years),
    graphNodes,
    graphEdges,
    cloudTerms
  };
}

export async function getHomeInsights(
  options: HomeInsightsOptions = {}
): Promise<HomeInsights> {
  const allProjects = await getRuntimeProjects();
  const filterSource = options.source && options.source !== "all" ? options.source : "all";
  const scopedProjects =
    filterSource === "all"
      ? allProjects
      : allProjects.filter((project) => project.source === filterSource);
  const hotDiscipline = cleanText(options.hotDiscipline) ?? "";
  const frontierDiscipline = cleanText(options.frontierDiscipline) ?? "";
  const hotKeyword = cleanText(options.hotKeyword) ?? "";
  const frontierKeyword = cleanText(options.frontierKeyword) ?? "";
  const hotWindowYears = clampWindow(options.hotWindowYears, 5);
  const frontierWindowYears = clampWindow(options.frontierWindowYears, 3);

  return {
    totalProjects: scopedProjects.length,
    sourceLabel: toSourceLabel(filterSource),
    filterSource,
    hot: buildHotBlock(scopedProjects, hotDiscipline, hotWindowYears, hotKeyword),
    frontier: buildFrontierBlock(
      scopedProjects,
      frontierDiscipline,
      frontierWindowYears,
      frontierKeyword
    )
  };
}
