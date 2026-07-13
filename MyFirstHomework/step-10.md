# Step 10 - 项目定位与成果查询接口空壳

## 目标
基于现有项目数据能力，为“成果查询”模块补上第一版查询接口与项目定位能力，使页面可以先返回“匹配到的项目摘要”。

## 输入
- Step 9 的成果查询页面骨架
- 当前项目已有的 `projects` 数据结构和查询逻辑
- [design.md](C:\Users\admin\Documents\yangjingjing\design.md) 中成果查询模块的字段与接口设计

## 输出
- `GET /api/outcomes` 第一版接口
- 成果查询页可以提交查询条件
- 页面可展示“匹配到的项目摘要”
- 页面可返回成果列表空数组的标准结构

## 不做内容
- 不抓取公开成果网页
- 不接入知网、读秀、万方跳转
- 不创建成果线索正式数据表
- 不实现命中证据明细
- 不实现成果详情接口

## 实现要求
- 复用现有项目库能力完成项目定位，不重复造一套完全独立的项目查询逻辑
- `GET /api/outcomes` 至少支持以下参数：
  - `projectTitle`
  - `projectNumber`
  - `principalInvestigator`
  - `institution`
  - `discipline`
  - `source`
  - `year`
  - `outcomeType`
- 接口返回结构至少包含：
  - `matchedProjects`
  - `items`
  - `pagination`
  - `notice`
- 第一版中：
  - `matchedProjects` 返回真实项目定位结果
  - `items` 允许为空数组
  - `notice` 明确提示成果线索尚未接入或仅接入样例源
- 页面端需能把查询参数传给接口，并在页面中展示匹配项目摘要
- 若无匹配项目，应给出明确提示，而不是空白页面

## 校验方式
- 使用有效项目名称或负责人发起查询后，接口能返回匹配项目
- 使用无效条件查询时，接口能返回空结果且结构稳定
- 前端页面能渲染项目摘要区
- 打开浏览器网络请求，可看到 `/api/outcomes` 正常返回 JSON
- 执行 `npm run build` 或 `npm.cmd run build` 成功

## 完成标准
- 成果查询模块已经具备“先找项目，再准备找成果”的基本链路
- 后续 Step 11 只需要在当前接口结构上填充成果线索列表，不需要推倒接口重做
