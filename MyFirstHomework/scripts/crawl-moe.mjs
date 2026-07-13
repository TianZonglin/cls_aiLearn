import { crawlMoeAnnualProjects } from "../src/crawlers/moe";
import { mergeProjectSnapshot } from "../src/lib/crawl-snapshot";
import { logLine } from "../src/lib/logger";
import { persistProjects, recordCrawlRun } from "../src/lib/upsert-projects";

const startedAt = new Date();

async function main() {
  await logLine("[moe] crawl started");

  const { projects, errors, yearPages, pdfLinks } = await crawlMoeAnnualProjects();
  const persisted = await persistProjects(projects);
  const snapshotPath = await mergeProjectSnapshot(projects);
  const endedAt = new Date();
  const status = errors.length > 0 ? "failed" : "success";

  await recordCrawlRun({
    source: "moe",
    status,
    totalFetched: persisted.totalFetched,
    totalSaved: persisted.totalSaved,
    errorMessage: errors.join(" | ") || undefined,
    startedAt,
    endedAt
  });

  const summary = {
    source: "moe",
    yearsDiscovered: yearPages.map((item) => item.year),
    totalYearPages: yearPages.length,
    totalPdfLinks: pdfLinks.length,
    totalFetched: persisted.totalFetched,
    totalSaved: persisted.totalSaved,
    failed: errors.length,
    persistedToDatabase: persisted.persistedToDatabase,
    snapshotPath
  };

  await logLine(`[moe] crawl finished ${JSON.stringify(summary)}`);

  console.log(JSON.stringify(summary, null, 2));

  if (errors.length > 0) {
    console.error("errors:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
  }
}

main().catch(async (error) => {
  const endedAt = new Date();
  const message = error instanceof Error ? error.message : String(error);

  await logLine(`[moe] crawl crashed ${message}`);
  await recordCrawlRun({
    source: "moe",
    status: "failed",
    totalFetched: 0,
    totalSaved: 0,
    errorMessage: message,
    startedAt,
    endedAt
  });

  console.error(message);
  process.exit(1);
});
