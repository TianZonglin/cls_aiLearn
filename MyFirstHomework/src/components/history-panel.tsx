"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { historyStorageKey, type HistoryEntry } from "@/components/history-tracker";

export function HistoryPanel() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(historyStorageKey);
    const parsed = raw ? ((JSON.parse(raw) as HistoryEntry[]) ?? []) : [];
    setItems(parsed);
  }, []);

  if (items.length === 0) {
    return (
      <section className="empty-state">
        <h2>暂无浏览记录</h2>
        <p>当你访问检索结果页、分析页或通知页后，这里会自动保存最近记录。</p>
      </section>
    );
  }

  return (
    <section className="results-panel results-panel--list">
      <div className="results-panel__summary results-panel__summary--list">
        <div>
          <h2>最近浏览</h2>
          <p>已为当前浏览器保存最近 {items.length} 条访问记录。</p>
        </div>
      </div>

      <div className="history-list">
        {items.map((item) => (
          <Link key={item.id} className="history-row" href={item.href}>
            <div className="history-row__main">
              <strong>{item.title}</strong>
              <span>{item.category}</span>
            </div>
            <em>{new Date(item.visitedAt).toLocaleString("zh-CN")}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}
