---
title: "dsh-web局域网与远程访问排障实战"
date: 2026-09-01T03:45:54.264Z
description: "记录 DeepSeek Harness Web 界面在局域网访问与公网远程配对过程中遇到的典型故障及逐层排查方案，涵盖 0.0.0.0 绑定、publicBaseUrl 配置、防火墙放行等实操细节。"
tags: ["dsh-web", "局域网访问", "远程访问", "故障排查", "DDNSTO"]
categories: ["技术排障", "网络配置"]
draft: false
---

# dsh-web局域网与远程访问排障实战

> 一篇把「如何在局域网用 `192.168.100.127:3080` 访问 dsh Web，并配合 DDNSTO 公网隧道远程使用」的完整过程记录。本文结合了实际操作中遇到的报错、排查思路与最终解决方案，希望为同样被 dsh 局域网/远程访问问题困扰的同学提供一条可复用的参考路径。

## 1. 背景与目标

我本地跑着 DeepSeek Harness 的浏览器界面（dsh web），默认只监听 `127.0.0.1:3080`。这次的目标有两个：

1. **局域网访问**：让局域网内其他设备能通过本机 IP `192.168.100.127:3080` 访问；
2. **公网远程访问**：配合 DDNSTO 的 `kooldns.cn` 域名，实现手机 / 另一台电脑扫码配对使用。

然而走下来，踩到了不少坑：`--host` 被配置校验拒绝、二维码不刷新、`publicBaseUrl` 被解析成无效值、DDNSTO 检测“不可连接”……这篇文章把每一步的排查思路和最终解法完整记录下来。

## 2. 环境信息

| 项目 | 值 |
|---|---|
| 操作系统 | Windows |
| 本机内网 IP | `192.168.100.127`（WLAN 网卡） |
| dsh 版本 | `@deepseek-ai/dsh`，browser UI 默认端口 `3080` |
| 远程工具 | `@linxin666/dsh-remote-web-ui`（扫码配对 / 公网隧道） |
| 公网域名 | `zonglinds.kooldns.cn`（DDNSTO / KoolShare） |

## 3. 第一次尝试：直接 `--host 192.168.100.127`

刚开始我以为只要指定 IP 就行，于是执行：

```bash
dsh web --host 192.168.100.127 --port 3080 --trusted-host 192.168.100.127
```

结果直接报错：

```text
ValidationError: invalid config:
  - $.host expected "127.0.0.1" | "0.0.0.0" but got "192.168.100.127" (at host)
```

**结论**：`dsh-host-webserver` 这个插件对 `host` 字段做了硬性枚举校验，只接受两个值：

- `127.0.0.1`（默认，仅本机回环）
- `0.0.0.0`（监听所有网卡）

也就是说 **dsh 目前不支持“绑定某个具体局域网 IP”**。CLI 里的 `--host` 虽然能传任意字符串，但到服务器插件这一层会被 schema 打回。

## 4. 方案一：通过 profile patch 绑定 `0.0.0.0`

既然不能绑定单个 IP，那就监听所有网卡（`0.0.0.0`），这样 `192.168.100.127` 自然也在监听范围内。

注意：直接用 CLI 命令 `dsh web --host 0.0.0.0` 会被 web-app 主动拒绝，它认为在认证层就绪前暴露到网络不够安全。所以要走 **profile patch** 配置。

编辑用户 profile 的 patch 文件：

```text
C:\Users\Zonglin\.dsh\profiles\web\cordis.patch.yml
```

追加一个 webserver 配置覆盖项：

```yaml
# Listen on all interfaces so the GUI can be reached over the LAN
# (e.g. http://192.168.100.127:3080). dsh-web's webserver only accepts
# 127.0.0.1 or 0.0.0.0, so 0.0.0.0 is the network-exposure path;
# the web runtime auto-derives the LAN IP literals into the trust fence.
- id: webserver
  config:
    host: 0.0.0.0
    port: 3080
```

重启后启动：

```bash
dsh web --no-open
```

这次能正常打印局域网地址：

```text
dsh web: http://127.0.0.1:3080 (LAN: http://192.168.100.127:3080)
```

> 注意：这里出现的 `(LAN: ...)` 正是 `host: 0.0.0.0` 时，web-runtime 自动从本机所有非回环 IPv4 里推导出的局域网候选地址。

