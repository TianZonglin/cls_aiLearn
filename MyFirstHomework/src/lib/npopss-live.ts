import * as cheerio from "cheerio";
import { normalizeProjectInput } from "@/lib/normalize";
import type {
  ProjectListItem,
  ProjectListQuery,
  ProjectListResponse,
  ProjectRecord
} from "@/types/project";

const SEARCH_BASE = "https://fz.people.com.cn/skygb/sk/index.php/index/seach";
const REMOTE_PAGE_SIZE = 20;

const DISCIPLINE_TO_REMOTE: Record<string, string> = {
  "马克思主义/思想政治教育": "马列·科社",
  哲学: "哲学",
  宗教学: "宗教学",
  语言学: "语言学",
  中国文学: "中国文学",
  外国文学: "外国文学",
  艺术学: "艺术学",
  考古学: "考古学",
  管理学: "管理学",
  政治学: "政治学",
  法学: "法学",
  社会学: "社会学",
  "民族学与文化学": "民族问题研究",
  "新闻学与传播学": "新闻学与传播学",
  "图书馆/情报/文献学": "图书馆、情报与文献学",
  教育学: "教育学",
  体育学: "体育学",
  统计学: "统计学",
  "国际问题研究": "国际问题研究"
};

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function buildSearchUrl(query: ProjectListQuery) {
  const page = query.page && query.page > 1 ? `/${query.page}` : "";
  const url = new URL(`${SEARCH_BASE}${page}`);

  if (query.title) {
    url.searchParams.set("xmname", query.title);
  }

  if (query.year) {
    url.searchParams.set("lxtime", String(query.year));
  }

  if (query.institution) {
    url.searchParams.set("gzdw", query.institution);
  }

  if (query.discipline) {
    const mapped = DISCIPLINE_TO_REMOTE[query.discipline];
    if (mapped) {
      url.searchParams.set("xktype", mapped);
    }
  }

  return url.toString();
}

function decodeHtml(buffer: Buffer) {
  return new TextDecoder("utf-8").decode(buffer);
}

function toRecord(cells: string[], sourceUrl: string): ProjectRecord | null {
  const [
    projectNumber,
    fundType,
    discipline,
    title,
    approvedDate,
    principalInvestigator,
    professionalTitle,
    institution,
    institutionType,
    region,
    system,
    resultTitle,
    resultType,
    resultLevel,
    completionDate,
    completionNumber,
    publisher,
    publishDate,
    author,
    awards
  ] = cells;

  if (!projectNumber || !title) {
    return null;
  }

  const normalized = normalizeProjectInput({
    source: "npopss",
    sourceProjectId: projectNumber,
    title,
    principalInvestigator,
    institution,
    discipline,
    fundType,
    year: approvedDate,
    projectNumber,
    status: "已立项",
    keywords: [discipline, fundType].filter(Boolean),
    summary: cleanText(resultTitle) || null,
    sourceUrl,
    raw: {
      approvedDate,
      professionalTitle,
      institutionType,
      region,
      system,
      resultTitle,
      resultType,
      resultLevel,
      completionDate,
      completionNumber,
      publisher,
      publishDate,
      author,
      awards
    }
  });

  const now = new Date().toISOString();

  return {
    id: `npopss-${projectNumber}`,
    createdAt: now,
    updatedAt: now,
    ...normalized
  };
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

function parseApproximateTotal($: cheerio.CheerioAPI, currentPage: number, currentCount: number) {
  const pageNumbers = $(".page a")
    .map((_, element) => Number(cleanText($(element).text())))
    .get()
    .filter((value) => Number.isFinite(value));

  const lastPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : currentPage;

  if (lastPage <= currentPage) {
    return (currentPage - 1) * REMOTE_PAGE_SIZE + currentCount;
  }

  return Math.max(lastPage * REMOTE_PAGE_SIZE, currentPage * REMOTE_PAGE_SIZE);
}

export async function searchNpopssLive(
  query: ProjectListQuery
): Promise<ProjectListResponse> {
  const page = query.page && query.page > 0 ? query.page : 1;
  const url = buildSearchUrl({ ...query, page });
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`NPOPSS live search failed with status ${response.status}`);
  }

  const html = decodeHtml(Buffer.from(await response.arrayBuffer()));
  const $ = cheerio.load(html);
  const rows: string[][] = [];

  $(".jc_a table tr")
    .slice(1)
    .each((_, row) => {
      const cells = $(row)
        .find("td")
        .map((__, cell) => cleanText($(cell).text()))
        .get();

      if (cells.length > 0) {
        rows.push(cells);
      }
    });

  const items = rows
    .map((row) => toRecord(row, url))
    .filter((row): row is ProjectRecord => Boolean(row))
    .map(toListItem);

  return {
    items,
    pagination: {
      page,
      pageSize: REMOTE_PAGE_SIZE,
      total: parseApproximateTotal($, page, items.length)
    }
  };
}

export function getNpopssYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let year = currentYear; year >= 1994; year -= 1) {
    years.push(year);
  }

  return years;
}
