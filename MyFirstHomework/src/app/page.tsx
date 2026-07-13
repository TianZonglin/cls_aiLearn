import Link from "next/link";
import { SearchForm } from "@/components/search-form";

const checklist = [
  "统一检索教育部、国家社科基金等公开来源项目",
  "支持按课题名称、学科分类、工作单位、来源、年份组合筛选",
  "支持项目检索、成果查询、热点分析、前沿发现等多种浏览方式"
];

const quickLinks = [
  { label: "项目检索", href: "/projects" },
  { label: "成果查询", href: "/outcomes" },
  { label: "热点分析", href: "/analysis/hot" },
  { label: "前沿发现", href: "/analysis/frontier" },
  { label: "项目通知", href: "/notices" },
  { label: "浏览记录", href: "/history" },
  { label: "用户互动", href: "/community" }
];

const mainLinks = [
  {
    title: "项目检索",
    desc: "统一定位基金项目",
    href: "/projects"
  },
  {
    title: "热点分析",
    desc: "查看近年立项主题变化",
    href: "/analysis/hot"
  },
  {
    title: "前沿发现",
    desc: "观察关键词共现与扩散",
    href: "/analysis/frontier"
  }
];

const extensionLinks = [
  {
    title: "成果查询",
    desc: "从项目进入成果线索",
    href: "/outcomes"
  },
  {
    title: "项目通知",
    desc: "浏览官方申报通知",
    href: "/notices"
  },
  {
    title: "浏览记录",
    desc: "回看最近访问内容",
    href: "/history"
  },
  {
    title: "用户互动",
    desc: "沉淀建议与研究交流",
    href: "/community"
  }
];

export default async function HomePage() {
  return (
    <main className="page-shell page-shell--wide page-shell--dashboard">
      <header className="site-header">
        <div className="site-header__brand">
          <span className="site-header__mark">FR</span>
          <div>
            <strong>基金课题项目查询</strong>
            <span>Fund Research Navigator</span>
          </div>
        </div>

        <nav className="site-header__nav" aria-label="站点导航">
          <Link href="/">首页</Link>
          <Link href="/projects">项目检索</Link>
          <Link href="/outcomes">成果查询</Link>
          <Link href="/analysis/hot">热点分析</Link>
          <Link href="/analysis/frontier">前沿发现</Link>
          <Link href="/notices">项目通知</Link>
          <Link href="/history">浏览记录</Link>
          <Link href="/community">用户互动</Link>
        </nav>
      </header>

      <section className="hero-banner hero-banner--site">
        <div className="hero-banner__content hero-banner__content--portal">
          <div className="hero-banner__main">
            <span className="eyebrow">Research Navigator</span>
            <h1>基金课题项目统一检索与分析平台</h1>
            <p className="lead lead--compact">
              面向科研工作者的基金项目检索入口，支持按课题名称、学科分类、工作单位、来源与立项年份进行统一筛选。
            </p>

            <div className="hero-banner__search-panel hero-banner__search-panel--portal">
              <div className="portal-search-head">
                <strong>检索中心</strong>
              </div>
              <SearchForm />
            </div>
          </div>
        </div>
      </section>

      <section className="site-sections site-sections--portal" aria-label="功能入口">
        <div className="site-sections__header site-sections__header--compact">
          <div>
            <span className="insight-kicker">Main Functions</span>
            <h2>主要功能</h2>
          </div>
        </div>

        <div className="site-link-strips">
          {mainLinks.map((item) => (
            <Link key={item.title} className="site-link-strip" href={item.href}>
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </Link>
          ))}
        </div>

        <div className="site-sections__header site-sections__header--compact">
          <div>
            <span className="insight-kicker">Extended Services</span>
            <h2>扩展服务</h2>
          </div>
        </div>

        <div className="site-link-strips site-link-strips--four">
          {extensionLinks.map((item) => (
            <Link
              key={item.title}
              className="site-link-strip site-link-strip--muted"
              href={item.href}
            >
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="portal-footer portal-footer--stacked">
        <div className="portal-footer__group">
          <b>快速入口</b>
          <div className="portal-footer__links">
            {quickLinks.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="portal-footer__group">
          <b>功能说明</b>
          <div className="portal-footer__notes">
            {checklist.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
