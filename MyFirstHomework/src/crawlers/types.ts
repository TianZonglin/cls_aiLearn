import type { ProjectSource } from "@/types/project";

export interface RawProjectInput {
  source: ProjectSource | string;
  sourceProjectId?: string | null;
  title?: string | null;
  principalInvestigator?: string | null;
  institution?: string | null;
  discipline?: string | null;
  fundType?: string | null;
  year?: string | number | null;
  projectNumber?: string | null;
  status?: string | null;
  keywords?: string | string[] | null;
  summary?: string | null;
  sourceUrl?: string | null;
  raw?: Record<string, unknown>;
}

export interface NormalizedProjectCandidate {
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
}

export interface NormalizationExample {
  name: string;
  input: RawProjectInput;
  expected: Partial<NormalizedProjectCandidate>;
}
