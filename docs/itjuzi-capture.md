# IT桔子增量抓取

这套脚本采用“登录态复用 + 增量抓取 + 本地缓存”的方式，目标是更稳定地补扫 IT 桔子里的 AI 融资信息。

## 设计思路

- 不做全站重爬，只抓 seed 页面和新出现的融资详情链接。
- 登录态保存在专用 Edge profile 中，平时复用，过期后再重新登录一次。
- 原始页面保存在 `data/itjuzi/raw/`，结构化结果保存在 `data/itjuzi/parsed/`。
- 抓取状态保存在 `data/itjuzi/state/`，避免重复抓同一详情页。

## 关键文件

- 配置模板：`/.itjuzi-scraper.example.json`
- 实际配置：`/.itjuzi-scraper.json`
- 登录脚本：`/scripts/itjuzi-login.js`
- 增量抓取脚本：`/scripts/itjuzi-fetch.js`
- PowerShell 包装：`/scripts/run-itjuzi-login.ps1` 和 `/scripts/run-itjuzi-fetch.ps1`

## 首次使用

1. 运行登录脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-itjuzi-login.ps1
```

2. 在弹出的 Edge 窗口里登录 IT 桔子。
3. 登录后可以顺手打开你最常看的融资或 AI 页面。
4. 回到终端按回车，登录态就会持久化到 `data/itjuzi/profile/`。

## 之后的增量抓取

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-itjuzi-fetch.ps1 -Limit 20
```

默认行为：
- 打开配置里的 seed 页面
- 发现新的融资详情链接
- 仅抓还没抓过的新链接
- 提取标题、轮次、金额、日期提示、AI 相关性
- 输出汇总到 `data/itjuzi/parsed/latest-run.json`

## 配置建议

你可以在 `/.itjuzi-scraper.json` 里调整：

- `seedUrls`：你常看的 IT 桔子页面
- `eventUrlPatterns`：融资详情链接模式
- `aiKeywords`：AI 相关关键词
- `detailLimit`：单次抓取上限
- `headless`：是否无头运行

## 当前限制

- 这版先做的是稳定骨架，不是定制到某个具体页面 DOM 的最终版。
- 详情页字段提取目前是启发式解析，适合先补扫，不适合作为唯一真值源。
- 如果 IT 桔子页面结构变化较大，需要再补一轮 selector 定制。
- 如果登录态失效或触发验证码，需要重新跑一次登录脚本。

## 推荐工作流

1. 每周先跑一次 IT 桔子增量抓取。
2. 查看 `data/itjuzi/parsed/latest-run.json` 里的新增候选。
3. 将高信号融资事件再用投资界、36 氪、公司官网做二次核验。
4. 最后把核验后的结果写入周报。
