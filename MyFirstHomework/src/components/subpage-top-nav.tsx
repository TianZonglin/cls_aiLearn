import Link from "next/link";

const navItems = [
  { label: "项目检索", href: "/projects" },
  { label: "成果查询", href: "/outcomes" },
  { label: "热点分析", href: "/analysis/hot" },
  { label: "前沿发现", href: "/analysis/frontier" },
  { label: "项目通知", href: "/notices" },
  { label: "浏览记录", href: "/history" },
  { label: "用户互动", href: "/community" }
];

interface SubpageTopNavProps {
  currentPath: string;
}

export function SubpageTopNav({ currentPath }: SubpageTopNavProps) {
  return (
    <div className="subpage-topbar">
      <Link className="subpage-topbar__brand" href="/">
        <span className="subpage-topbar__mark">FR</span>
        <span className="subpage-topbar__brand-text">
          <strong>基金课题项目查询</strong>
          <em>Fund Research Navigator</em>
        </span>
      </Link>

      <nav className="subpage-topbar__nav" aria-label="子页面导航">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={item.href === currentPath ? "subpage-topbar__link--active" : undefined}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="subpage-topbar__home" href="/">
        返回首页
      </Link>
    </div>
  );
}
