# 详细设计文档

## 1. 项目背景

科研工作者在查询基金课题项目时，往往需要分别访问教育部、国家社科基金等多个站点，重复输入检索条件并手动对比结果。现有公开入口存在以下问题：

- 查询入口分散
- 字段命名不统一
- 横向对比不方便
- 检索后继续做热点、前沿、成果分析时需要跳转多个页面

本项目希望通过一个本地可运行的原型系统，先把“统一检索 + 初步分析 + 继续跳转”这条主链路做通。

## 2. 项目目标

当前版本目标：

- 提供统一项目检索入口
- 支持按课题名称、学科分类、工作单位、来源、年份筛选
- 提供热点分析与前沿发现页面
- 提供成果查询入口和成果线索展示
- 提供通知入口、浏览记录和轻量互动页面
- 在无数据库场景下也能依赖本地快照运行

## 3. 目标用户

- 高校教师
- 科研院所研究人员
- 科研管理与项目辅助人员
- 需要做选题分析、项目对比、趋势观察的研究人员

## 4. 使用流程

### 4.1 项目检索流程

1. 用户打开首页
2. 输入课题名称
3. 选择学科分类
4. 输入工作单位
5. 选择来源与立项年份
6. 点击检索
7. 系统展示结果列表

### 4.2 热点分析流程

1. 用户进入热点分析页
2. 选择来源、学科分类、分析时段
3. 可输入关键词
4. 点击检索
5. 系统展示词云、柱状图、热力分布

### 4.3 前沿发现流程

1. 用户进入前沿发现页
2. 选择来源、学科分类、分析时段
3. 可输入关键词
4. 点击检索
5. 系统展示词云与图谱

### 4.4 成果查询流程

1. 用户进入成果查询页
2. 输入项目名称、批准号、负责人或单位
3. 选择成果类型等条件
4. 系统展示成果线索和外部入口

## 5. 功能清单

### 5.1 Must Have

- 首页统一入口
- 项目检索表单
- 项目结果列表
- 来源筛选
- 年份筛选
- 热点分析页面
- 前沿发现页面
- 成果查询页面
- 项目通知页
- 浏览记录页
- 用户互动页
- 本地快照读取
- API 查询接口

### 5.2 Should Have

- 关键词聚焦分析
- 热点词云跳转到项目检索结果
- 前沿图谱节点跳转到项目检索结果
- 成果查询中的外部平台入口
- 本地评论输入与保存

### 5.3 Could Have

- 更多基金来源
- 更完整的成果线索来源
- 历史抓取数据自动清洗
- 更复杂的图谱联动

### 5.4 Won't Have Now

- 登录系统
- 支付系统
- 后台管理
- 导出 Excel/CSV
- 全文论文抓取
- 第三方平台全文下载
- 权限体系

## 6. 技术栈

- 前端：`Next.js 16`、`React 19`
- 语言：`TypeScript`
- 样式：自定义 `CSS`
- 接口：`Next.js Route Handlers`
- 数据层：`Prisma`（为后续入库与扩展预留）
- 数据库：`PostgreSQL`（可选）
- 抓取工具：`Cheerio`、`Playwright`、`pdf-parse`、`xlsx`
- 当前原型主数据源：本地 `JSON` 快照

## 7. 目录结构

```text
.
├─ README.md
├─ design.md
├─ acceptance.md
├─ step-1.md ~ step-12.md
├─ data/
├─ prisma/
├─ scripts/
└─ src/
   ├─ app/
   │  ├─ page.tsx
   │  ├─ projects/
   │  ├─ analysis/
   │  ├─ outcomes/
   │  ├─ notices/
   │  ├─ history/
   │  ├─ community/
   │  └─ api/
   ├─ components/
   ├─ crawlers/
   ├─ lib/
   └─ types/
```

## 8. 数据结构

### 8.1 项目数据结构

字段：

- `id`
- `source`
- `sourceProjectId`
- `title`
- `principalInvestigator`
- `institution`
- `discipline`
- `fundType`
- `year`
- `projectNumber`
- `status`
- `keywords`
- `summary`
- `sourceUrl`
- `sourceRaw`
- `createdAt`
- `updatedAt`

### 8.2 成果线索数据结构

字段：

- `id`
- `title`
- `authors`
- `outcomeType`
- `outcomeTypeLabel`
- `publishYear`
- `publisherOrJournal`
- `sourcePlatform`
- `sourceUrl`
- `abstractText`
- `matchedProjectId`
- `matchedProjectTitle`
- `matchedProjectNumber`
- `matchedBy`
- `confidenceScore`
- `confidenceLevel`
- `confidenceLabel`
- `externalLinks`

## 9. 接口设计

### 9.1 项目检索接口

`GET /api/projects`

参数：

- `q`
- `title`
- `discipline`
- `institution`
- `source`
- `year`
- `page`
- `pageSize`

### 9.2 项目详情接口

`GET /api/projects/:id`

当前项目详情页不单独展示详情，而是回跳到筛选后的项目结果列表。

### 9.3 成果查询接口

`GET /api/outcomes`

参数：

- `projectTitle`
- `projectNumber`
- `principalInvestigator`
- `institution`
- `discipline`
- `source`
- `year`
- `outcomeType`
- `page`
- `pageSize`

## 10. 错误处理

前端：

- 无结果时展示空状态提示
- 表单检索后保留筛选条件

后端：

- `400` 参数错误
- `404` 项目不存在
- `500` 未预期错误

本地快照：

- 当前原型默认优先使用本地快照，而不是数据库
- 如果快照中存在历史乱码，读取层进行兼容修复
- 如果快照不可用，部分模块会回退到样例数据以保证页面可演示

## 11. 验收标准

- 可以从零安装依赖并启动项目
- 首页可正常打开
- 项目检索可正常筛选并返回列表
- 热点分析可正常渲染词云与分布图
- 前沿发现可正常渲染词云与图谱
- 成果查询可返回成果线索列表
- 通知页、浏览记录页、互动页可正常打开
- API 接口可返回结构化 JSON
- 无数据库时可使用本地快照运行

## 12. 暂不实现内容

- 用户登录与权限
- 支付与会员体系
- 管理后台
- 第三方全文抓取
- 第三方全文下载
- 成果数据的跨平台正式授权接入
- 评论服务端持久化

## 13. 当前实现说明

当前代码实现已经覆盖以下主功能：

- 首页统一入口
- 项目检索
- 热点分析
- 前沿发现
- 成果查询
- 项目通知
- 浏览记录
- 用户互动

仍需继续完善的部分：

- 历史抓取快照的中文清洗
- 更多真实来源接入
- 成果线索的真实数据覆盖度
