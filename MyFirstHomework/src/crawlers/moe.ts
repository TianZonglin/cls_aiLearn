import { load } from "cheerio";
import { PDFParse } from "pdf-parse";
import type { NormalizedProjectCandidate } from "@/crawlers/types";
import { normalizeProjectInput } from "@/lib/normalize";

const MOE_INDEX_URL = "https://www.hbskw.com/p/49052.html";
const MOE_YEARS = [2021, 2022, 2023, 2024, 2025] as const;
const APPROVAL_NUMBER_PATTERN = /\b2[1-5]YJ[A-Z0-9]{6,10}\b/;
const FUND_TYPE_PATTERN =
  /(规划基金项目|青年基金项目|自筹经费项目|西部和边疆地区项目|新疆项目|西藏项目|专项任务项目（[^）]+）|专项任务项目\([^)]+\)|专项任务项目)/;
const PAGE_MARKER_PATTERN = /^第\s+\d+\s+页$/;
const HEADER_PATTERN = /^序号\s+/;
const DISCIPLINE_CANDIDATES = [
  "马克思主义/思想政治教育",
  "哲学",
  "逻辑学",
  "宗教学",
  "语言学",
  "中国文学",
  "外国文学",
  "艺术学",
  "历史学",
  "考古学",
  "经济学",
  "管理学",
  "政治学",
  "法学",
  "社会学",
  "民族学与文化学",
  "新闻学与传播学",
  "图书馆、情报与文献学",
  "图书馆/情报与文献学",
  "教育学",
  "心理学",
  "体育学",
  "统计学",
  "港澳台问题研究",
  "国际问题研究",
  "交叉学科/综合研究",
  "综合研究"
].sort((left, right) => right.length - left.length);

export interface MoeYearPage {
  year: number;
  title: string;
  url: string;
}

export interface MoePdfLink {
  year: number;
  category: string;
  pageUrl: string;
  pdfUrl: string;
}

export interface MoeCrawlResult {
  projects: NormalizedProjectCandidate[];
  errors: string[];
  yearPages: MoeYearPage[];
  pdfLinks: MoePdfLink[];
}

