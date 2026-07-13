import { NextRequest, NextResponse } from "next/server";
import { listProjects } from "@/lib/project-repository";
import { PROJECT_SOURCES, type ProjectSource } from "@/types/project";

function takeProjectSource(value: string | null): ProjectSource | undefined {
  if (!value) {
    return undefined;
  }

  return (PROJECT_SOURCES as readonly string[]).includes(value)
    ? (value as ProjectSource)
    : undefined;
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

  const response = await listProjects({
    q: searchParams.get("q") ?? undefined,
    title: searchParams.get("title") ?? undefined,
    discipline: searchParams.get("discipline") ?? undefined,
    institution: searchParams.get("institution") ?? undefined,
    source,
    year: yearValue ? Number(yearValue) : undefined,
    page: page ?? undefined,
    pageSize: pageSize ?? undefined
  });

  return NextResponse.json(response);
}
