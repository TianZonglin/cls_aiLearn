import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "基金课题项目查询工具",
  description: "面向科研工作者的省部级以上基金课题项目统一检索与分析工具。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
