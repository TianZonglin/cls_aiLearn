export const PROJECT_SOURCES = ["moe", "nsfc", "npopss"] as const;

export type ProjectSource = (typeof PROJECT_SOURCES)[number];

export type CrawlRunStatus = "success" | "failed";

export interface ProjectRecord {
  id: string;
  source: ProjectSource;
  sourceProjectId?: string | null;
  title: string;
  principalInvestigator?: string | null;
  institution?: string | null;
  discipline?: string | null;
  fundType?: string | null;
  year?: number | null;
  projectNumber?: string | null;
  status?: string | null;
  keywords?: string | null;
  summary?: string | null;
  sourceUrl?: string | null;
  sourceRaw?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  source: ProjectSource;
  title: string;
  principalInvestigator?: string | null;
  institution?: string | null;
  discipline?: string | null;
  fundType?: string | null;
  year?: number | null;
  projectNumber?: string | null;
  status?: string | null;
  keywords?: string | null;
  summary?: string | null;
  updatedAt?: string | null;
  sourceUrl?: string | null;
}

export interface ProjectListQuery {
  q?: string;
  title?: string;
  discipline?: string;
  institution?: string;
  source?: ProjectSource;
  year?: number;
  page?: number;
  pageSize?: number;
}

export interface ProjectListResponse {
  items: ProjectListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface CrawlRunRecord {
  id: string;
  source: ProjectSource;
  startedAt: string;
  endedAt?: string | null;
  status: CrawlRunStatus;
  totalFetched?: number | null;
  totalSaved?: number | null;
  errorMessage?: string | null;
}
