# 目录

- [STEP1：命令提示符 cmd 的基础知识及配置](#step1命令提示符-cmd-的基础知识及配置)
- [STEP2：Node.js 的安装及验证](#step2nodejs-的安装及验证)
- [STEP3：Markdown、TOML、JSON 等文本格式阅读器的安装](#step3markdowntomljson-等文本格式阅读器的安装)
- [STEP4：如何使用 Codex](#step4如何使用-codex)
- [STEP5：Git 的安装及验证](#step5git-的安装及验证)
- [STEP6：GitHub 的注册及 Git 关联提交验证](#step6github-的注册及-git-关联提交验证)

---

# STEP1：命令提示符 cmd 的基础知识及配置

## 1.1 打开 cmd

在 Windows 中可以通过以下方式打开命令提示符：

1. 按 `Win + R`，输入 `cmd`，按回车。
2. 在开始菜单中搜索“命令提示符”或 `cmd`。
3. 在文件夹地址栏输入 `cmd`，按回车，可以直接在当前文件夹位置打开命令行。

## 1.2 常用基础命令

```bat
:: 查看当前目录
cd

:: 切换到指定目录
cd /d E:\Users\Desktop\博士实践课

:: 查看当前目录下的文件
dir

:: 创建文件夹
mkdir test

:: 删除空文件夹
rmdir test

:: 查看文本文件内容
type README.md

:: 清屏
cls

:: 退出 cmd
exit
```

注意：如果路径中包含空格，需要使用英文双引号包裹路径。

```bat
cd /d "E:\Users\Desktop\博士实践课"
```

## 1.3 配置 cmd 中文显示

如果 cmd 中中文显示异常，可以先切换为 UTF-8 编码：

```bat
chcp 65001
```

该命令只对当前 cmd 窗口生效。重新打开 cmd 后，如果还需要 UTF-8，需要再次执行。

## 1.4 查看和配置环境变量

查看环境变量：

```bat
echo %PATH%
echo %USERPROFILE%
```

临时设置环境变量，只对当前窗口生效：

```bat
set TEST_KEY=123456
echo %TEST_KEY%
```

永久设置用户环境变量：

```bat
setx TEST_KEY "123456"
```

注意：`setx` 设置后，需要重新打开 cmd 才会生效。

## 1.5 验证命令是否可用

可以使用 `where` 命令检查某个程序是否已经加入环境变量：

```bat
where node
where npm
where git
where codex
```

如果能够显示程序路径，说明系统可以在 cmd 中找到该命令。

---

# STEP2：Node.js 的安装及验证

## 2.1 安装 Node.js

推荐安装 Node.js LTS 版本。Windows 可以使用以下任意一种方式安装。

方式一：官网下载并安装。

1. 打开 Node.js 官网：https://nodejs.org/
2. 下载 LTS 版本安装包。
3. 安装时保持默认选项即可，尤其要保留“Add to PATH”相关选项。

方式二：使用 winget 安装。

```bat
winget install OpenJS.NodeJS.LTS
```

## 2.2 验证 Node.js 是否安装成功

重新打开 cmd，执行：

```bat
node -v
npm -v
```

如果分别显示 Node.js 和 npm 的版本号，说明安装成功。

示例：

```text
v22.0.0
10.0.0
```

## 2.3 检查 npm 全局安装路径

```bat
npm config get prefix
npm root -g
```

如果后续安装全局命令后无法直接使用，可以检查 npm 全局路径是否已经加入系统 `PATH`。

## 2.4 使用 npm 安装命令行工具

安装全局工具的一般格式：

```bat
npm install -g 工具名称
```

例如安装 Codex：

```bat
npm install -g @openai/codex
```

安装完成后可以验证：

```bat
codex --version
```

---

# STEP3：Markdown、TOML、JSON 等文本格式阅读器的安装

## 3.1 推荐工具：Notepad++

如果只需要轻量阅读和编辑 `.md`、`.toml`、`.json` 等文本配置文件，推荐安装 Notepad++。

安装方式一：官网下载。

1. 打开 Notepad++ 官网：https://notepad-plus-plus.org/
2. 下载 Windows 安装包。
3. 安装时保持默认选项即可。

安装方式二：使用 winget。

```bat
winget install Notepad++.Notepad++
```

## 3.2 使用 Notepad++ 打开文本文件

可以在文件上右键，选择使用 Notepad++ 打开。

也可以先打开 Notepad++，然后通过菜单选择：

```text
文件 -> 打开
```

## 3.3 Markdown 文件阅读

Markdown 文件扩展名通常为 `.md`。

Notepad++ 可以直接打开 Markdown 文件。Markdown 本质上是纯文本，常见写法包括标题、列表、代码块和链接。

## 3.4 TOML 文件阅读

TOML 文件扩展名通常为 `.toml`，常用于配置文件，例如：

```text
config.toml
```

TOML 常见格式示例：

```toml
model = "gpt-5.4"
base_url = "https://relay.nf.video/v1"

[model_providers.codex]
name = "codex"
wire_api = "responses"
```

## 3.5 JSON 文件阅读

JSON 文件扩展名通常为 `.json`，常用于保存结构化配置，例如：

```text
auth.json
package.json
```

JSON 常见格式示例：

```json
{
  "OPENAI_API_KEY": "这里填写 API Key"
}
```

注意：

1. JSON 的键和值通常都需要英文双引号。
2. 最后一项后面不要添加逗号。
3. 文件中不要写注释。

## 3.6 编辑配置文件时的注意事项

1. 不要随意更改标点符号，尤其是英文双引号、冒号、逗号和中括号。
2. 不要把中文标点写入代码配置区域。
3. 修改后建议先保存，再重新运行对应命令验证配置是否正确。

---

# STEP4：如何使用 Codex

## 4.1 安装 Codex

使用 npm 或 brew 安装 OpenAI Codex CLI 工具。

```bash
npm install -g @openai/codex  # 或者使用：brew install codex
```

## 4.2 创建 `~/.codex/` 文件夹并配置必要文件

注意：`base_url` 必须保留 `/v1`，格式为 `服务器地址 + /v1`。

### `~/.codex/config.toml`

```toml
model_provider = "codex"
model = "gpt-5.4"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.codex]
name = "codex"
base_url = "https://relay.nf.video/v1"
wire_api = "responses"
```

同时需要创建 `auth.json` 文件：

### `~/.codex/auth.json`

```json
{
  "OPENAI_API_KEY": "sk-ant-sid01--a9f87776d6cb96a7618666494b69e95df6cea78bc95b949bcbd7ccd7c608ce43"
}
```

## 4.3 以上配置文件的位置

Codex 配置文件需要放置在如下位置：

```text
macOS/Linux: ~/.codex/

Windows: %USERPROFILE%\.codex\
```

注意：`.codex` 文件夹需要手动创建，然后在其中创建 `config.toml` 和 `auth.json` 文件。

## 4.4 在项目目录中运行 Codex 命令验证是否安装成功

在项目目录内，右键找到`在终端中运行`，打开终端（务必注意不是PowerShell界面！）输入codex回车。

```bash
codex
```

---

# STEP5：Git 的安装及验证

## 5.1 安装 Git

Windows 推荐安装 Git for Windows。

方式一：官网下载。

1. 打开 Git 官网：https://git-scm.com/
2. 下载 Windows 安装包。
3. 安装时大部分选项保持默认即可。
4. 安装完成后重新打开 cmd。

方式二：使用 winget。

```bat
winget install Git.Git
```

## 5.2 验证 Git 是否安装成功

安装完成后，重新打开 cmd，执行：

```bat
git --version
```

如果显示 Git 版本号，说明安装成功。

也可以检查 Git 程序路径：

```bat
where git
```

## 5.3 配置 Git 用户信息

首次使用 Git 前，需要配置用户名和邮箱。这里的邮箱建议与 GitHub 注册邮箱保持一致。

```bat
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱@example.com"
```

验证配置：

```bat
git config --global --list
```

应该能看到类似内容：

```text
user.name=你的用户名
user.email=你的邮箱@example.com
```

## 5.4 Git 基础验证流程

可以创建一个测试文件夹验证 Git 是否能正常工作：

```bat
mkdir git-test
cd git-test
git init
echo hello git > README.md
git status
git add README.md
git commit -m "first commit"
git log --oneline
```

如果 `git log --oneline` 能看到刚才提交的记录，说明本地 Git 已经可以正常使用。

---

# STEP6：GitHub 的注册及 Git 关联提交验证

## 6.1 注册 GitHub 账号

1. 打开 GitHub 官网：https://github.com/
2. 点击注册账号。
3. 填写邮箱、用户名和密码。
4. 完成邮箱验证。
5. 登录 GitHub。

建议用户名使用英文、数字或短横线，避免使用空格和特殊符号。

## 6.2 创建 GitHub 仓库

登录 GitHub 后：

1. 点击右上角 `+`。
2. 选择 `New repository`。
3. 输入仓库名称，例如 `git-test`。
4. 可以选择 `Public` 或 `Private`。
5. 点击 `Create repository`。

如果本地已经有文件，创建仓库时可以不勾选 `Add a README file`，避免后续首次推送时出现历史冲突。

## 6.3 使用 HTTPS 方式关联 GitHub

在本地项目目录中执行：

```bat
git remote add origin https://github.com/你的GitHub用户名/仓库名.git
git branch -M main
git push -u origin main
```

如果 GitHub 要求登录，可以按照弹出的浏览器或凭据窗口完成认证。

注意：GitHub 不再支持直接使用账号密码推送代码。如果使用 HTTPS 且要求输入密码，需要使用 GitHub Personal Access Token。

## 6.4 如果已经添加过远程仓库地址

如果之前已经添加过 `origin`，可以改为 HTTPS 地址：

```bat
git remote set-url origin https://github.com/你的GitHub用户名/仓库名.git
```

查看远程仓库地址：

```bat
git remote -v
```

显示结果中应该能看到 HTTPS 地址：

```text
origin  https://github.com/你的GitHub用户名/仓库名.git (fetch)
origin  https://github.com/你的GitHub用户名/仓库名.git (push)
```

## 6.5 提交并推送验证

在项目目录中创建或修改文件后，执行：

```bat
git status
git add .
git commit -m "update tutorial"
git push
```

推送完成后，打开 GitHub 仓库页面。如果能看到刚才提交的文件或更新记录，说明 Git 与 GitHub 已经关联成功。

## 6.6 常见问题

### 问题一：`git` 不是内部或外部命令

说明 Git 没有安装成功，或者 Git 路径没有加入环境变量。可以重新安装 Git，并确认安装时选择加入 `PATH`。

### 问题二：推送时要求输入密码

GitHub HTTPS 推送不支持直接使用账号密码。可以使用 GitHub Personal Access Token，或者按照 Git 弹出的浏览器登录窗口完成认证。

### 问题三：远程仓库地址写错

查看 remote 地址：

```bat
git remote -v
```

如果地址错误，可以重新设置：

```bat
git remote set-url origin https://github.com/你的GitHub用户名/仓库名.git
```

### 问题四：首次 push 出现分支名称问题

可以统一使用 `main` 作为默认分支：

```bat
git branch -M main
git push -u origin main
```
