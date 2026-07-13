import type { ProjectSource } from "@/types/project";

export type OutcomeType = "paper" | "book" | "final";

export interface OutcomeQuery {
  projectTitle?: string;
  projectNumber?: string;
  principalInvestigator?: string;
  institution?: string;
  discipline?: string;
  source?: ProjectSource;
  year?: number;
  outcomeType?: OutcomeType;
  page?: number;
  pageSize?: number;
}

export interface MatchedProjectSummary {
  id: string;
  title: string;
  source: ProjectSource;
  sourceLabel: string;
  projectNumber?: string | null;
  principalInvestigator?: string | null;
  institution?: string | null;
  discipline?: string | null;
  year?: number | null;
  sourceUrl?: string | null;
}

export interface OutcomeExternalLink {
  platform: "cnki" | "duxiu" | "wanfang" | "source";
  label: string;
  url: string;
  accessType: "jump" | "public";
}

export interface OutcomeListItem {
  id: string;
  title: string;
  authors: string;
  outcomeType: OutcomeType;
  outcomeTypeLabel: string;
  publishYear?: number | null;
  publisherOrJournal?: string | null;
  sourcePlatform: string;
  sourceUrl: string;
  abstractText?: string | null;
  matchedProjectId: string;
  matchedProjectTitle: string;
  matchedProjectNumber?: string | null;
  matchedBy: string;
  confidenceScore: number;
  confidenceLevel: "high" | "medium" | "low";
  confidenceLabel: "高可信" | "中可信" | "低可信";
  externalLinks: OutcomeExternalLink[];
}

export interface OutcomeListResponse {
  matchedProjects: MatchedProjectSummary[];
  items: OutcomeListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  notice: string;
}
