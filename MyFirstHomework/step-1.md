# Step 1 - 基础工程与运行骨架

## 目标
搭建项目的最小可运行工程骨架，保证后续开发可以在统一目录结构、统一语言和统一依赖管理下继续推进。

## 输入
- [design.md](C:\Users\admin\Documents\yangjingjing\design.md) 中的技术栈和目录结构约定
- 空仓库或未初始化的项目根目录
- 本地可用的 Node.js 和 npm 环境

## 输出
- 可启动的 `Next.js + TypeScript` 项目
- 符合设计文档的基础目录结构
- 基础依赖安装完成
- `.env.example` 或等价环境变量样例
- `package.json` 中可执行的基础脚本
- 可访问的空白首页

## 不做内容
- 不创建数据库表
- 不实现抓取逻辑
- 不实现查询接口
- 不实现业务页面
- 不处理生产部署

## 实现要求
- 使用 `Next.js` 作为统一前后端框架。
- 使用 `TypeScript`，并开启基础类型检查。
- 建立以下目录：`prisma/`、`scripts/`、`src/app/`、`src/components/`、`src/lib/`、`src/crawlers/`、`src/types/`、`logs/`。
- 安装并记录首版所需核心依赖，至少包含：
  - `next`
  - `react`
  - `react-dom`
  - `typescript`
  - `prisma`
  - `@prisma/client`
  - `playwright`
  - `cheerio`
- 提供基础环境变量说明，至少包含数据库连接项。
- 在 `package.json` 中提供基础脚本，至少包含：
  - `dev`
  - `build`
  - `typecheck`
- 项目启动后应能返回一个简单首页，证明工程骨架有效。

## 校验方式
- 执行依赖安装命令成功。
- 执行 `npm run dev` 成功。
- 执行 `npm run build` 或 `npm run typecheck` 成功。
- 浏览器访问首页返回正常页面而非报错页。
- 核对目录结构与设计文档一致。
- `package.json` 中能看到约定的基础脚本。

## 完成标准
- 新成员拿到仓库后，按文档执行即可在本地启动项目。
- 后续步骤无需再调整根级工程结构。
- 工程已具备承接数据库、抓取、接口和页面开发的基础条件。
- 后续步骤引用到的基础目录和基础脚本均已存在。
