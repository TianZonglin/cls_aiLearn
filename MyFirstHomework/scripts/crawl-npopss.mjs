import { crawlNpopssProjects } from "../src/crawlers/npopss";
import { appendProjectsToSnapshot } from "../src/lib/crawl-snapshot-merge.mjs";
import { logLine } from "../src/lib/logger";
import { persistProjects, recordCrawlRun } from "../src/lib/upsert-projects";

const startedAt = new Date();

async function main() {
  await logLine("[npopss] crawl started");

  const { projects, errors } = await crawlNpopssProjects();
  const persisted = await persistProjects(projects);
  const snapshotPath = await appendProjectsToSnapshot(projects);
  const endedAt = new Date();
  const status = errors.length > 0 ? "failed" : "success";

  await recordCrawlRun({
    source: "npopss",
    status,
    totalFetched: persisted.totalFetched,
    totalSaved: persisted.totalSaved,
    errorMessage: errors.join(" | ") || undefined,
    startedAt,
    endedAt
  });

  const summary = {
    source: "npopss",
    totalFetched: persisted.totalFetched,
    totalSaved: persisted.totalSaved,
    failed: errors.length,
    persistedToDatabase: persisted.persistedToDatabase,
    snapshotPath
  };

  await logLine(`[npopss] crawl finished ${JSON.stringify(summary)}`);
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

  await logLine(`[npopss] crawl crashed ${message}`);
  await recordCrawlRun({
    source: "npopss",
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

