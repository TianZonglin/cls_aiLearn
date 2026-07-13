# 📚 Notion-Zotero 文献工作流工具

这是一个给论文写作用的本地自动化工具。你只需要在 Zotero 和 Notion 中整理文献，然后打开本地网页控制台，就可以自动生成 Excel、Markdown、Word 材料包和参考文献包。

适合用来做：

- 文献入库：Zotero → Notion
- 文献整理：主题、章节、用途、优先级
- 自动翻译：中文题名、中文摘要
- 写作材料包：Markdown / Word
- 参考文献包：APA / GB
- 归档备份：GitHub

> 这是本地个人工具，不建议公网部署。不要把 `.env`、Notion Token、API Key 上传到 GitHub。

---

## 🚀 最推荐的使用方式：打开本地网页

双击桌面文件：

```text
启动文献工作流网站.command
```

打开后会进入本地网页控制台。你会看到：

- 状态概览：Excel、Word、Markdown、日志是否存在
- 一键操作：导入、诊断、翻译、生成材料包、生成参考文献包
- 输出文件：下载 Excel、Word、Markdown、日志

如果双击打不开，也可以用终端：

```bash
cd /Users/xueyeye/Documents/notion-literature-tool
source .venv/bin/activate
streamlit run web_app.py
```

浏览器地址通常是：

```text
http://localhost:8501
```

---

## 🧭 每天怎么用

### Step 1：把文献放进 Zotero

1. 打开 Zotero
2. 拖入 PDF
3. 右键 PDF，选择识别元数据
4. 给要导入 Notion 的文献主条目打标签：`to-notion`

注意：标签要打在“文献主条目”上，不是 PDF 附件上。

### Step 2：导入到 Notion

在网页控制台点击：

```text
导入 Zotero 文献
```

或者双击桌面：

```text
01-Zotero导入Notion.command
```

### Step 3：在 Notion 里整理文献

建议至少填写这些字段：

| 字段 | 怎么填 | 作用 |
| --- | --- | --- |
| 是否导出 | 勾选 | 决定是否进入材料包 |
| 对应章节 | 文献综述 / 理论基础 / 研究方法等 | 决定进入哪个章节材料包 |
| 用途 | 文献综述 / 理论基础 / 变量测量等 | 决定材料包分类 |
| 主题 | 品牌资产、期刊影响力等 | 生成主题材料包 |
| 优先级 | A / B / C | 排序用 |
| 可支持论点 | 写这篇文献能支持什么观点 | 进入材料包 |
| 我的评价 | 写你的判断、批判、启发 | 进入材料包 |

如果你想让页面正文也进入材料包，就直接写在 Notion 文献页面正文里。

推荐正文模板：

```markdown
## 一、文献核心内容

## 二、可用于我的论文的位置

## 三、理论与概念

## 四、方法与测量

## 五、我的评价

## 六、可引用材料

## 七、临时笔记
```

### Step 4：检查 Notion 配置

在网页控制台点击：

```text
诊断 Notion 数据库
```

它会检查：

- Notion 字段是否能读取
- 页面正文 blocks 是否能读取
- 页面评论是否能读取

如果评论导出失败，通常是 Notion Integration 没开 `Read comments` 权限。

### Step 5：生成全部结果

最省事：在网页控制台点击：

```text
开始完整同步
```

它会依次做：

1. Zotero 导入 Notion
2. 翻译中文题名 / 中文摘要
3. 生成 Excel / Markdown / Word
4. 生成 APA / GB 参考文献包

如果你只想生成材料包，可以点：

```text
生成 Excel / Markdown / Word
```

---

## 📁 结果在哪里

GitHub 输出仓库路径：

```text
/Users/xueyeye/Desktop/github仓库文件
```

常用结果：

| 文件 | 路径 | 用途 |
| --- | --- | --- |
| Excel 文献总表 | `exports/literature_notes.xlsx` | 查看所有导出文献和检查列 |
| CSV 数据 | `exports/literature_notes.csv` | 备用数据处理 |
| 全部文献 Markdown | `materials/all_material_pack.md` | 全部材料包 |
| 文献综述 Markdown | `materials/special/文献综述材料包.md` | 写文献综述 |
| 理论基础 Markdown | `materials/special/理论基础材料包.md` | 写理论基础 |
| 全部文献 Word | `materials/word/全部文献材料包.docx` | Word 写作素材 |
| 文献综述 Word | `materials/word/文献综述材料包.docx` | 文献综述素材 |
| 理论基础 Word | `materials/word/理论基础材料包.docx` | 理论基础素材 |
| 参考文献包 | `materials/word/参考文献包.docx` | APA / GB 引用合集 |
| 运行日志 | `logs/` | 每次运行记录 |

网页控制台里的“输出文件”区域也可以直接下载这些文件。

---

## 📦 材料包怎么分类

