# DeepSeek Harness 插件开发教程：从零构建你的 AI 助手浏览器扩展

随着 DeepSeek 等大语言模型的飞速发展，开发者不再满足于在网页端与 AI 对话，而是希望将其能力无缝嵌入日常使用的浏览器中。想象一下：浏览网页时选中文字即可让 DeepSeek 总结、翻译，或者通过侧边栏随时提问——这就是一个 DeepSeek 浏览器插件（Harness）的价值所在。

本文将带你从零开始，开发一款属于自己的 DeepSeek 浏览器扩展，涵盖环境准备、核心代码、API 调用、界面设计、打包发布全流程。即使你只有前端基础，也能跟着教程一步步完成。

## 一、开发前的准备

在动手写代码之前，我们需要准备好以下工具和账号：

1. **Chrome 或 Edge 浏览器**：两者均基于 Chromium 内核，插件体系通用，方便调试和打包。
2. **DeepSeek API Key**：前往 DeepSeek 开放平台（platform.deepseek.com）注册账号，在“API Keys”页面创建一个密钥。DeepSeek 提供了兼容 OpenAI 格式的接口，支持 `deepseek-chat` 和 `deepseek-reasoner` 模型，价格友好，非常适合个人开发者。
3. **代码编辑器**：VS Code、WebStorm 等任意你熟悉的编辑器均可。
4. **Node.js（可选）**：如果你后续希望使用构建工具打包代码，建议安装。本教程为降低门槛，将采用原生 JavaScript 编写，不依赖框架和构建步骤。

## 二、初始化插件项目

创建一个项目文件夹，例如 `deepseek-harness`，内部结构如下：

```
deepseek-harness/
├── manifest.json       # 插件配置清单
├── popup.html          # 弹窗界面
├── popup.js            # 弹窗逻辑
├── sidepanel.html      # 侧边栏界面（可选）
├── sidepanel.js        # 侧边栏逻辑
├── background.js       # 后台服务脚本
├── content.js          # 内容脚本（注入网页）
├── style.css           # 统一样式
└── assets/
    └── icon48.png      # 插件图标
```

首先创建 `manifest.json`，这是插件的“灵魂”文件。Manifest V3 是当前标准版本，配置如下：

```json
{
  "manifest_version": 3,
  "name": "DeepSeek Harness",
  "version": "1.0.0",
  "description": "在你的浏览器中随时唤醒 DeepSeek AI，实现划词翻译、网页总结、智能问答等功能。",
  "permissions": ["storage", "contextMenus", "sidePanel"],
  "host_permissions": ["https://api.deepseek.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "48": "assets/icon48.png"
    },
    "default_title": "DeepSeek Harness"
  },
  "icons": {
    "48": "assets/icon48.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "options_page": "options.html"
}
```

关键点说明：

- `permissions` 中声明了 `storage`（保存配置）、`contextMenus`（右键菜单）、`sidePanel`（侧边栏）。
- `host_permissions` 允许插件向 DeepSeek 的 API 发送请求，避免跨域限制。
- `content_scripts` 可以在网页上下文中运行，用于捕获用户划词操作。

## 三、构建核心交互：右键划词与弹出面板

我们希望用户选中一段文字后，右键点击“DeepSeek 总结”或“DeepSeek 翻译”，即可快速获得结果。这个功能需要 `background.js` 后台脚本配合 `content.js` 实现。

**background.js** 代码示例：

```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "deepseek-summary",
    title: "使用 DeepSeek 总结",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "deepseek-translate",
    title: "使用 DeepSeek 翻译",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  if (info.menuItemId === "deepseek-summary") {
    // 将选中文本发送到 content script 处理弹窗显示
    chrome.tabs.sendMessage(tab.id, { type: "showResult", text: selectedText, task: "summary" });
  } else if (info.menuItemId === "deepseek-translate") {
    chrome.tabs.sendMessage(tab.id, { type: "showResult", text: selectedText, task: "translate" });
  }
});
```

**content.js** 负责在网页上动态显示一个结果浮层，并调用 API。为避免权限过于分散，API 请求统一放在后台，由 content script 发送消息触发。

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "showResult") {
    showFloatingBalloon(request.text, request.task);
  }
});

function showFloatingBalloon(text, task) {
  // 创建浮层元素
  const balloon = document.createElement("div");
  balloon.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; width: 320px; max-height: 400px;
    background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.2); border-radius: 12px;
    padding: 16px; z-index: 999999; font-family: system-ui, sans-serif;
    overflow-y: auto; border: 1px solid #e0e0e0;
  `;
  balloon.innerHTML = `<p style="font-weight:bold; margin-top:0;">DeepSeek 正在思考…</p><div id="deepseek-result"></div>`;
  document.body.appendChild(balloon);

  // 请求后台调用 API
  chrome.runtime.sendMessage({
    type: "callDeepSeek",
    task: task,
    prompt: text
  }, (response) => {
    document.getElementById("deepseek-result").innerText = response.result;
  });

  // 点击关闭
  balloon.addEventListener("click", () => balloon.remove());
}
```

## 四、在后台安全地调用 DeepSeek API

API 密钥不应暴露在前端脚本中，因此需要放在 `background.js` 里，并通过 `chrome.storage` 存储。用户在设置页填入 Key 后，后台服务统一负责请求。

**background.js 扩展**：

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "callDeepSeek") {
    invokeDeepSeek(request.task, request.prompt).then(result => {
      sendResponse({ result: result });
    });
    return true; // 异步响应
  }
});

