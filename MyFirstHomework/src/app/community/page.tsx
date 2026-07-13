import Link from "next/link";
import { HistoryTracker } from "@/components/history-tracker";
import { CommunityBoard } from "@/components/community-board";
import { SubpageFooterNav } from "@/components/subpage-footer-nav";
import { SubpageTopNav } from "@/components/subpage-top-nav";

const discussions = [
  {
    id: "community-001",
    date: "2026-07-08",
    title: "教育数字化方向近两年还有哪些选题值得继续跟踪？",
    author: "王老师 / 华中师范大学",
    content:
      "我最近在看国家社科和教育部项目，发现教育数字化、人工智能赋能教学这类题目很多，但表述方式差异较大。想请教大家，除了“教育数字化转型”这个总主题，还有哪些更细的切口值得继续追踪？",
    replies: [
      {
        author: "李老师 / 湖南大学",
        time: "2026-07-08 10:32",
        content:
          "可以拆到教师发展、课堂评价、区域教育治理、数字鸿沟等方向。很多项目标题不会直接写“数字化转型”，但会落在这些具体问题里。"
      },
      {
        author: "赵博士 / 南京师范大学",
        time: "2026-07-08 14:05",
        content:
          "建议同时关注“生成式人工智能”“智能教育评价”“教育高质量发展”几个词组，它们在近两年项目标题里出现频率明显提升。"
      }
    ]
  },
  {
    id: "community-002",
    date: "2026-07-06",
    title: "高校思政类项目检索时，学科分类应该怎么选更稳妥？",
    author: "陈老师 / 广西师范大学",
    content:
      "同一批题目有的归到马克思主义/思想政治教育，有的又落到教育学或者政治学。为了避免漏检，大家一般怎么组合检索条件？",
    replies: [
      {
        author: "周老师 / 山东大学",
        time: "2026-07-06 09:18",
        content:
          "第一轮先用题名关键词 + 来源 + 年份，不加学科分类；第二轮再分别切马克思主义/思想政治教育、教育学、政治学做交叉补查。"
      },
      {
        author: "平台整理",
        time: "2026-07-06 11:47",
        content:
          "如果你的目标是尽量查全，建议保留“工作单位”条件，把题名关键词和单位一起用，比一开始就限定单一学科更稳。"
      }
    ]
  },
  {
    id: "community-003",
    date: "2026-07-03",
    title: "前沿发现里的关键词图谱，大家更希望看到哪些分析维度？",
    author: "项目组",
    content:
      "我们正在优化前沿发现模块。除了当前的关键词共现展示外，想听听大家是否还需要按学科、按年份或按来源分层查看。",
    replies: [
      {
        author: "孙博士 / 西南大学",
        time: "2026-07-03 16:20",
        content:
          "最好能切换 1 年、2 年、3 年三个时间窗口，因为短周期和长周期看出来的热点不一样。"
      },
      {
        author: "何老师 / 郑州大学",
        time: "2026-07-03 18:06",
        content:
          "我更需要“点击某个关键词后，直接联动到对应项目列表”，这样从图谱回到原始题目会方便很多。"
      }
    ]
  }
];

export default function CommunityPage() {
  return (
    <main className="page-shell page-shell--wide page-shell--results">
      <HistoryTracker category="用户互动" href="/community" title="用户互动" />

      <SubpageTopNav currentPath="/community" />

      <section className="search-workbench">
        <div className="search-workbench__top">
          <div>
            <h1>用户互动</h1>
            <p>浏览提问、交流检索经验、对比选题趋势，也可把常见问题沉淀为后续功能优化的依据。</p>
          </div>
        </div>
      </section>

      <section className="results-panel results-panel--list">
        <div className="results-panel__summary results-panel__summary--list">
          <div>
            <h2>最新讨论</h2>
            <p>支持查看主题与回帖，也支持在当前浏览器内继续新增评论。</p>
          </div>
        </div>

        <CommunityBoard discussions={discussions} />
      </section>

      <SubpageFooterNav currentPath="/community" />
    </main>
  );
}
