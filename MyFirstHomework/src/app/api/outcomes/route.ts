import { NextRequest, NextResponse } from "next/server";
import { listOutcomes } from "@/lib/outcome-repository";
import { PROJECT_SOURCES, type ProjectSource } from "@/types/project";
import type { OutcomeType } from "@/types/outcome";

function takeProjectSource(value: string | null): ProjectSource | undefined {
  if (!value) {
    return undefined;
  }

  return (PROJECT_SOURCES as readonly string[]).includes(value)
    ? (value as ProjectSource)
    : undefined;
}

function takeOutcomeType(value: string | null): OutcomeType | undefined {
  if (value === "paper" || value === "book" || value === "final") {
    return value;
  }

  return undefined;
}

function parsePositiveInteger(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInteger(searchParams.get("page"));
  const pageSize = parsePositiveInteger(searchParams.get("pageSize"));
  const yearValue = searchParams.get("year");
  const sourceValue = searchParams.get("source");
  const source = takeProjectSource(sourceValue);
  const outcomeTypeValue = searchParams.get("outcomeType");
  const outcomeType = takeOutcomeType(outcomeTypeValue);

  if (searchParams.get("page") && page === null) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PAGE",
          message: "page 参数必须为正整数。"
        }
      },
      { status: 400 }
    );
  }

  if (searchParams.get("pageSize") && pageSize === null) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PAGE_SIZE",
          message: "pageSize 参数必须为正整数。"
        }
      },
      { status: 400 }
    );
  }

  if (sourceValue && !source) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_SOURCE",
          message: "source 参数不在支持范围内。"
        }
      },
      { status: 400 }
    );
  }

  if (outcomeTypeValue && !outcomeType) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_OUTCOME_TYPE",
          message: "outcomeType 参数仅支持 paper、book、final。"
        }
      },
      { status: 400 }
    );
  }

  if (yearValue && !/^\d{4}$/.test(yearValue)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_YEAR",
          message: "year 参数必须为四位年份。"
        }
      },
      { status: 400 }
    );
  }

  const response = await listOutcomes({
    projectTitle: searchParams.get("projectTitle") ?? undefined,
    projectNumber: searchParams.get("projectNumber") ?? undefined,
    principalInvestigator: searchParams.get("principalInvestigator") ?? undefined,
    institution: searchParams.get("institution") ?? undefined,
    discipline: searchParams.get("discipline") ?? undefined,
    source,
    year: yearValue ? Number(yearValue) : undefined,
    outcomeType,
    page: page ?? undefined,
    pageSize: pageSize ?? undefined
  });

  return NextResponse.json(response);
}
