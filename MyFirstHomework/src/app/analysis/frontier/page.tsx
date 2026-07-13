import Link from "next/link";
import { HistoryTracker } from "@/components/history-tracker";
import { FrontierGraph } from "@/components/frontier-graph";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";
import { DISCIPLINE_OPTIONS } from "@/lib/disciplines";
import { getHomeInsights } from "@/lib/home-insights";
import { SOURCE_LABELS } from "@/lib/source-labels";
import type { ProjectSource } from "@/types/project";

const insightSources: Array<{ value: "all" | ProjectSource; label: string }> = [
  { value: "all", label: "全部来源" },
  { value: "moe", label: SOURCE_LABELS.moe },
  { value: "npopss", label: SOURCE_LABELS.npopss }
];

const rangeOptions = [1, 2, 3, 5, 8];

interface FrontierAnalysisPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildProjectsLink(source: string, title?: string, year?: number, discipline?: string) {
  const search = new URLSearchParams();

  if (title) {
    search.set("title", title);
  }

  if (year) {
    search.set("year", String(year));
  }

  if (discipline) {
    search.set("discipline", discipline);
  }

  if (source && source !== "all") {
    search.set("source", source);
  }

  return `/projects?${search.toString()}`;
}

export default async function FrontierAnalysisPage({
  searchParams
}: FrontierAnalysisPageProps) {
  const params = (await searchParams) ?? {};
  const source = takeFirst(params.source) ?? "all";
  const frontierDiscipline = takeFirst(params.frontierDiscipline) ?? "";
  const frontierYears = Number(takeFirst(params.frontierYears) ?? "3");
  const frontierKeyword = takeFirst(params.frontierKeyword) ?? "";

  const insights = await getHomeInsights({
    source,
    frontierDiscipline,
    frontierWindowYears: frontierYears,
    frontierKeyword
  });

  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker
        category="前沿发现"
        href={`/analysis/frontier?${new URLSearchParams({
          ...(source ? { source } : {}),
          ...(frontierDiscipline ? { frontierDiscipline } : {}),
          ...(frontierYears ? { frontierYears: String(frontierYears) } : {}),
          ...(frontierKeyword ? { frontierKeyword } : {})
        }).toString()}`}
        title={frontierKeyword ? `前沿发现：${frontierKeyword}` : "前沿发现"}
      />

      <SubpageTopNav currentPath="/analysis/frontier" />

      <section className="search-workbench analysis-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>前沿发现</h1>
            <p>按来源、学科分类、分析时段和关键词筛选，结果以词云和关键词共现图谱形式展示。</p>
          </div>
        </div>

        <form action="/analysis/frontier" className="analysis-filter analysis-filter--page">
          <label className="field">
            <span>来源</span>
            <select defaultValue={insights.filterSource} name="source">
              {insightSources.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>学科分类</span>
            <select defaultValue={insights.frontier.discipline} name="frontierDiscipline">
              <option value="">全部学科</option>
              {DISCIPLINE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>分析时段</span>
            <select defaultValue={String(insights.frontier.windowYears)} name="frontierYears">
              {rangeOptions.map((item) => (
                <option key={`frontier-${item}`} value={item}>
                  近 {item} 年
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>关键词</span>
            <input
              defaultValue={insights.frontier.keyword}
              name="frontierKeyword"
              placeholder="输入主题词聚焦前沿图谱"
              type="text"
            />
          </label>

          <button className="primary-button" type="submit">
            检索前沿图谱
          </button>
        </form>
      </section>

      <section className="analysis-panel analysis-panel--page">
        <div className="analysis-caption analysis-caption--page">
          当前范围：{insights.sourceLabel} / {insights.frontier.discipline || "全部学科"} / {insights.frontier.rangeLabel}
          {insights.frontier.keyword ? ` / 关键词：${insights.frontier.keyword}` : ""}
        </div>

        <div className="cloud-card cloud-card--page">
          {insights.frontier.cloudTerms.map((item, index) => (
            <Link
              key={`${item.term}-${index}`}
              className={`cloud-chip cloud-chip--${index % 5}`}
              href={buildProjectsLink(
                insights.filterSource,
                item.searchText,
                undefined,
                insights.frontier.discipline || undefined
              )}
            >
              <span>{item.term}</span>
              <em>{item.count}</em>
            </Link>
          ))}
        </div>

        <FrontierGraph filterSource={insights.filterSource} frontier={insights.frontier} />

        <div className="graph-legend graph-legend--page">
          <span>节点大小表示主题出现频次</span>
          <span>连线粗细表示关键词共现强度</span>
          <span>点击节点可进入对应项目检索结果</span>
        </div>
      </section>

      <SubpageFooterNav currentPath="/analysis/frontier" />
    </main>
  );
}
