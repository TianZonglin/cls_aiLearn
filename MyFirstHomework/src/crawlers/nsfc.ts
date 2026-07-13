import { chromium, type Page } from "playwright";
import { normalizeProjectInput } from "@/lib/normalize";
import type { NormalizedProjectCandidate } from "@/crawlers/types";

const NSFC_BASE_URL = "https://kd.nsfc.cn";
const LIST_LIMIT = 5;

interface NsfcCrawlResult {
  projects: NormalizedProjectCandidate[];
  errors: string[];
}

interface NsfcDetailRecord {
  title: string;
  projectNumber?: string | null;
  code?: string | null;
  principalInvestigator?: string | null;
  institution?: string | null;
  period?: string | null;
  fundAmount?: string | null;
  summary?: string | null;
  completionSummary?: string | null;
  sourceUrl: string;
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizePeriodToYear(period?: string | null) {
  if (!period) {
    return null;
  }

  const match = period.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

async function extractDetail(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

  const title = cleanText(await page.locator("body").locator("text=项目名称：").locator("..").textContent().catch(() => ""));
  const bodyText = await page.locator("body").innerText();

  const takeAfter = (label: string) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = bodyText.match(new RegExp(`${escaped}\\s*[:：]?\\s*([^\\n]+)`));
    return match ? cleanText(match[1]) : null;
  };

  const projectTitle = takeAfter("项目名称") || title;

  const detail: NsfcDetailRecord = {
    title: projectTitle,
    projectNumber: takeAfter("项目批准号"),
    code: takeAfter("申请代码"),
    principalInvestigator: takeAfter("项目负责人"),
    institution: takeAfter("依托单位"),
    period: takeAfter("研究期限"),
    fundAmount: takeAfter("资助经费"),
    summary: takeAfter("中文摘要"),
    completionSummary: takeAfter("结题摘要"),
    sourceUrl: url
  };

  return detail;
}

export async function crawlNsfcCompletionProjects(): Promise<NsfcCrawlResult> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const projects: NormalizedProjectCandidate[] = [];
  const errors: string[] = [];

  try {
    await page.goto(NSFC_BASE_URL, { waitUntil: "networkidle", timeout: 60000 });

    const links = await page
      .locator('a[href^="/finalDetails"]')
      .evaluateAll((nodes, limit) =>
        nodes.slice(0, Number(limit)).map((node) => ({
          href: node.getAttribute("href"),
          text: (node.textContent || "").trim()
        })),
        LIST_LIMIT
      );

    const detailPage = await browser.newPage();

    for (const link of links) {
      if (!link.href) {
        continue;
      }

      const url = `${NSFC_BASE_URL}${link.href}`;

      try {
        const detail = await extractDetail(detailPage, url);
        const normalized = normalizeProjectInput({
          source: "nsfc",
          sourceProjectId: link.href,
          title: detail.title,
          principalInvestigator: detail.principalInvestigator,
          institution: detail.institution,
          discipline: detail.code,
          fundType: detail.fundAmount,
          year: normalizePeriodToYear(detail.period),
          projectNumber: detail.projectNumber,
          status: "已结题",
          keywords: detail.code,
          summary: detail.completionSummary || detail.summary,
          sourceUrl: detail.sourceUrl,
          raw: detail as unknown as Record<string, unknown>
        });

        projects.push(normalized);
      } catch (error) {
        errors.push(
          `Failed to parse ${url}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    await detailPage.close();
  } finally {
    await page.close();
    await browser.close();
  }

  return { projects, errors };
}
