# DeepSeek Harness 首发实测 + 入门教程，夯爆了！

> 来源：https://baijiahao.baidu.com/s?id=1873772350741957542&wfr=spider&for=pc&searchword=dsh%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B

- DeepSeek Harness 首发实测 + 入门教程，夯爆了！百度首页登录搜索复制DeepSeek Harness 首发实测 + 入门教程，夯爆了！程序员小灰2026-08-17 11:25关注AI导读DeepSeek Harness 开源工具让 AI 从“会聊天”进化到“能干活”，实测完成 PPT 制作、网站开发、项目分析甚至自造插件四大任务，耗时短、费用低，开发者与折腾党必备利器。内容由AI智能生成有用大家好，我是程序员小灰。前两天 AI 圈子传出一个重磅消息：DeepSeek 官宣了他们的 Harness 项目。DeepSeek Harness 从发布开始，GitHub 的关注度就在一路飙升，截至本文发布之时，已经超过 109k Star。或许还有人不知道什么是 Harness，小灰在这里一句话给大家讲清楚。官方有个公式：Agent = Model + Harness，翻译成人话就是"AI 智能体 = 会思考的大脑 + 能干活的身体"。Harness 就是那个"身体"，让 AI 不只会聊天，还能自己动手干活，比如读写文件、上网查资料、写代码、操作电脑。DeepSeek 把它开源了，还支持插件，也就是说，大家可以在这套 “工具箱” 里自行拓展功能。今天这篇文章，我们的重点不是理念，而是实操。我自己刚刚装了 DeepSeek Harness，配好环境，拿它跑了四个不同类型的任务，从做 PPT 到做网站再到项目分析、最后让它给自己造插件，耗时、效果、花费都记录在案。不吹不黑，就让我来分享一下跑出来的真实效果。 # 一、准备：只需要两样东西 Node.js：
- 去官网下载 LTS 版本，一路下一步装完
- DeepSeek API Key：
- 到 DeepSeek 开放平台创建，记得充点钱，API 按量收费

看不懂命令没关系，安装过程中遇到不懂的命令，可以交给任意 AI 工具生成指令，两分钟就能完成配置。

