import Link from "next/link";
import { HistoryTracker } from "@/components/history-tracker";
import { ProjectList } from "@/components/project-list";
import { SearchForm } from "@/components/search-form";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";
import { listProjects } from "@/lib/project-repository";
import type { ProjectSource } from "@/types/project";

interface ProjectsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = (await searchParams) ?? {};
  const q = takeFirst(params.q) ?? "";
  const title = takeFirst(params.title) ?? q;
  const discipline = takeFirst(params.discipline) ?? "";
  const institution = takeFirst(params.institution) ?? "";
  const source = takeFirst(params.source) ?? "";
  const year = takeFirst(params.year) ?? "";

  const response = await listProjects({
    q: q || undefined,
    title: title || undefined,
    discipline: discipline || undefined,
    institution: institution || undefined,
    source: (source || undefined) as ProjectSource | undefined,
    year: year ? Number(year) : undefined,
    page: 1,
    pageSize: 50
  });

  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker
        category="项目检索"
        href={`/projects?${new URLSearchParams({
          ...(title ? { title } : {}),
          ...(discipline ? { discipline } : {}),
          ...(institution ? { institution } : {}),
          ...(source ? { source } : {}),
          ...(year ? { year } : {})
        }).toString()}`}
        title={title ? `项目检索：${title}` : "项目检索"}
      />

      <SubpageTopNav currentPath="/projects" />

      <section className="search-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>基金课题项目检索</h1>
            <p>
              支持按课题名称、学科分类、工作单位、来源与立项年份组合检索，结果以连续列表呈现，便于横向对比。
            </p>
          </div>
        </div>

        <div className="search-workbench__form">
          <SearchForm
            discipline={discipline}
            institution={institution}
            source={source}
            title={title}
            year={year}
          />
        </div>
      </section>

      <ProjectList response={response} />
      <SubpageFooterNav currentPath="/projects" />
    </main>
  );
}
