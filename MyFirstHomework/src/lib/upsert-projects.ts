import { prisma } from "@/lib/db";
import { appendCrawlRun } from "@/lib/crawl-run-store";
import { buildFallbackDedupKey, buildPrimaryDedupKey } from "@/lib/normalize";
import type { NormalizedProjectCandidate } from "@/crawlers/types";
import type { CrawlRunStatus, ProjectSource } from "@/types/project";
import { Prisma } from "@/generated/prisma/client";

export interface PersistProjectsResult {
  totalFetched: number;
  totalSaved: number;
  skipped: number;
  persistedToDatabase: boolean;
}

function toJsonValue(
  value: Record<string, unknown> | null | undefined
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

async function upsertOne(project: NormalizedProjectCandidate) {
  if (!prisma) {
    return false;
  }

  const primaryKey = buildPrimaryDedupKey(project);
  if (primaryKey && project.projectNumber) {
    await prisma.project.upsert({
      where: {
        source_projectNumber: {
          source: project.source,
          projectNumber: project.projectNumber
        }
      },
      update: {
        title: project.title,
        principalInvestigator: project.principalInvestigator,
        institution: project.institution,
        discipline: project.discipline,
        fundType: project.fundType,
        year: project.year,
        status: project.status,
        keywords: project.keywords,
        summary: project.summary,
        sourceUrl: project.sourceUrl,
        sourceRaw: toJsonValue(project.sourceRaw)
      },
      create: {
        source: project.source,
        sourceProjectId: project.sourceProjectId,
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
        sourceUrl: project.sourceUrl,
        sourceRaw: toJsonValue(project.sourceRaw)
      }
    });

    return true;
  }

  const existing = await prisma.project.findFirst({
    where: {
      source: project.source,
      title: project.title,
      principalInvestigator: project.principalInvestigator ?? null,
      year: project.year ?? null
    }
  });

  if (!existing) {
    await prisma.project.create({
      data: {
        source: project.source,
        sourceProjectId: project.sourceProjectId,
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
        sourceUrl: project.sourceUrl,
        sourceRaw: {
          fallbackDedupKey: buildFallbackDedupKey(project),
          raw: project.sourceRaw
        } as Prisma.InputJsonValue
      }
    });
    return true;
  }

  await prisma.project.update({
    where: { id: existing.id },
    data: {
      institution: project.institution,
      discipline: project.discipline,
      fundType: project.fundType,
      projectNumber: project.projectNumber ?? existing.projectNumber,
      status: project.status,
      keywords: project.keywords,
      summary: project.summary,
      sourceUrl: project.sourceUrl,
      sourceRaw: toJsonValue(project.sourceRaw)
    }
  });

  return true;
}

export async function persistProjects(
  projects: NormalizedProjectCandidate[]
): Promise<PersistProjectsResult> {
  if (!prisma) {
    return {
      totalFetched: projects.length,
      totalSaved: 0,
      skipped: projects.length,
      persistedToDatabase: false
    };
  }

  let totalSaved = 0;

  for (const project of projects) {
    const saved = await upsertOne(project);
    if (saved) {
      totalSaved += 1;
    }
  }

  return {
    totalFetched: projects.length,
    totalSaved,
    skipped: Math.max(projects.length - totalSaved, 0),
    persistedToDatabase: true
  };
}

export async function recordCrawlRun(input: {
  source: ProjectSource;
  status: CrawlRunStatus;
  totalFetched: number;
  totalSaved: number;
  errorMessage?: string;
  startedAt: Date;
  endedAt: Date;
}) {
  await appendCrawlRun(input);

  if (!prisma) {
    return false;
  }

  await prisma.crawlRun.create({
    data: {
      source: input.source,
      status: input.status,
      totalFetched: input.totalFetched,
      totalSaved: input.totalSaved,
      errorMessage: input.errorMessage,
      startedAt: input.startedAt,
      endedAt: input.endedAt
    }
  });

  return true;
}
