import Link from "next/link";
import { HistoryTracker } from "@/components/history-tracker";
import { OutcomeSearchForm } from "@/components/outcome-search-form";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";
import { listOutcomes } from "@/lib/outcome-repository";

interface OutcomeSearchPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OutcomeSearchPage({ searchParams }: OutcomeSearchPageProps) {
  const params = (await searchParams) ?? {};
  const projectTitle = takeFirst(params.projectTitle) ?? "";
  const projectNumber = takeFirst(params.projectNumber) ?? "";
  const principalInvestigator = takeFirst(params.principalInvestigator) ?? "";
  const institution = takeFirst(params.institution) ?? "";
  const discipline = takeFirst(params.discipline) ?? "";
  const source = takeFirst(params.source) ?? "";
  const year = takeFirst(params.year) ?? "";
  const outcomeType = takeFirst(params.outcomeType) ?? "";

  const response = await listOutcomes({
    projectTitle: projectTitle || undefined,
    projectNumber: projectNumber || undefined,
    principalInvestigator: principalInvestigator || undefined,
    institution: institution || undefined,
    discipline: discipline || undefined,
    source: source ? (source as "moe" | "nsfc" | "npopss") : undefined,
    year: year ? Number(year) : undefined,
    outcomeType: outcomeType ? (outcomeType as "paper" | "book" | "final") : undefined,
    page: 1,
    pageSize: 12
  });

  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker
        category="成果查询"
        href={`/outcomes/search?${new URLSearchParams({
          ...(projectTitle ? { projectTitle } : {}),
          ...(projectNumber ? { projectNumber } : {}),
          ...(principalInvestigator ? { principalInvestigator } : {}),
          ...(institution ? { institution } : {}),
          ...(discipline ? { discipline } : {}),
          ...(source ? { source } : {}),
          ...(year ? { year } : {}),
          ...(outcomeType ? { outcomeType } : {})
        }).toString()}`}
        title={projectTitle ? `成果查询：${projectTitle}` : "成果查询"}
      />

      <SubpageTopNav currentPath="/outcomes" />

      <section className="search-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>成果查询</h1>
            <p>
              围绕项目名称、批准号、负责人和单位查找论文、著作与结项成果线索。当前仅提供成果线索与外部平台入口，不直接提供全文。
            </p>
          </div>
        </div>

        <div className="search-workbench__form">
          <OutcomeSearchForm
            discipline={discipline}
            institution={institution}
            outcomeType={outcomeType}
            principalInvestigator={principalInvestigator}
            projectNumber={projectNumber}
            projectTitle={projectTitle}
            source={source}
            year={year}
          />
        </div>
      </section>

      <section className="outcome-layout">
        <section className="results-panel results-panel--list">
          <div className="results-panel__summary results-panel__summary--list">
            <div>
              <h2>成果线索结果</h2>
              <p>{response.notice}</p>
            </div>
            <div className="results-summary-meta">
              <span>匹配项目 {response.matchedProjects.length}</span>
              <span>成果线索 {response.pagination.total}</span>
            </div>
          </div>

          <div className="outcome-notice">
            <strong>边界说明</strong>
            <p>当前模块仅提供成果线索、可信度判断和外部平台跳转入口，不提供第三方平台全文抓取与下载。</p>
          </div>

          {response.items.length === 0 ? (
            <section className="empty-state">
              <h2>暂无匹配成果线索</h2>
              <p>可以尝试调整项目名称、批准号或负责人条件，后续也会持续补充公开成果线索来源。</p>
            </section>
          ) : (
            <div className="outcome-list">
              {response.items.map((item) => (
                <article key={item.id} className="outcome-card">
                  <div className="outcome-card__head">
                    <div>
                      <span className="outcome-card__type">{item.outcomeTypeLabel}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <span className={`outcome-card__confidence outcome-card__confidence--${item.confidenceLevel}`}>
                      {item.confidenceLabel}
                    </span>
                  </div>

                  <div className="outcome-card__meta">
                    <span>作者：{item.authors}</span>
                    <span>年份：{item.publishYear ?? "待补充"}</span>
                    <span>来源：{item.sourcePlatform}</span>
                    <span>匹配方式：{item.matchedBy}</span>
                  </div>

                  <p className="outcome-card__abstract">{item.abstractText}</p>

                  <div className="outcome-card__project">
                    <strong>关联项目</strong>
                    <span>{item.matchedProjectTitle}</span>
                    <em>{item.matchedProjectNumber || "未标注批准号"}</em>
                  </div>

                  <div className="outcome-card__links">
                    {item.externalLinks.map((link) => (
                      <a
                        key={`${item.id}-${link.platform}`}
                        className="table-link table-link--inline"
                        href={link.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="summary-panel">
          <div className="summary-panel__head">
            <strong>关联项目摘要</strong>
            <span>优先显示当前查询条件下最相关的基金项目</span>
          </div>

          {response.matchedProjects.length === 0 ? (
            <div className="summary-placeholder">
              <p>当前未匹配到相关项目。</p>
              <p>可以优先尝试输入项目名称、批准号或负责人以提高命中率。</p>
            </div>
          ) : (
            <div className="project-summary-list">
              {response.matchedProjects.map((project) => (
                <article key={project.id} className="project-summary-card">
                  <strong>{project.title}</strong>
                  <span>{project.sourceLabel}</span>
                  <p>
                    {project.principalInvestigator || "未标注负责人"} / {project.institution || "未标注单位"}
                  </p>
                  <em>
                    {project.projectNumber || "未标注批准号"}
                    {project.year ? ` / ${project.year}` : ""}
                  </em>
                  {project.sourceUrl ? (
                    <a className="table-link table-link--inline" href={project.sourceUrl} rel="noreferrer" target="_blank">
                      查看项目来源
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>

      <SubpageFooterNav currentPath="/outcomes" />
    </main>
  );
}
