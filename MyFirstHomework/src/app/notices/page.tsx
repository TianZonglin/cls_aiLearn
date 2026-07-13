import Link from "next/link";
import { HistoryTracker } from "@/components/history-tracker";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";

const noticeSources = [
  {
    title: "教育部人文社会科学研究项目",
    org: "教育部社科司",
    description: "查看教育部人文社会科学研究一般项目、青年项目、西部项目等申报通知与公示入口。",
    href: "https://www.moe.gov.cn/s78/A13/"
  },
  {
    title: "全国哲学社会科学工作办公室",
    org: "国家社科基金",
    description: "查看国家社科基金年度项目、后期资助项目、冷门绝学项目等官方通知入口。",
    href: "http://www.nopss.gov.cn/"
  },
  {
    title: "国家自然科学基金委员会",
    org: "NSFC",
    description: "查看国家自然科学基金集中受理、专项项目与管理通知等官方入口。",
    href: "https://www.nsfc.gov.cn/"
  }
];

export default function NoticesPage() {
  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker category="项目通知" href="/notices" title="项目通知" />

      <SubpageTopNav currentPath="/notices" />

      <section className="search-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>项目通知</h1>
            <p>集中浏览各类基金项目申报通知、公告入口与官方发布渠道，便于从检索转到申报信息查看。</p>
          </div>
        </div>
      </section>

      <section className="results-panel results-panel--list">
        <div className="results-panel__summary results-panel__summary--list">
          <div>
            <h2>官方通知入口</h2>
            <p>当前先聚合常用官方入口，后续可继续扩展到年度通知抓取与申报日历。</p>
          </div>
        </div>

        <div className="notice-grid">
          {noticeSources.map((item) => (
            <article key={item.title} className="notice-card">
              <span className="notice-card__org">{item.org}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a className="table-link" href={item.href} rel="noreferrer" target="_blank">
                打开官网入口
              </a>
            </article>
          ))}
        </div>
      </section>

      <SubpageFooterNav currentPath="/notices" />
    </main>
  );
}
