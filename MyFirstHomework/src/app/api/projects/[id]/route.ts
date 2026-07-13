import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/project-repository";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json(
      {
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "未找到对应项目。"
        }
      },
      { status: 404 }
    );
  }

  return NextResponse.json(project);
}