## 5. 加入 remote-web-ui 以及 publicBaseUrl

为了让手机 / 其他电脑能通过**公网域名 + 扫码配对**访问，我安装了 `@linxin666/dsh-remote-web-ui` 插件。它的二维码链接默认基于本机局域网 IP 生成；要走公网隧道，需要配置插件的 `publicBaseUrl`（公网 origin）。

### 5.1 在 profile patch 里加配置

```yaml
# remote-web-ui: make QR pairing links use this public/tunnel origin.
- id: remote-web-ui
  config:
    publicBaseUrl: "https://zonglinds.kooldns.cn"
```

### 5.2 但二维码没变成公网地址

改了 `cordis.patch.yml` 后，二维码选择器里仍然是局域网地址，没有出现 `http://zonglinds.kooldns.cn/?pair=...`。

**排查关键**：`remote-web-ui` 的配置是分层解析的。

> 解析层级：**schema 默认值 → 组成（composition）base 层（即 profile patch） → 用户设置层**
> **用户设置层的值最后生效，会覆盖 base 层。**

所以真正生效的不是 `cordis.patch.yml`，而是用户设置文件：

```text
C:\Users\Zonglin\.dsh\settings.yaml
```

查看后发现：

```yaml
remote-web-ui:
  mobileEnterToSend: false
  autoTunnel: false
  publicBaseUrl: zonglinds.kooldns.cn   # 少了 http://，被插件判定为非法并忽略
```

**根因**：`remote-web-ui` 对 `publicBaseUrl` 有 `isHttpUrl` 校验，要求必须以 `http://` 或 `https://` 开头。这里写成了裸域名 `zonglinds.kooldns.cn`，被当作 malformed 值**忽略**，所以二维码继续用局域网地址。

**修复**：把 `settings.yaml` 里的值改成带协议的：

```yaml
remote-web-ui:
  publicBaseUrl: "http://zonglinds.kooldns.cn"
```

改完刷新二维码，选择器里就出现：

```text
公网地址
http://zonglinds.kooldns.cn
```

![屏幕截图 2026-09-01 012303.png](materials/屏幕截图%202026-09-01%20012303.png)

## 6. 关于 http 与 https 的坑

插件只按你配置的字面值来构建二维码，不会自动把 `http` 升级成 `https`。而 dsh web 本身是一个纯 HTTP 服务（`node:http`），**自己无法终结 TLS**。

所以：

- 如果 `publicBaseUrl` 写的是 `http://...`，二维码就是 `http://zonglinds.kooldns.cn/?pair=...`；
- 要变成 `https://...`，必须**在这个域名前面存在一层能终结 TLS 的服务**（Cloudflare 代理 / Cloudflare Tunnel / Nginx / Caddy 反代），并且把回源指向 dsh 的 HTTP 端口。

切勿为了“看起来是 https”而硬改成 `https://`。如果前端没有 HTTPS，二维码会指向一个连不上的 `https` 地址，反而更糟。

## 7. DDNSTO 配置与“检测不可连接”

`zonglinds.kooldns.cn` 来自 **DDNSTO / KoolShare** 的 DDNS 服务。扫码打开时出现了 DDNSTO 的“连接已断开”报错页（见下图）。

![屏幕截图 2026-08-24 115138.png](materials/屏幕截图%202026-08-24%20115138.png)

DDNSTO 的「编辑域名」页面里，内网地址填的是：

```text
http://192.168.100.127:3080
```

点「检测」却返回：

```text
设备状态：在线
IP 及端口：不可连接
GET 请求返回状态码：0
GET 请求返回重定向：无
错误信息：failed to read response（目标地址可能不支持 http 服务）
```

**解读**：

- `设备状态：在线` 表示 DDNSTO 客户端/代理活着；
- `GET 返回状态码：0` + `不可连接` = **TCP 连接根本成功不了**，而不是“不支持 http”。DDNSTO 的提示文案“目标地址可能不支持 http 服务”只是它连不上时的通用说法。

所以问题不在 `publicBaseUrl`，而在 **DDNSTO 客户端到 `192.168.100.127:3080` 这条内网链路不通**。

## 8. 定位：用本机探测端口

我在本机用代码分别探测 `127.0.0.1:3080` 与 `192.168.100.127:3080`：

