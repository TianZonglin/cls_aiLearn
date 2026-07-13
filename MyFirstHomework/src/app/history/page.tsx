import Link from "next/link";
import { HistoryPanel } from "@/components/history-panel";
import { HistoryTracker } from "@/components/history-tracker";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";

export default function HistoryPage() {
  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker category="浏览记录" href="/history" title="我的浏览记录" />

      <SubpageTopNav currentPath="/history" />

      <section className="search-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>我的浏览记录</h1>
            <p>自动保存当前浏览器中访问过的检索页、分析页、通知页等内容，方便回看最近浏览过的信息。</p>
          </div>
        </div>
      </section>

      <HistoryPanel />
      <SubpageFooterNav currentPath="/history" />
    </main>
  );
}
