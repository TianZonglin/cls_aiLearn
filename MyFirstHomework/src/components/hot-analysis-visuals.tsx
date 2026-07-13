"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HotInsightBlock } from "@/lib/home-insights";

interface HotAnalysisVisualsProps {
  hot: HotInsightBlock;
  filterSource: string;
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

export function HotAnalysisVisuals({ hot, filterSource }: HotAnalysisVisualsProps) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [hoverText, setHoverText] = useState<string>("");

  const maxYearTotal = useMemo(
    () => Math.max(...hot.yearSummaries.map((entry) => entry.total), 1),
    [hot.yearSummaries]
  );

  const selectedTerm = activeTerm ?? hot.hotCloudTerms[0]?.term ?? null;
  const cloudPositions = useMemo(
    () =>
      hot.hotCloudTerms.map((item, index, array) => {
        const total = Math.max(array.length, 1);
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const radius = index % 2 === 0 ? 34 : 43;
        const left = 50 + Math.cos(angle) * radius;
        const top = 50 + Math.sin(angle) * radius;
        return {
          ...item,
          left,
          top
        };
      }),
    [hot.hotCloudTerms]
  );

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span>覆盖项目数</span>
          <strong>{hot.totalInRange}</strong>
        </div>
        <div className="stat-card">
          <span>热点主题数</span>
          <strong>{hot.hotCloudTerms.length}</strong>
        </div>
        <div className="stat-card">
          <span>统计年份数</span>
          <strong>{hot.yearSummaries.length}</strong>
        </div>
      </div>

      <div className="hot-visual-grid">
        <section className="visual-card">
          <div className="visual-card__title">年度立项柱状图</div>
          <div className="bar-chart">
            {hot.yearSummaries.map((item) => (
              <Link
                key={`year-bar-${item.year}`}
                className={`bar-chart__item ${selectedTerm ? "bar-chart__item--interactive" : ""}`}
                href={buildProjectsLink(
                  filterSource,
                  hot.keyword || selectedTerm || undefined,
                  item.year,
                  hot.discipline || undefined
                )}
                onMouseEnter={() => {
                  setHoverText(`${item.year} 年立项 ${item.total} 项`);
                }}
                onMouseLeave={() => setHoverText("")}
              >
                <div className="bar-chart__track">
                  <div
                    className="bar-chart__bar"
                    style={{ height: `${Math.max(12, Math.round((item.total / maxYearTotal) * 100))}%` }}
                  />
                </div>
                <strong>{item.total}</strong>
                <span>{item.year}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="visual-card">
          <div className="visual-card__title">学科占比环图</div>
          <div className="ring-layout">
            <div
              className="ring-chart"
              style={{
                background: `conic-gradient(${hot.disciplineShares
                  .map((item, index, array) => {
                    const start =
                      array.slice(0, index).reduce((sum, current) => sum + current.ratio, 0) * 360;
                    const end = start + item.ratio * 360;
                    const palette = [
                      "#234f3d",
                      "#b96b37",
                      "#7f9b8c",
                      "#d09b62",
                      "#587b69",
                      "#c6b18d"
                    ];
                    return `${palette[index % palette.length]} ${start}deg ${end}deg`;
                  })
                  .join(", ")})`
              }}
            >
              <div className="ring-chart__center">
                <strong>{hot.totalInRange}</strong>
                <span>项目</span>
              </div>
            </div>

            <div className="ring-legend">
              {hot.disciplineShares.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="ring-legend__item"
                  onMouseEnter={() => {
                    setHoverText(`${item.label} 占比 ${Math.round(item.ratio * 100)}%，共 ${item.count} 项`);
                  }}
                  onMouseLeave={() => setHoverText("")}
                >
                  <i className={`ring-legend__dot ring-legend__dot--${index % 6}`} />
                  <span>{item.label}</span>
                  <strong>{Math.round(item.ratio * 100)}%</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="visual-card visual-card--full">
        <div className="visual-card__title">环形热点词云</div>
        <div className="ring-cloud-wrap">
          <div className="ring-cloud-tip">
            {hoverText || (selectedTerm ? `当前高亮：${selectedTerm}` : "将鼠标移到热点词上查看说明")}
          </div>
          <div className="ring-cloud">
            {cloudPositions.map((item, index) => {
              const isActive = selectedTerm === item.term;
              return (
                <Link
                  key={`${item.term}-${index}`}
                  className={`ring-cloud__item ring-cloud__item--${index % 6} ${
                    isActive ? "ring-cloud__item--active" : ""
                  }`}
                  href={buildProjectsLink(
                    filterSource,
                    hot.keyword || item.searchText,
                    undefined,
                    hot.discipline || undefined
                  )}
                  onMouseEnter={() => {
                    setActiveTerm(item.term);
                    setHoverText(`${item.term}：出现 ${item.count} 次，点击查看检索结果`);
                  }}
                  onMouseLeave={() => setHoverText("")}
                  onFocus={() => {
                    setActiveTerm(item.term);
                    setHoverText(`${item.term}：出现 ${item.count} 次，点击查看检索结果`);
                  }}
                  onBlur={() => setHoverText("")}
                  style={{
                    left: `${item.left}%`,
                    top: `${item.top}%`
                  }}
                  title={`查看“${item.term}”相关项目`}
                >
                  <span>{item.term}</span>
                  <em>{item.count}</em>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="heatmap-card heatmap-card--page">
        <div className="heatmap-grid heatmap-grid--header">
          <div className="heatmap-corner">年份 / 选题</div>
          {hot.hotTerms.map((term) => (
            <button
              key={term}
              className={`heatmap-column-title heatmap-column-title--button ${
                selectedTerm === term ? "heatmap-column-title--active" : ""
              }`}
              onClick={() => setActiveTerm(term)}
              onMouseEnter={() => setHoverText(`高亮查看 ${term} 在不同年份的热度分布`)}
              onMouseLeave={() => setHoverText("")}
              type="button"
            >
              {term}
            </button>
          ))}
        </div>

        {hot.yearSummaries.map((summary) => (
          <div key={summary.year} className="heatmap-grid">
            <div className="heatmap-row-title">{summary.year}</div>
            {hot.hotTerms.map((term) => {
              const cell = hot.hotMatrix.find((item) => item.year === summary.year && item.term === term);
              const isActive = selectedTerm === term;
              return (
                <Link
                  key={`${summary.year}-${term}`}
                  className={`heatmap-cell ${isActive ? "heatmap-cell--active" : "heatmap-cell--dim"}`}
                  href={buildProjectsLink(
                    filterSource,
                    hot.keyword || cell?.searchText,
                    summary.year,
                    hot.discipline || undefined
                  )}
                  onMouseEnter={() => {
                    setHoverText(`${summary.year} 年“${term}”相关项目 ${cell?.count ?? 0} 项`);
                  }}
                  onMouseLeave={() => setHoverText("")}
                  style={{
                    opacity: isActive
                      ? Math.max(0.45, cell?.intensity ?? 0.18)
                      : Math.max(0.12, (cell?.intensity ?? 0.08) * 0.55),
                    transform: `scale(${isActive ? 1.03 : 0.96 + (cell?.intensity ?? 0) * 0.05})`
                  }}
                  title={`${summary.year} / ${term} / ${cell?.count ?? 0} 项`}
                >
                  <span>{cell?.count ?? 0}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
