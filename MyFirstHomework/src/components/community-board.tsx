"use client";

import { useMemo, useState } from "react";

interface ReplyItem {
  author: string;
  time: string;
  content: string;
}

interface DiscussionItem {
  id: string;
  date: string;
  title: string;
  author: string;
  content: string;
  replies: ReplyItem[];
}

interface CommunityBoardProps {
  discussions: DiscussionItem[];
}

const STORAGE_KEY = "fund-research-community-replies";

type ReplyStore = Record<string, ReplyItem[]>;

export function CommunityBoard({ discussions }: CommunityBoardProps) {
  const [replyStore, setReplyStore] = useState<ReplyStore>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? ((JSON.parse(raw) as ReplyStore) ?? {}) : {};
    } catch {
      return {};
    }
  });

  const [drafts, setDrafts] = useState<Record<string, { author: string; content: string }>>({});

  const mergedDiscussions = useMemo(() => {
    return discussions.map((item) => ({
      ...item,
      replies: [...item.replies, ...(replyStore[item.id] ?? [])]
    }));
  }, [discussions, replyStore]);

  function updateDraft(id: string, field: "author" | "content", value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        author: current[id]?.author ?? "",
        content: current[id]?.content ?? "",
        [field]: value
      }
    }));
  }

  function submitReply(id: string) {
    const author = drafts[id]?.author?.trim() || "新用户";
    const content = drafts[id]?.content?.trim();

    if (!content) {
      return;
    }

    const nextReply: ReplyItem = {
      author,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
      content
    };

    setReplyStore((current) => {
      const next = {
        ...current,
        [id]: [...(current[id] ?? []), nextReply]
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setDrafts((current) => ({
      ...current,
      [id]: {
        author: current[id]?.author ?? "",
        content: ""
      }
    }));
  }

  return (
    <div className="discussion-list">
      {mergedDiscussions.map((item) => (
        <article key={item.id} className="discussion-card">
          <div className="discussion-card__meta">
            <span>{item.date}</span>
            <span>{item.author}</span>
          </div>

          <h3>{item.title}</h3>

          <div className="discussion-card__section">
            <b>提问内容</b>
            <p>{item.content}</p>
          </div>

          <div className="discussion-card__section">
            <b>回帖</b>
            <div className="discussion-replies">
              {item.replies.map((reply, index) => (
                <div key={`${item.id}-${reply.author}-${reply.time}-${index}`} className="discussion-reply">
                  <div className="discussion-reply__meta">
                    <strong>{reply.author}</strong>
                    <span>{reply.time}</span>
                  </div>
                  <p>{reply.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="discussion-card__section">
            <b>我要跟帖</b>
            <div className="discussion-form">
              <input
                className="discussion-form__input"
                type="text"
                placeholder="请输入昵称或单位"
                value={drafts[item.id]?.author ?? ""}
                onChange={(event) => updateDraft(item.id, "author", event.target.value)}
              />
              <textarea
                className="discussion-form__textarea"
                placeholder="请输入你的评论内容"
                value={drafts[item.id]?.content ?? ""}
                onChange={(event) => updateDraft(item.id, "content", event.target.value)}
              />
              <div className="discussion-form__actions">
                <button className="primary-button primary-button--inline" type="button" onClick={() => submitReply(item.id)}>
                  提交评论
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
