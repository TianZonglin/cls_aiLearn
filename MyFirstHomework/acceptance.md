# MVP 验收记录

## 当前结论
当前版本已完成 `step-5`、`step-6`、`step-7`、`step-8` 的首版闭环，项目达到“可演示、可继续迭代”的状态。

## 已完成能力
- 已接入教育部人文社科项目真实来源，覆盖 `2021-2025` 年年度附件。
- 已接入国家社科基金真实来源，当前落地为 `2011` 年艺术学项目官方 XLS 附件。
- 已支持统一抓取入口：`npm run crawl`
- 已支持单来源抓取入口：
  - `npm run crawl:moe`
  - `npm run crawl:npopss`
- 已支持统一列表接口：`GET /api/projects`
- 已支持详情接口：`GET /api/projects/:id`
- 已支持关键词、来源、年份、分页查询
- 已支持详情页读取完整字段
- 已支持原始来源链接跳转
- 已支持本地抓取记录文件
- 已支持无数据库环境下的本地快照查询

## 本次校验结果

### 抓取
- `npm.cmd run crawl:moe` 成功
- `npm.cmd run crawl:npopss` 成功
- `npm.cmd run crawl` 成功
- 教育部来源抓取结果：
  - 年度页：5
  - PDF 附件：30
  - 项目记录：15233
- 国家社科基金来源抓取结果：
  - XLS 附件：1
  - 项目记录：142

### 接口
- `GET /api/projects?page=1&pageSize=3` 返回 `200`
- `GET /api/projects?source=moe&year=2025&page=1&pageSize=2` 返回 `200`
- `GET /api/projects?source=npopss&page=1&pageSize=2` 返回 `200`
- `GET /api/projects?q=艺术&page=1&pageSize=2` 返回 `200`
- `GET /api/projects?source=bad` 返回 `400`
- `GET /api/projects?year=20ab` 返回 `400`
- `GET /api/projects?page=abc` 返回 `400`
- `GET /api/projects/npopss-11CC094` 返回 `200`
- `GET /api/projects/not-found-id` 返回 `404`

### 构建与类型检查
- `npm.cmd run typecheck` 成功
- `npm.cmd run build` 成功

## 演示路径
1. 执行 `npm run crawl`
2. 执行 `npm run dev`
3. 打开 `http://localhost:3000`
4. 在首页输入关键词，例如 `艺术`
5. 进入结果页后切换来源为 `国家社科基金`
6. 再切换来源为 `教育部人文社科项目`
7. 点击任一记录进入详情页
8. 点击详情页中的原始来源链接进行回源验证

## 已知限制
- 当前没有配置 `DATABASE_URL`，因此真实数据保存在本地快照文件中，而不是 PostgreSQL。
- 第二来源当前只接入了一个官方可稳定解析的历史年度 XLS 样本，后续仍可继续扩展更多年度。
- 国家社科基金新版部分 PDF 附件结构不稳定，当前未作为主解析链路。
- 抓取仍为手动触发，尚未加入定时调度。
- 前端页面样式保持了 MVP 水平，重点在可用性而非视觉精修。

## 输出文件
- 项目快照：`data/projects.snapshot.json`
- 抓取记录：`data/crawl-runs.json`
- 抓取日志：`logs/crawler.log`

## 后续建议
- 优先为国家社科基金补更多年度附件来源
- 接入真实 PostgreSQL，切换为数据库主存储
- 为抓取记录增加查看接口或简单管理页
- 增加页面层的请求失败提示和加载态展示