```text
Interfaces:
  WLAN: 192.168.100.127
  Loopback Pseudo-Interface 1: 127.0.0.1 (internal)

Connectivity:
{"host":"127.0.0.1","port":3080,"connected":true}
{"host":"127.0.0.1","port":3080,"http":{"host":"127.0.0.1","port":3080,"status":200,"ok":true}}
{"host":"192.168.100.127","port":3080,"connected":false,"error":"timeout"}
```

结论非常清晰：

| 地址 | 结果 | 含义 |
|---|---|---|
| `127.0.0.1:3080` | 连接成功，HTTP 200 | dsh 在运行，端口没问题 |
| `192.168.100.127:3080` | 连接超时（timeout） | 请求被丢弃，不是拒绝 |

关键点：**即便是从本机访问自己的 WLAN IP，也会走 Windows 防火墙的入站规则。** 被防火墙静默丢弃时表现通常是“超时”而非“连接被拒绝”。而 DDNSTO 客户端（可能在另一个网段/设备，也可能在本机）去访问 `192.168.100.127:3080` 同样撞上这堵墙。

**根因：Windows 防火墙没有放行 TCP 3080 的入站流量。**

![屏幕截图 2026-09-01 012818.png](materials/屏幕截图%202026-09-01%20012818.png)

## 9. 解决：放行防火墙 3080

以**管理员身份**打开 PowerShell，执行：

```powershell
New-NetFirewallRule -DisplayName "dsh 3080" -Direction Inbound -Protocol TCP -LocalPort 3080 -Action Allow
```

不指定 `-Profile` 表示对**所有网络配置文件**（Private / Public）都生效。如果你的 WLAN 被系统标成 Public，这条最保险。只对专用网络放行可写成：

```powershell
New-NetFirewallRule -DisplayName "dsh 3080" -Direction Inbound -Protocol TCP -LocalPort 3080 -Action Allow -Profile Private
```

放行后，本机访问：

```text
http://192.168.100.127:3080
```

应能正常打开。再回到 DDNSTO「编辑域名」点「检测」，结果应变为：

```text
IP 及端口：可连接
GET 请求返回状态码：200
```

随后点「更新」，重新刷新 dsh 的二维码，用 `http://zonglinds.kooldns.cn/?pair=...` 就能访问了。

![屏幕截图 2026-09-01 012832.png](materials/屏幕截图%202026-09-01%20012832.png)

## 10. 附带的两个非致命警告

启动 dsh web 时还出现过两条警告，这里一并解释。

### 10.1 dsh-doctor 的 EPERM

```text
[dsh-doctor] policy sync failed: Error: EPERM: operation not permitted,
rename '...policy.json.tmp-...' -> '...policy.json'
```

这是第三方诊断插件 `dsh-doctor` 在 Windows 上写状态文件时，重命名临时文件被占用/权限问题（常见是杀毒扫描、另一个进程锁定、或残留 `.tmp-*` 文件）。**不影响 dsh 运行**。若反复出现，停掉 dsh 后手动清理：

```text
C:\Users\Zonglin\.dsh-doctor\state\policy.json.tmp-*
```

### 10.2 remote-web-ui 的 CRITICAL

```text
remote-web-ui: CRITICAL — the /api fence is OPEN for [192.168.100.127:3080]:
unpaired cl
```

这条警告说明 `/api` 围栏对局域网地址处于开放状态，也就是说在没有配对的情况下可能导致未授权访问。建议在正式使用前完成配对，或者通过防火墙 / `trusted-host` 等机制进一步收紧访问范围。

## 结语

从第一次被 schema 校验拒绝，到最终通过防火墙放行让 DDNSTO 正常连通，整个排障过程的关键节点可以概括为：

1. **dsh 的 host 字段只接受 `127.0.0.1` 或 `0.0.0.0`**，想暴露局域网只能选后者；
2. **profile patch 与用户设置层的优先级要分清**，改 `settings.yaml` 必须带上协议前缀；
3. **公网隧道连不上时先查链路**，不要被 DDNSTO 的“不支持 http”误导，用本机探测就能迅速锁定防火墙问题。

希望这篇文章能帮你少走一些弯路，如果你也遇到类似的问题，可以按上面的步骤逐一排查。
