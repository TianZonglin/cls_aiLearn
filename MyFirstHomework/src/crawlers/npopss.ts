import xlsx from "xlsx";
import type { NormalizedProjectCandidate } from "@/crawlers/types";
import { normalizeProjectInput } from "@/lib/normalize";

const NPOPSS_XLS_SOURCES = [
  {
    year: 2011,
    category: "2011年度国家社科基金艺术学项目立项名单",
    url: "https://www.nopss.gov.cn/mediafile/201108/16/P201108161612457687189601.xls"
  }
] as const;

export interface NpopssCrawlResult {
  projects: NormalizedProjectCandidate[];
  errors: string[];
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function pickSheet(workbook: xlsx.WorkBook) {
  const match = workbook.SheetNames.find((name) => /sheet1/i.test(name));
  return workbook.Sheets[match ?? workbook.SheetNames[0]];
}

function normalizeFundType(raw: string) {
  const value = cleanText(raw);
  if (!value) {
    return null;
  }

  if (value.includes("国家重点")) {
    return "国家重点项目";
  }

  if (value.includes("一般")) {
    return "一般项目";
  }

  if (value.includes("青年")) {
    return "青年项目";
  }

  return value;
}

export async function crawlNpopssProjects(): Promise<NpopssCrawlResult> {
  const projects: NormalizedProjectCandidate[] = [];
  const errors: string[] = [];

  for (const source of NPOPSS_XLS_SOURCES) {
    try {
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheet = pickSheet(workbook);
      const rows = xlsx.utils.sheet_to_json<(string | number | null)[]>(sheet, {
        header: 1,
        raw: false
      });

      for (const row of rows.slice(2)) {
        const [projectNumber, title, fundType, principalInvestigator, institution] = row.map(
          (item) => cleanText(item == null ? "" : String(item))
        );

        if (!projectNumber || !title) {
          continue;
        }

        projects.push(
          normalizeProjectInput({
            source: "npopss",
            sourceProjectId: `${source.year}-${projectNumber}`,
            title,
            principalInvestigator,
            institution,
            discipline: "艺术学",
            fundType: normalizeFundType(fundType),
            year: source.year,
            projectNumber,
            status: "已立项",
            keywords: ["国家社科基金", "艺术学"],
            summary: `${source.category}，来源于全国哲学社会科学工作办公室公开附件。`,
            sourceUrl: source.url,
            raw: {
              sourceYear: source.year,
              category: source.category,
              sourceUrl: source.url,
              row
            }
          })
        );
      }
    } catch (error) {
      errors.push(
        `Failed to parse ${source.url}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    projects,
    errors
  };
}

