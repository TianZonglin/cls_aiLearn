import { notFound, redirect } from "next/navigation";
import { getProjectById } from "@/lib/project-repository";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const search = new URLSearchParams();
  search.set("title", project.title);
  search.set("source", project.source);

  if (project.year) {
    search.set("year", String(project.year));
  }

  redirect(`/projects?${search.toString()}`);
}