interface ParsedMoeRow {
  discipline: string | null;
  title: string;
  fundType: string | null;
  projectNumber: string | null;
  principalInvestigator: string | null;
  institution: string | null;
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function compactText(value?: string | null) {
  return value?.replace(/\s+/g, "").trim() ?? "";
}

function dedupeBy<T>(items: T[], takeKey: (item: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = takeKey(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function normalizePdfUrl(url: string) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }

  return url;
}

async function fetchHtml(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

export async function discoverMoeYearPages(): Promise<MoeYearPage[]> {
  const html = await fetchHtml(MOE_INDEX_URL);
  const $ = load(html);

  const yearPages = $(".article-content a")
    .map((_, element) => {
      const title = cleanText($(element).text());
      const href = $(element).attr("href");
      const yearMatch = title.match(/(202[1-5])年度/);

      if (!href || !yearMatch) {
        return null;
      }

      const year = Number(yearMatch[1]);
      if (!MOE_YEARS.includes(year as (typeof MOE_YEARS)[number])) {
        return null;
      }

      return {
        year,
        title,
        url: new URL(href, MOE_INDEX_URL).toString()
      } satisfies MoeYearPage;
    })
    .get()
    .filter((item): item is MoeYearPage => Boolean(item));

  return dedupeBy(yearPages, (item) => String(item.year)).sort(
    (left, right) => left.year - right.year
  );
}

export async function discoverMoePdfLinks(
  yearPages: MoeYearPage[]
): Promise<MoePdfLink[]> {
  const allLinks: MoePdfLink[] = [];

  for (const yearPage of yearPages) {
    const html = await fetchHtml(yearPage.url);
    const $ = load(html);

    const pdfLinks = $(".article-content a")
      .map((_, element) => {
        const href = $(element).attr("href");
        const category = cleanText($(element).text());

        if (!href || !href.toLowerCase().includes(".pdf")) {
          return null;
        }

        return {
          year: yearPage.year,
          category,
          pageUrl: yearPage.url,
          pdfUrl: normalizePdfUrl(new URL(href, yearPage.url).toString())
        } satisfies MoePdfLink;
      })
      .get()
      .filter((item): item is MoePdfLink => Boolean(item));

    allLinks.push(...pdfLinks);
  }

  return dedupeBy(allLinks, (item) => item.pdfUrl);
}

function normalizePdfText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean)
    .filter((line) => line !== "附件1")
    .filter((line) => !line.startsWith("-- "))
    .filter((line) => !PAGE_MARKER_PATTERN.test(line))
    .filter((line) => !HEADER_PATTERN.test(line))
    .filter((line) => !line.includes("立项一览表"))
    .filter((line) => !line.includes("评审结果公示一览表"));
}

function isRecordStart(line: string) {
  return /^\d+\s/.test(line);
}

function splitRecords(lines: string[]) {
  const records: string[] = [];
  let buffer = "";

  for (const line of lines) {
    if (isRecordStart(line)) {
      if (buffer) {
        records.push(buffer.trim());
      }

      buffer = line;
      continue;
    }

    if (!buffer) {
      continue;
    }

    buffer = `${buffer} ${line}`.trim();
  }

  if (buffer) {
    records.push(buffer.trim());
  }

  return records;
}

function splitTailByInstitution(tail: string) {
  const parts = cleanText(tail).split(" ").filter(Boolean);

  if (parts.length === 0) {
    return {
      principalInvestigator: null,
      institution: null
    };
  }

  if (parts.length === 1) {
    return {
      principalInvestigator: parts[0],
      institution: null
    };
  }

  return {
    principalInvestigator: parts[0],
    institution: compactText(parts.slice(1).join(" "))
  };
}

function splitDisciplineAndTitle(left: string) {
  const compactLeft = compactText(left);

  for (const candidate of DISCIPLINE_CANDIDATES) {
    const compactCandidate = compactText(candidate);
    if (!compactLeft.startsWith(compactCandidate)) {
      continue;
    }

    const title = compactLeft.slice(compactCandidate.length);
    if (!title) {
      return null;
    }

    return {
      discipline: candidate,
      title
    };
  }

  const tokens = cleanText(left).split(" ").filter(Boolean);
  if (tokens.length < 2) {
    return null;
  }

  return {
    discipline: compactText(tokens[0]),
    title: compactText(tokens.slice(1).join(""))
  };
}

function parseRecordWithApprovalNumber(record: string): ParsedMoeRow | null {
  const normalized = cleanText(record.replace(/^\d+\s+/, ""));
  const approvalMatch = normalized.match(APPROVAL_NUMBER_PATTERN);

  if (!approvalMatch || approvalMatch.index === undefined) {
    return null;
  }

  const projectNumber = approvalMatch[0];
  const head = cleanText(normalized.slice(0, approvalMatch.index));
  const tail = cleanText(normalized.slice(approvalMatch.index + projectNumber.length));
  const fundTypeMatch = head.match(FUND_TYPE_PATTERN);

  if (!fundTypeMatch || fundTypeMatch.index === undefined) {
    return null;
  }

  const beforeFundType = cleanText(head.slice(0, fundTypeMatch.index));
  const split = splitDisciplineAndTitle(beforeFundType);
  const people = splitTailByInstitution(tail);

  if (!split?.title) {
    return null;
  }

  return {
    discipline: split.discipline,
    title: split.title,
    fundType: fundTypeMatch[0],
    projectNumber,
    principalInvestigator: people.principalInvestigator,
    institution: people.institution
  };
}

function parseRecordWithoutApprovalNumber(record: string): ParsedMoeRow | null {
  const normalized = cleanText(record.replace(/^\d+\s+/, ""));
  const fundTypeMatch = normalized.match(FUND_TYPE_PATTERN);

  if (!fundTypeMatch || fundTypeMatch.index === undefined) {
    return null;
  }

  const left = cleanText(normalized.slice(0, fundTypeMatch.index));
  const right = cleanText(normalized.slice(fundTypeMatch.index + fundTypeMatch[0].length));
  const split = splitDisciplineAndTitle(left);

  if (!split?.title || !right) {
    return null;
  }
  const people = splitTailByInstitution(right);

  return {
    discipline: split.discipline,
    title: split.title,
    fundType: fundTypeMatch[0],
    projectNumber: null,
    principalInvestigator: people.principalInvestigator,
    institution: people.institution
  };
}

async function parsePdfProjects(link: MoePdfLink) {
  const response = await fetch(link.pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF ${link.pdfUrl}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const text = (await parser.getText()).text;
    const lines = normalizePdfText(text);
    const records = splitRecords(lines);
    const projects: NormalizedProjectCandidate[] = [];

    for (const record of records) {
      const parsed =
        parseRecordWithApprovalNumber(record) ?? parseRecordWithoutApprovalNumber(record);

      if (!parsed) {
        continue;
      }

      projects.push(
        normalizeProjectInput({
          source: "moe",
          sourceProjectId: `${link.year}-${parsed.projectNumber ?? parsed.title}`,
          title: parsed.title,
          principalInvestigator: parsed.principalInvestigator,
          institution: parsed.institution,
          discipline: parsed.discipline,
          fundType: parsed.fundType,
          year: link.year,
          projectNumber: parsed.projectNumber,
          status: link.year === 2025 ? "评审结果公示" : "已立项",
          keywords: [parsed.discipline, parsed.fundType].filter(Boolean) as string[],
          summary: `${link.category}，来源于教育部年度项目附件。`,
          sourceUrl: link.pdfUrl,
          raw: {
            year: link.year,
            category: link.category,
            pageUrl: link.pageUrl,
            pdfUrl: link.pdfUrl,
            record
          }
        })
      );
    }

    return projects;
  } finally {
    await parser.destroy();
  }
}

export async function crawlMoeAnnualProjects(): Promise<MoeCrawlResult> {
  const yearPages = await discoverMoeYearPages();
  const pdfLinks = await discoverMoePdfLinks(yearPages);
  const projects: NormalizedProjectCandidate[] = [];
  const errors: string[] = [];

  for (const pdfLink of pdfLinks) {
    try {
      const parsedProjects = await parsePdfProjects(pdfLink);
      projects.push(...parsedProjects);
    } catch (error) {
      errors.push(
        `Failed to parse ${pdfLink.pdfUrl}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    projects: dedupeBy(
      projects,
      (project) =>
        [
          project.source,
          project.projectNumber ?? "",
          project.title,
          project.principalInvestigator ?? "",
          project.year ?? ""
        ].join("::")
    ),
    errors,
    yearPages,
    pdfLinks
  };
}
