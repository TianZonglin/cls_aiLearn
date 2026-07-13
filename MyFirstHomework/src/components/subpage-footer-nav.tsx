import Link from "next/link";

const quickLinks = [
  { label: "首页", href: "/" },
  { label: "项目检索", href: "/projects" },
  { label: "成果查询", href: "/outcomes" },
  { label: "热点分析", href: "/analysis/hot" },
  { label: "前沿发现", href: "/analysis/frontier" },
  { label: "项目通知", href: "/notices" },
  { label: "浏览记录", href: "/history" },
  { label: "用户互动", href: "/community" }
];

interface SubpageFooterNavProps {
  currentPath: string;
}

export function SubpageFooterNav({ currentPath }: SubpageFooterNavProps) {
  return (
    <footer className="portal-footer portal-footer--subpage">
      <div className="portal-footer__group">
        <b>快速入口</b>
        <div className="portal-footer__links">
          {quickLinks.map((item) => (
            <Link
              key={item.label}
              className={item.href === currentPath ? "portal-footer__link--active" : undefined}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