![](https://pics2.baidu.com/feed/d31b0ef41bd5ad6e1804e79fb21b11c9b7fd3c2c.jpeg@f_auto?token=f71f9ec37110d6f7ae9a4eba59c54138)

# 二、安装：两种方式任选

方式一：一行命令（推荐新手）

打开终端，输入：

```
npx @deepseek-ai/dsh web
```

方式二：从源码运行（进阶，方便自己改）

按顺序执行：

```
git clone https://github.com/deepseek-ai/deepseek-harness.gitcd deepseek-harnesspnpm installpnpm run buildpnpm dsh web
```

![](https://pics0.baidu.com/feed/908fa0ec08fa513dd9e3811e0fbd7de9b0fbd98c.jpeg@f_auto?token=c0c5a2a7f1b0d3b5f645fa0c2e840dd2)

两种方式跑完，终端都会输出一个本地网址，一般是 http://127.0.0.1:3080，

浏览器打开，第一次填 API Key，粘贴进去就进首页，安装完成。

![](https://pics6.baidu.com/feed/b7fd5266d0160924d90f8626e7d71de8e7cd34c2.jpeg@f_auto?token=1666fb47c6ea964f270a61538ec3cb02)

# 三、进去之后，四个设置点几下

![](https://pics2.baidu.com/feed/6f061d950a7b020892cbd4da5109dac1562cc8ea.jpeg@f_auto?token=bc39f4eeef5e71cebfc4fa729d3181b3)

然后选一个你想让它操作的项目文件夹，就可以开始干活了。

# 四、实测：我跑的四个任务

我让它干了四件事：做 PPT、做网站、分析项目，最后是让它自己造插件。

任务 1：直接做一份 PPT（标准模式）

打工人最刚需的场景，先热身。这次用标准模式跑，它是能力最全的默认档，文件、网页、子任务全都有，做内容活正合适。给它一份主题和要点，让它直接产出能用的 PPT，而不是只给建议。

提示词：

```
帮我做一份 PPT，主题是「AI 工具入门」，面向完全没接触过 AI 的普通人。一共 10 页，结构如下：第 1 页 封面：大标题 + 副标题「写给不想被时代抛下的你」+ 一句点题的话第 2 页 目录：四个部分第 3 页 为什么现在要学 AI 工具：不讲大道理，讲三个具体场景（写材料、做图、查资料）第 4 页 最值得先学的 3 个工具：对话类、生图类、办公类各一个，每个一句话讲清楚干嘛用的第 5 页 普通人怎么开始上手：三步走，第一周做什么、第一个月做什么第 6 页 常见坑 1：别囤课，别收集一堆工具不用第 7 页 常见坑 2：AI 会一本正经胡说八道，重要的事要核对第 8 页 常见坑 3：别把隐私信息喂给 AI第 9 页 一张「学习路径图」：从今天到三个月后的节奏第 10 页 结尾：一句话总结 + 行动号召视觉要求：整体风格简洁现代，每页一个大标题 + 3 到 5 条短要点，一页不要堆太多字；配色统一，标题色和强调色一致；封面要抓眼球，结尾页要有记忆点。用网页形式做出来（HTML 幻灯片，支持键盘翻页），做完了告诉我文件在哪、怎么打开，我先检查一遍版式和内容。
```

过程与结果：

10 页完整，没有缺页，结构是按提示词一步步来的。

![](https://pics5.baidu.com/feed/0823dd54564e925868a923eaaf52f94acdbf4e73.jpeg@f_auto?token=ef2e05b96ea39466ea6c8b3736473771)

![](https://pics5.baidu.com/feed/58ee3d6d55fbb2fb06c8fa817d9a08b64423dca0.jpeg@f_auto?token=398ef9174d0fafc7e977ff9e7c0e7167)

版式和配色我个人觉得能直接用，文字量也控制住了，每页就几条要点。耗时 3 分 34 秒（6 轮对话、11 步工具调用），输入 149K、输出 20.4K token，缓存命中 73%，首 token 平均 6.9 秒。费用按 V4-Flash 算，空闲时段约 1 毛 6，高峰时段约 3 毛 2。

![](https://pics1.baidu.com/feed/d8f9d72a6059252dd6bcdc53074b2b295ab5b924.jpeg@f_auto?token=e17f443173023b5840cae211e47b75a3)

任务 2：做一个 AI 工具集合网站（PTC 模式）

难度上来一截，要真写代码、真出页面。这次特意切到 PTC 模式试试，它能让 AI 一次生成代码把多步工具调用串起来，适合写网站这种步骤多但逻辑清晰的任务。做一个聚合常用 AI 工具的分类导航站，做完就能打开用。

提示词：

```
帮我做一个「AI 工具集合」网站：1) 按分类展示常用 AI 工具，比如对话、生图、生视频、编程2) 每个工具一张卡片：名称、一句话简介、官网链接3) 支持按分类筛选和关键词搜索4) 界面好看，手机和电脑都能用做完告诉我怎么打开，我先试一下。
```

过程与结果：

做出来挺能打的：网站能直接打开，分类、搜索、筛选功能都是真的能用，不是摆设。审美也在线，手机和电脑都适配，响应式做得到位。

![](https://pics7.baidu.com/feed/838ba61ea8d3fd1f2f397e97049e0d0d94ca5f49.jpeg@f_auto?token=47498fb521cac367f551cf8aff0383a6)

耗时 7 分 05 秒（1 轮对话、8 步工具调用，工具实际执行耗时 27 秒），输入 318K、输出 41.4K token，缓存命中 83%，首 token 平均 2 秒，生成速度 101 tok/s。费用按 V4-Flash 算，空闲时段约 2 毛 8，高峰时段约 5 毛 6。

![](https://pics0.baidu.com/feed/9f2f070828381f30b52ddbe49ad1641a6f06f0ad.jpeg@f_auto?token=fa43592e073b413825e7a23e61830b12)

任务 3：做项目分析（极简模式）

最难的一关，要真读代码、真做判断。这次用 极简模式跑，它只留两个工具，官方说主要是拿来测模型的，我就想看看在这种"几乎裸奔"的环境下，AI 还能不能完成深度分析。给它一个开源项目，让它读完整理出分析报告，说清楚这项目到底行不行。

提示词：

```
工作区里有一个开源项目（D:\gitee\deepseek-harness，DeepSeek Harness 的源码）。帮我做一份项目分析报告：1) 这个项目是干嘛的、解决什么问题2) 整体架构和核心模块有哪些3) 代码质量和设计思路怎么样4) 它的优缺点，以及适合什么样的人用输出成一份结构清晰的分析报告，存成新文件。
```

过程与结果：

结果完全超出我预期。极简模式只有两个工具，它居然产出了一份 222 行的完整分析报告；不是泛泛而谈：项目定位、Cordis 插件树架构、核心包、Turn/Step 运行流、事件溯源会话日志都讲到了，还给出了代码质量评价和"适合谁用"的判断，连"不接受外部 PR"这种细节都挖出来了。

![](https://pics5.baidu.com/feed/f603918fa0ec08faf62b08d36a3e157f54fbdaf9.jpeg@f_auto?token=e1dca39946cd8d4ab137d7d45cfdbbf8)

耗时 1 分 24 秒（1 轮对话、11 步工具调用），输入 406K、输出 7.5K token，缓存命中 80%，首 token 平均 1.5 秒。费用按 V4-Flash 算，空闲时段约 1 毛 7，高峰时段约 3 毛 4。

任务 4：让 AI 给自己造个插件（创造模式）

前三关都是"让 AI 干活"，这一关玩点不一样的：用 创造模式让 AI 给自己造个工具。创造模式能检查系统里现在装着哪些插件、现场试验新插件，是 Harness「一切皆插件」理念最直接的体现。我让它做一个跑任务时能实时看到账户余额的悬浮窗插件，一边干活一边看着钱扣，肉疼感直接拉满。

提示词：

```
帮我在界面上做一个「余额悬浮窗」插件：实时显示 DeepSeek 账户剩余金额，跑任务时能看着钱一点点扣。写完先给我审批，没问题再装。
```

过程与结果：

插件正常装上，余额悬浮窗显示的数字和账户实际余额对得上，装完就能用。

![](https://pics3.baidu.com/feed/b7003af33a87e9503444c4f423e87b51faf2b43c.jpeg@f_auto?token=33e604f8f9e0b6ee8012a80bd28cb26a)

耗时 6 分 48 秒（2 轮对话、15 步工具调用，工具执行 10 分 45 秒），输入 1.2M、输出 44.5K token，缓存命中 89%，首 token 平均 1.4 秒。费用按 V4-Flash 算，空闲时段约 4 毛 5，高峰时段约 9 毛。

# 五、实测感受

四个任务跑下来，我的感受是：

![](https://pics1.baidu.com/feed/11385343fbf2b2115ddb8b78f9504d2a0dd78e75.jpeg@f_auto?token=55c57aa16987edb9e839a54a1155819e)

最让我震惊的是缓存命中率，按总消耗口径算高达 93%。看来我们都错怪梁圣了，就这个定价来看，涨价确实无可厚非。

DeepSeek 已经官宣 8 月 17 日起涨价，涨好几倍，想体验的趁早。即便涨价之后，命中缓存部分的计费单价依旧很低，实际跑任务开销依旧不大。

![](https://pics1.baidu.com/feed/9f510fb30f2442a70e087e3de2938559d0130202.jpeg@f_auto?token=bc9a9bee61a02c4abd6c4eaf1b3559f0)

这东西值不值得装，取决于你想干嘛。会折腾的，拿来当主力干活工具，四类活全能接；不爱折腾的，装上也只会用标准模式，那它就是个比普通聊天 AI 更能干的高级助手。模型便宜是它最大的杀手锏，这个价位的干活能力，市面上找不到第二个。

# 六、插件：装完不折腾一下插件，等于白装

Harness 主打「一切皆插件」，连操作界面都是插件，所以换皮肤这档子事，在它这儿特别简单。我拿它给界面换了个皮肤，全过程四步走。

第一步：安装 dsh 命令（已经安装的请忽略）

插件是通过 dsh 命令管理的，所以先把 dsh 全局装上，装完命令行里直接能用 dsh：

```
npm install -g @deepseek-ai/dsh
```

第二步：安装 UI 插件

我装的是 dsh-web-ui（插件包 + 皮肤合集），一条命令装齐：

```
dsh plugin --profile web add @linxin666/dsh-web-ui-all@0.1.12
```

第三步：重启网页生效

装完按提示重启一下 Harness 网页：

```
dsh web
```

第四步：看效果

装完重启，进「设置 → 插件」就能看到 Web UI 插件了，还默认开启了宠物功能，界面右下角有只鲸鱼娘跟着智能体的工作状态切换动画，挺有意思：

![](https://pics7.baidu.com/feed/9c16fdfaaf51f3de147e1a6da73ed80d382979c9.jpeg@f_auto?token=972a64c7eaf600fc4b590d17bc4d9e2e)

皮肤中心有 10 款皮肤随便换，装上就能试穿，比如这个 Windows XP 怀旧风：

![](https://pics3.baidu.com/feed/d833c895d143ad4b46f7897fb1d272bda60f0692.jpeg@f_auto?token=8db7c064ef1f9f5b1c3acbd6eeb47d82)

这个插件包不止换皮，功能还挺全：任务看板（能让 AI 定时自动干活）、Git 图谱、右侧预览面板、实时 token 统计、移动端远程控制、SSH 远程连接。具体每个功能长啥样，大家可以安装了自行体验。

![](https://pics3.baidu.com/feed/4e4a20a4462309f78fd15ae941de24e1d5cad6f5.jpeg@f_auto?token=2fb752e94c1f037bdb4f2a5182f7f055)

其他插件玩法大同小异，我就不一一展开了，感兴趣的朋友可以自己去折腾。

![](https://pics4.baidu.com/feed/9d82d158ccbf6c816f9878368eee992731fa40a7.jpeg@f_auto?token=1f60c5662df4688b60ab97bd0437a1fa)

让 AI 自己造插件

装别人的只是入门，更狠的是让 AI 给自己造插件，这个我在前面任务 4 里演示过了：用「创造模式」造了余额悬浮窗。

# 七、写在最后

折腾完这四个任务，我的判断是：DeepSeek Harness 现在是开发者的玩具，不是普通人的玩具。安装需要懂一点命令行，玩插件要懂一点代码，但它的能力上限已经验证过了，从内容创作到插件开发都接得住，成本低到可以忽略。

再说点对未来的看法。现在很多人觉得 AI 模型会越来越强，强到不需要 Harness 这类工具。我不太认同，恰恰相反，模型越强，越需要一个好环境来约束它、验证它、让它稳定干活，这个需求只会越来越值钱。

对于还未尝试 DeepSeek Harness 的朋友，我的建议是先装起来，安装成本极低，一条命令的事。装完先干一件你最想干的事，再折腾几个插件，你就知道它跟别的 AI 工具差在哪了。

好了，关于 DeepSeek Harness 的实测，我就先分享到这里。

正在读这篇文章的朋友，你有尝试过 DeepSeek Harness 吗？你对 Harness 如何看待？欢迎在评论区聊一聊你的想法。

我是程序员小灰，我会持续为大家分享最新的AI工具和AI玩法，如果觉得这篇文章对你有所帮助，欢迎点赞、关注、转发，我们下期再见~~

举报/反馈

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_comment.dc6aa49c.png)

0

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_great.9fed2014.png)

0

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_collect.e651bbbd.png)

收藏

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_share.4090f818.png)

分享

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_wechat.9ffaae23.png)微信好友

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_xinlang.7b202670.png)新浪微博

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_lianjie.221aa5a3.png)复制链接

![](https://mbdp01.bdstatic.com/static/landing-pc/img/qrcode_wechat.554f7e9b.png)

扫码分享至微信

![](https://mbdp01.bdstatic.com/static/landing-pc/img/icon_qr_mobile.b5882e13.png)

手机看

百度APP扫一扫
手机看更方便

[设为首页](//www.baidu.com/cache/sethelp/index.html)

[关于百度](//home.baidu.com)

[About Baidu](http://ir.baidu.com)

[使用百度前必读](//www.baidu.com/duty/)

[帮助中心](https://help.baidu.com/question?prod_id=1)

&copy; Baidu

京ICP证030173号

[京公网安备11000002000001号](http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11000002000001)

顶部
