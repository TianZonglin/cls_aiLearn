"use client";

import { useEffect } from "react";

export interface HistoryEntry {
  id: string;
  title: string;
  href: string;
  category: string;
  visitedAt: string;
}

interface HistoryTrackerProps {
  title: string;
  href: string;
  category: string;
}

const STORAGE_KEY = "fund-research-history";

export function HistoryTracker({ title, href, category }: HistoryTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextEntry: HistoryEntry = {
      id: `${href}::${category}`,
      title,
      href,
      category,
      visitedAt: new Date().toISOString()
    };

    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing = raw ? ((JSON.parse(raw) as HistoryEntry[]) ?? []) : [];
    const deduped = existing.filter((item) => item.id !== nextEntry.id);
    const merged = [nextEntry, ...deduped].slice(0, 30);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, [category, href, title]);

  return null;
}

export const historyStorageKey = STORAGE_KEY;
