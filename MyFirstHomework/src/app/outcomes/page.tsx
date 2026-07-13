import Link from "next/link";
import { HistoryTracker } from "@/components/history-tracker";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";

const sections = [
  {
    title: "成果检索",
    description: "按项目名称、批准号、负责人、单位和成果类型进入详细检索。",
    href: "/outcomes/search"
  },
  {
    title: "关联项目定位",
    description: "优先根据项目名称和批准号定位基金项目，再聚合成果线索。",
    href: "/outcomes/search"
  },
  {
    title: "外部平台入口",
    description: "为成果线索补充知网、读秀、万方与原始来源等继续查看入口。",
    href: "/outcomes/search"
  }
];

export default function OutcomesLandingPage() {
  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker category="成果查询" href="/outcomes" title="成果查询" />

      <SubpageTopNav currentPath="/outcomes" />

      <section className="search-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>成果查询</h1>
            <p>
              成果查询模块用于围绕基金项目发现论文、著作与结项成果线索。当前提供项目驱动的成果发现，不提供全文抓取与下载。
            </p>
          </div>
        </div>
      </section>

      <section className="results-panel results-panel--list">
        <div className="results-panel__summary results-panel__summary--list">
          <div>
            <h2>成果查询入口</h2>
            <p>先进入详细检索页，再查看匹配项目、成果线索与外部平台跳转入口。</p>
          </div>
          <Link className="primary-button primary-button--inline" href="/outcomes/search">
            进入详细成果检索
          </Link>
        </div>

        <div className="landing-columns">
          {sections.map((item) => (
            <Link key={item.title} className="landing-column" href={item.href}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="outcome-notice">
          <strong>边界说明</strong>
          <p>
            当前仅提供成果线索和外部平台入口。全文查看需前往原平台，并可能受机构权限、登录状态或平台访问规则影响。
          </p>
        </div>
      </section>

      <SubpageFooterNav currentPath="/outcomes" />
    </main>
  );
}