| 材料包 | 进入条件 |
| --- | --- |
| 全部文献材料包 | Notion 中 `是否导出` 被勾选 |
| 文献综述材料包 | `是否导出` 被勾选，并且 `对应章节` 或 `用途` 包含“文献综述” |
| 理论基础材料包 | `是否导出` 被勾选，并且 `对应章节` 或 `用途` 包含“理论基础”，或主题/用途包含“理论、模型、框架、机制” |
| 主题材料包 | `是否导出` 被勾选，并且 `主题` 有对应内容 |
| 章节材料包 | `是否导出` 被勾选，并且 `对应章节` 有对应内容 |

重要提醒：

> 只在页面正文里写“这篇文献可用于文献综述”不一定会进入文献综述材料包。请在 Notion 字段里填写 `对应章节=文献综述` 或 `用途=文献综述`。

---

## 🌐 自动翻译怎么用

网页控制台有两个按钮：

| 按钮 | 作用 |
| --- | --- |
| 测试翻译 API | 看 API 能不能正常翻译 |
| 翻译并回写 Notion | 把空的中文题名、中文摘要补上，并写回 Notion |

翻译不会覆盖已有中文内容。

如果翻译失败，先检查：

- `.env` 里是否配置了 API Key
- 中转地址是否正确
- 模型名是否可用
- 网络是否可用

---

## 📖 参考文献包

网页控制台点击：

```text
生成参考文献包
```

会生成：

```text
materials/word/参考文献包.docx
```

它会尝试生成 APA 和 GB/T 7714 风格引用。当前是基础格式，如果要投稿级准确，建议后续补充卷、期、页码、文献类型、出版社等字段。

---

## 🖱️ 桌面按钮说明

除了网页控制台，桌面也保留了几个备用按钮：

| 桌面按钮 | 作用 |
| --- | --- |
| `启动文献工作流网站.command` | 打开本地网页控制台 |
| `01-Zotero导入Notion.command` | 只做 Zotero 导入 |
| `02-Notion结构诊断.command` | 检查 Notion 字段、正文、评论权限 |
| `03-翻译功能测试.command` | 测试翻译 API |
| `04-Notion文献完整同步.command` | 一键完整同步 |
| `05-打开输出结果.command` | 打开 Excel、Markdown、Word 输出目录 |

推荐优先使用网页控制台，因为所有按钮和结果都在一个页面里。

---

## 🛠️ 如果网页打不开

先在终端运行：

```bash
cd /Users/xueyeye/Documents/notion-literature-tool
source .venv/bin/activate
pip install -r requirements.txt
streamlit run web_app.py
```

如果看到类似下面的地址，说明网站已经启动：

```text
http://localhost:8501
```

---

## ❓ 常见问题

### 1. 为什么打了 `to-notion` 标签但没导入？

请检查：

- Zotero 是否打开
- 标签是不是完全写成 `to-notion`
- 标签是否打在文献主条目上，而不是 PDF 附件上
- 这篇文献是否已经导入过，工具会自动去重

### 2. 为什么导出数量是 0？

请在 Notion 里勾选：

```text
是否导出
```

没有勾选的文献不会进入材料包。

### 3. 为什么文献综述材料包为空？

请在 Notion 字段里填写：

```text
对应章节 = 文献综述
```

或：

```text
用途 = 文献综述
```

同时确认 `是否导出` 已勾选。

### 4. 为什么理论基础材料包为空？

请在 Notion 字段里填写：

```text
对应章节 = 理论基础
```

或让 `用途 / 主题` 包含：

```text
理论、模型、框架、机制
```

同时确认 `是否导出` 已勾选。

### 5. 为什么 Notion 正文没有进入 Word？

请确认正文写在文献页面内部，而不是只写在数据库字段里。然后运行“Notion 结构诊断”，查看 `block_count` 是否大于 0。

### 6. 为什么评论没有导出？

需要在 Notion Integration 中开启 `Read comments` 权限。没有权限时，工具会跳过评论，不影响其他导出。

### 7. 为什么 GitHub push 失败？

多数是网络或 GitHub 登录凭证问题。本地文件通常已经生成。网络和凭证恢复后运行：

```bash
cd "/Users/xueyeye/Desktop/github仓库文件"
git push
```

---

## 🔐 安全提醒

- 不要上传 `.env`
- 不要把 Notion Token、API Key、代理 API Key 写进 README
- 不要把本地 Streamlit 网站开放到公网
- 如果密钥泄露，请立刻重置

`.gitignore` 应包含：

```gitignore
.env
.DS_Store
**/.DS_Store
__pycache__/
*.pyc
.venv/
```

---

## 📌 给未来的自己

日常最简单流程：

```text
Zotero 打 to-notion 标签
↓
打开网页控制台
↓
点击“开始完整同步”
↓
在“输出文件”里下载 Word / Excel / Markdown
```