async function invokeDeepSeek(task, prompt) {
  const { apiKey } = await chrome.storage.sync.get("apiKey");
  if (!apiKey) return "请先在设置中配置 DeepSeek API Key";

  let systemPrompt = "你是简洁、准确的 AI 助手。";
  if (task === "summary") systemPrompt = "请用简洁的语言总结以下内容，提炼核心要点：";
  if (task === "translate") systemPrompt = "请将以下内容翻译成简体中文，保持原意：";

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

如果你希望获得流式输出（打字机效果），可以在 `fetch` 请求中设置 `stream: true`，并使用 `ReadableStream` 处理 SSE 格式的数据。Harnass 一词正体现了“驾驭”能力——善用流式接口能让插件体验提升一个档次。稍后我们会在侧边栏功能中展示流式实现。

## 五、开发侧边栏（Side Panel）实现持久对话

Chrome 自 114 版本起支持 `sidePanel` API，我们可以在浏览器侧边栏中嵌入一个完整的 DeepSeek 聊天界面，类似官方网页版。这比弹窗更适合多轮对话。

**sidepanel.html** 中创建一个简单的聊天界面：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="chat-history"></div>
  <textarea id="user-input" placeholder="输入你的问题…"></textarea>
  <button id="send-btn">发送</button>
</body>
</html>
```

**sidepanel.js** 中维护对话上下文，并调用 DeepSeek 的流式接口：

```javascript
let messages = [];

document.getElementById("send-btn").addEventListener("click", async () => {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  messages.push({ role: "user", content: text });
  appendMessage("user", text);

  const { apiKey } = await chrome.storage.sync.get("apiKey");
  if (!apiKey) {
    appendMessage("assistant", "请先配置 API Key");
    return;
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assistantText = "";
  appendMessage("assistant", "");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // 解析 SSE 数据，提取 delta.content
    const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
    for (const line of lines) {
      if (line.includes("[DONE]")) return;
      const json = JSON.parse(line.replace("data: ", ""));
      const delta = json.choices[0]?.delta?.content || "";
      assistantText += delta;
      updateLastMessage(assistantText);
    }
  }
  messages.push({ role: "assistant", content: assistantText });
});
```

`appendMessage` 和 `updateLastMessage` 主要操作 DOM，在聊天历史区追加或修改气泡内容。

为了让侧边栏在点击插件图标时自动打开，可在 `background.js` 中添加：

```javascript
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
```

## 六、记住配置：设置页面

API Key 不能写死在代码里，我们需要一个 `options.html` 让用户粘贴自己的密钥。通过 `chrome.storage.sync` 保存，所有脚本共享。

**options.html** 简单表单：

```html
<h2>DeepSeek Harness 设置</h2>
<label>API Key：</label>
<input type="password" id="api-key" placeholder="sk-...">
<button id="save-btn">保存</button>
<p id="status"></p>
```

**options.js**：

```javascript
document.getElementById("save-btn").addEventListener("click", async () => {
  const key = document.getElementById("api-key").value.trim();
  await chrome.storage.sync.set({ apiKey: key });
  document.getElementById("status").textContent = "已保存 ✅";
});
```

## 七、本地调试与打包发布

在 Chrome 地址栏输入 `chrome://extensions`，开启“开发者模式”，点击“加载已解压的扩展程序”，选择项目目录。此时你的 DeepSeek Harness 已经生效。

如果你希望发布到 Chrome 应用商店，需要准备：

- 插件图标（至少 48×48，建议 128×128）
- 详细描述和截图
- 支付 5 美元注册 Chrome Web Store 开发者账号

如果无法访问谷歌商店（如国内用户），可以参考文章素材中提到的极简插件官网（chrome.zzzmh.cn）、CrxDL 或扩展迷等第三方平台。打包方法：在扩展管理页面点击“打包扩展程序”，生成 `.crx` 文件，即可分享给他人或上传到这些下载站，让更多用户便捷地通过国内渠道安装。

## 八、进阶优化方向

到这里，一个功能完整的 DeepSeek Harness 插件已经成型。你还可以继续打磨：

- **支持更多模型切换**：增加一个下拉框，让用户选择 `deepseek-chat` 或 `deepseek-reasoner`，以适配不同任务场景。
- **维护多轮会话历史**：利用 `storage.local` 持久化侧边栏的聊天记录，刷新页面后依然保留。
- **添加 Markdown 渲染**：DeepSeek 回复包含 Markdown 格式，可使用 `marked.js` 渲染后再插入页面。
- **补充“网页总结”能力**：通过 `content.js` 获取当前页面正文内容，发送到 API 生成摘要，一键把握文章梗概。

此外，务必注意 API Key 的安全性，不要将密钥上传至代码仓库或打包进插件后公开分发（第三方平台审核不严容易泄露）。建议允许用户自填 Key，或通过后端代理转发请求。

## 结语

DeepSeek 的强大能力不应该被局限在聊天窗口中。通过编写一个小小的浏览器插件，我们可以将它“接入”阅读、写作、翻译、信息筛选等任何网络场景。本文的 Harness 思路只是起点，你可以自由组合所有 Chrome API 与 DeepSeek 模型，打造真正属于自己的 AI 工作流。

现在前往 DeepSeek 开放平台获取 API Key，建立你的 `deepseek-harness` 项目，开始“驾驭” AI 的旅程吧。
