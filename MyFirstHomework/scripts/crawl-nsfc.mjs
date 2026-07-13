import { crawlNsfcCompletionProjects } from "../src/crawlers/nsfc";
import { logLine } from "../src/lib/logger";
import { persistProjects, recordCrawlRun } from "../src/lib/upsert-projects";

const startedAt = new Date();

async function main() {
  await logLine("[nsfc] crawl started");

  const { projects, errors } = await crawlNsfcCompletionProjects();
  const persisted = await persistProjects(projects);
  const endedAt = new Date();
  const status = errors.length > 0 ? "failed" : "success";

  await recordCrawlRun({
    source: "nsfc",
    status,
    totalFetched: persisted.totalFetched,
    totalSaved: persisted.totalSaved,
    errorMessage: errors.join(" | ") || undefined,
    startedAt,
    endedAt
  });

  const summary = {
    source: "nsfc",
    totalFetched: persisted.totalFetched,
    totalSaved: persisted.totalSaved,
    failed: errors.length,
    persistedToDatabase: persisted.persistedToDatabase
  };

  await logLine(`[nsfc] crawl finished ${JSON.stringify(summary)}`);

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

  await logLine(`[nsfc] crawl crashed ${message}`);
  await recordCrawlRun({
    source: "nsfc",
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
