# JobHunter 黑马大赛开发清单

> **项目方向**：AI 求职作战中枢  
> **清单版本**：v1.2
> **更新日期**：2026-06-04
> **依据文档**：`doc/黑马大赛-JobHunter架构设计文档.md`、`doc/黑马大赛-JobHunter-UX设计文档.md`  
> **使用目的**：作为开发执行清单、进度把控清单、演示前验收清单

---

## 一、当前开发总原则

当前阶段按以下原则推进：

1. **前端优先**：先把 Web 演示链路做稳定；
2. **Mock 先行**：算法真实接口后接，先用 Mock 跑通全流程；
3. **首页为 Base**：视觉和组件体系以已确认首页高保真图为基准；
4. **P0 优先**：先完成可演示闭环，再做增强能力；
5. **一键运维**：启动、升级、迁移必须一键；
6. **Git 真源**：本地开发，Git 提交，远端演示机部署；
7. **可演示第一**：所有页面必须优先保证“能跑、能讲、能回退”。

---

## 二、进度状态定义

建议统一使用以下状态：

| 状态 | 说明 |
|---|---|
| 未开始 | 还未动工 |
| 进行中 | 已开工，但未达到验收标准 |
| 待联调 | 页面完成，等待接口或数据联调 |
| 待验收 | 功能完成，等待自测或演示验收 |
| 已完成 | 满足当前阶段验收标准 |
| 阻塞 | 受数据、接口、环境或设计问题影响无法继续 |

---

## 三、里程碑总览

| 里程碑 | 目标 | 当前建议 |
|---|---|---|
| M1 工程可运行 | 一键启动、本地可开发、Mock 可跑 | 必做 |
| M2 首页基建完成 | 首页 Base、全局布局、设计系统雏形 | 必做 |
| M3 核心闭环完成 | 广场 → 岗位 → 决策卡 → 管线 | 必做 |
| M4 演示增强完成 | 简历工作室、面试作战卡、反馈复盘 | 建议 |
| M5 比赛稳定化 | 一键升级、更新提示、回滚兜底、演示模式 | 必做 |

### 3.1 Review 结论

当前开发清单整体方向是对的，已经覆盖了：

- 工程基建；
- 首页 Base；
- 用户体系；
- 热度广场；
- 岗位雷达；
- 决策卡；
- 求职管线；
- 一键运维；
- 阶段验收门槛。

但经过 review，仍有 4 类需要补强的点：

1. **验证层不足**  
   目前更多是“要做什么”，但还需要“怎么证明做好了”。

2. **高风险运维项要前置**  
   比赛现场最容易出问题的是升级、迁移、缓存、恢复点，而不是静态页面本身。

3. **Demo 稳定化项需要更明确**  
   需要把 Demo 重置、种子数据恢复、版本文件禁缓存、健康检查日志单列出来。

4. **边界 Case 需要变成可勾选的验证清单**  
   否则架构文档里虽然写了边界，但开发过程中容易漏测。

因此本次 review 后，补充以下原则：

- 保留当前 P0 / P1 / P2 结构不变；
- 新增一批 Review 补充 P0；
- 新增“边界 Case 验证门槛”和“高风险验证清单”；
- 完整 Demo 控制台仍保持 P1，但最小验证入口必须前置到 P0。

---

## 四、P0 开发清单

> P0 = 必须完成，否则不进入比赛演示阶段。

### 4.1 工程与运行基建

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-01 | 初始化前端工程骨架 | P0 | 已完成 | 有 `frontend/` 基础工程，可本地运行 |
| P0-02 | 初始化后端工程骨架 | P0 | 已完成 | 有 `backend/` 基础 API 服务，可本地运行 |
| P0-03 | 建立统一目录结构 | P0 | 已完成 | 与架构文档约定一致 |
| P0-04 | 接入 TypeScript / 路由 / 状态管理 | P0 | 已完成 | 页面结构可扩展，能支持后续模块接入 |
| P0-05 | 建立 Mock 数据机制 | P0 | 已完成 | 支持 `mock / api / hybrid` 三种模式 |
| P0-06 | 建立一键命令体系 | P0 | 已完成 | 至少有 `make init / dev / start / migrate / upgrade / health` |
| P0-07 | 建立版本信息机制 | P0 | 已完成 | 有 `version.json` 或等价接口 |
| P0-08 | 建立 Git 分支与发布规范 | P0 | 已完成 | `main / feat/* / hotfix/*` 规则明确 |

子项：

- [x] 建立 `frontend/src/` 分层结构；
- [x] 建立 `backend/api/`、`backend/services/`、`backend/schemas/`；
- [x] 建立 `scripts/` 和 `Makefile`；
- [x] 建立 `.env.local.example` 与 `.env.demo.example`；
- [x] 建立 Demo 数据目录与命名规范；
- [x] 建立 `dataMode` 配置读取方式。

---

### 4.2 全局布局与视觉基础

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-09 | 左侧导航实现 | P0 | 已完成 | 与 UX 文档一致，包含 8 个主入口 |
| P0-10 | 顶部栏实现 | P0 | 已完成 | 包含用户区、身份切换器、更新提示 |
| P0-11 | 深色主题与全局样式 | P0 | 已完成 | 页面整体风格接近首页 Base |
| P0-12 | 基础组件库 | P0 | 已完成 | Button / Input / Modal / Drawer / Badge / Toast 可复用 |
| P0-13 | 首页 Base 业务组件 | P0 | 已完成 | MetricCard / SprintTaskCard / JobCard / SourceBadge / PipelineBoard |

子项：

- [x] 完成 AppLayout；
- [x] 完成 Sidebar 当前选中态；
- [x] 完成 Topbar 身份切换胶囊；
- [x] 完成全局卡片样式、圆角、描边、阴影；
- [x] 完成主色、辅助色、风险色配置；
- [x] 完成桌面主布局，支持后续页面复用。

---

### 4.3 用户体系与身份体系

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-14 | 登录页 | P0 | 已完成 | 可登录、可演示账号一键进入 |
| P0-15 | 注册页 | P0 | 已完成 | 可注册普通账号，失败态明确 |
| P0-16 | 登录态保持 | P0 | 已完成 | 刷新后不丢登录态 |
| P0-17 | 路由守卫 | P0 | 已完成 | 未登录访问主工作区会跳转登录 |
| P0-18 | 顶部求职身份切换器 | P0 | 已完成 | 可切换 persona 并刷新上下文 |
| P0-19 | Demo 用户与 Demo Persona | P0 | 已完成 | 现场可直接进入完整演示态 |

子项：

- [x] 完成 `authStore`；
- [x] 完成 `personaStore`；
- [x] 完成演示账号进入按钮；
- [x] 完成 persona 切换 loading 与失败提示；
- [x] 完成当前身份跨页面保持。

---

### 4.4 首页驾驶舱

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-20 | 首页 Hero 区 | P0 | 已完成 | 文案、按钮、能力雷达图齐全 |
| P0-21 | 首页指标卡 | P0 | 已完成 | 4 张指标卡完整可展示 |
| P0-22 | 今日求职 Sprint | P0 | 已完成 | 任务列表、优先级标签、跳转动作可用 |
| P0-23 | 机会热度广场首页模块 | P0 | 已完成 | 首页可展示热度卡概览 |
| P0-24 | 岗位雷达 Top 推荐首页模块 | P0 | 已完成 | 至少展示 3 张岗位卡 |
| P0-25 | 求职管线首页模块 | P0 | 已完成 | 小型 Kanban 概览可展示 |
| P0-26 | 更新提示入口 | P0 | 已完成 | 右上角可展示“发现新版本” |

子项：

- [x] 首页结构尽量还原已确认高保真图；
- [x] 首页支持 Demo 数据驱动；
- [x] 首页支持移动端纵向卡片流；
- [x] Sprint 能跳转到岗位、管线、素材库；
- [x] 首页指标数据文案合理，不出现明显假数据感。

---

### 4.5 机会热度广场

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-27 | 热度广场页面 | P0 | 已完成 | 有独立页面和路由 |
| P0-28 | 全局热度 / 我的倾向切换 | P0 | 已完成 | 可切换且状态正确 |
| P0-29 | 热度卡组件 | P0 | 已完成 | 展示热度、增长、技能标签 |
| P0-30 | 热度跳转岗位雷达 | P0 | 已完成 | 自动带筛选条件跳转 |

子项：

- [x] 支持冷启动展示全局热度；
- [x] 支持已有画像展示“我的倾向”；
- [x] 支持空状态引导补素材；
- [x] 支持点击方向进入岗位雷达。

---

### 4.6 岗位雷达

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-31 | 岗位雷达页面 | P0 | 已完成 | 页面可独立访问 |
| P0-32 | 岗位卡列表 | P0 | 已完成 | 展示岗位核心信息、匹配度、来源 |
| P0-33 | SourceBadge | P0 | 已完成 | 支持 BOSS / 猎聘 / 官网 / Demo 数据 |
| P0-34 | 岗位筛选器 | P0 | 已完成 | 至少支持城市、来源、优先级、方向 |
| P0-35 | 岗位排序器 | P0 | 已完成 | 至少支持综合推荐 / 匹配度 |
| P0-36 | 岗位详情跳转 | P0 | 已完成 | 能进入岗位决策卡 |
| P0-37 | 加入求职管线入口 | P0 | 已完成 | 可从岗位卡加入管线 |

子项：

- [x] 完成 `jobStore`；
- [x] 完成岗位列表空状态与失败态；
- [x] 完成 100 条以上列表的分页或虚拟滚动预留；
- [x] 完成来源未知、无原始链接等边界处理。

---

### 4.7 岗位决策卡与招聘官视角

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-38 | 岗位决策卡页面 | P0 | 已完成 | 有完整岗位 Hero、决策结论、行动按钮 |
| P0-39 | 命中理由模块 | P0 | 已完成 | 至少展示 3 条可解释理由 |
| P0-40 | 风险提示模块 | P0 | 已完成 | 风险等级和修复建议可展示 |
| P0-41 | 建议行动模块 | P0 | 已完成 | 至少 3 条行动建议可点击 |
| P0-42 | 招聘官视角模块 | P0 | 已完成 | 第一眼印象、亮点、疑点、可能追问可展示 |
| P0-43 | 跳转职业素材库入口 | P0 | 已完成 | 风险修复能跳转到素材库 |

子项：

- [x] 决策卡是岗位雷达详情页，不单独做左侧一级导航；
- [x] 招聘官视角可以内嵌或抽屉形式展示；
- [x] 支持决策数据为空时的 Mock 兜底；
- [x] 支持证据失效时的错误态。

---

### 4.8 职业素材库入口与基础能力

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-44 | 职业素材库基础页 | P0 | 已完成 | 可从首页 / 决策卡 / 简历工作室进入 |
| P0-45 | 素材列表 | P0 | 已完成 | 展示项目、标签、成果、关联技能 |
| P0-46 | 素材详情 | P0 | 已完成 | 可查看证据与详情 |
| P0-47 | 基础编辑能力 | P0 | 已完成 | 至少支持新增 / 编辑 / 删除基础素材 |

子项：

- [x] 支持 Demo 素材一键加载；
- [x] 支持空状态引导；
- [x] 支持从风险修复建议跳转到对应素材；
- [x] 支持与简历工作室的后续联动预留。

---

### 4.9 求职管线

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-48 | 求职管线页面 | P0 | 已完成 | 页面可独立访问 |
| P0-49 | Kanban 列结构 | P0 | 已完成 | 至少包含感兴趣、已定制简历、已投递、HR 沟通、面试中、Offer |
| P0-50 | 管线卡片 | P0 | 已完成 | 展示岗位、公司、下一步、更新时间 |
| P0-51 | 岗位加入管线 | P0 | 已完成 | 从岗位卡 / 决策卡进入管线 |
| P0-52 | 状态变更 | P0 | 已完成 | 桌面可拖拽或按钮切换，移动端至少可按钮切换 |

子项：

- [x] 完成 `pipelineStore`；
- [x] 完成重复加入的合并处理；
- [x] 完成非法状态流转拦截；
- [x] 完成移动端替代交互。

---

### 4.10 更新提示与一键运维能力

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-53 | 版本检查接口或版本文件 | P0 | 已完成 | 页面可感知版本变化 |
| P0-54 | 更新提示组件 | P0 | 已完成 | 顶部可展示“发现新版本” |
| P0-55 | 更新等待页 | P0 | 已完成 | 点击更新后有明确进度反馈 |
| P0-56 | 更新恢复逻辑 | P0 | 已完成 | 更新完成后可恢复到原页面 |
| P0-57 | 一键启动命令 | P0 | 已完成 | 至少有 `make dev / make start` |
| P0-58 | 一键升级命令 | P0 | 已完成 | 至少有 `make upgrade` |
| P0-59 | 一键迁移命令 | P0 | 已完成 | 至少有 `make migrate` |
| P0-60 | 健康检查命令 | P0 | 已完成 | 至少有 `make health` |

子项：

- [x] 前端版本轮询间隔控制；
- [x] 更新失败保留当前版本；
- [x] 本地开发关闭强提示；
- [x] 演示环境开启强提示；
- [x] 迁移前备份数据库；
- [x] 升级后自动做健康检查。

---

### 4.11 全平台适配与演示稳定性

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-61 | 桌面端适配 | P0 | 已完成 | 主演示环境布局稳定 |
| P0-62 | 移动端适配 | P0 | 已完成 | 核心功能可用，不崩布局 |
| P0-63 | 大屏演示模式 | P0 | 已完成 | 首页、广场、岗位、管线可大屏展示 |
| P0-64 | 错误态 / 空状态 / Loading | P0 | 已完成 | 核心页面均有兜底 |
| P0-65 | Demo 数据固化 | P0 | 已完成 | 数据、账号、身份、推荐链路固定可讲 |

### 4.12 Review 补充 P0 项

> 这些任务来自本轮 review，用于补齐“可验证、可回滚、可稳定演示”的缺口。

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P0-66 | Demo 重置命令 | P0 | 已完成 | 可一键恢复 Demo 账号、Demo Persona、Demo 数据 |
| P0-67 | Seed 数据恢复机制 | P0 | 已完成 | 数据污染后可恢复到标准演示态 |
| P0-68 | 版本文件禁缓存验证 | P0 | 已完成 | `version.json` 或等价版本接口不会被浏览器缓存住 |
| P0-69 | 最小验证入口 | P0 | 已完成 | 至少能模拟 Token 过期、API 失败、发现新版本 |
| P0-70 | 日志与健康检查落盘 | P0 | 已完成 | 启动、迁移、升级、回滚都有固定日志文件 |
| P0-71 | 迁移前备份与失败回滚演练 | P0 | 已完成 | 数据迁移失败时可恢复 |
| P0-72 | 恢复点机制验证 | P0 | 已完成 | 更新后能恢复路由、身份、筛选条件 |
| P0-73 | 浏览器缓存清理验证 | P0 | 已完成 | 升级后旧静态资源不会导致白屏或错版 |
| P0-74 | 演示模式固定入口 | P0 | 已完成 | 可一键进入比赛演示模式，数据与布局稳定 |

子项：

- [x] `make reset-demo` 或等价命令；
- [x] 固定 Demo 账号与固定 Persona；
- [x] 固定种子岗位、种子决策卡、种子管线；
- [x] 固定演示入口 `/?mode=demo&reset=demo`；
- [x] `make verify-version-cache` 验证版本文件禁缓存；
- [x] `make verify-validation-sandbox` 验证最小验证入口；
- [x] `make verify-update-restore` 验证更新恢复点；
- [x] `make verify-browser-cache` 验证浏览器缓存清理；
- [x] 升级后自动校验 `version.json` 是否更新；
- [x] 至少保留一个隐藏调试页或调试开关；
- [x] 升级 / 迁移 / 回滚日志固定输出到 `logs/ops/`。

P0 遗留监督：

- 当前 4.12 Review 补充 P0 项已全部完成；后续进入 P1 增强模块前，只保留高风险边界 Case 的人工抽检。

---

## 五、P1 开发清单

> P1 = 建议完成，能明显提升演示质量，但不阻塞核心闭环。

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P1-01 | 简历工作室 | P1 | 已完成 | 有修改前后对比、证据引用入口 |
| P1-02 | 简历版本实验 | P1 | 已完成 | 可展示最佳版本、面试率、版本对比和证据联动 |
| P1-03 | 面试作战卡 | P1 | 已完成 | 可展示高频问题、回答框架、7 天计划和复习交互 |
| P1-04 | 投递反馈复盘 | P1 | 已完成 | 可记录结果、展示复盘趋势 |
| P1-05 | Kanban 拖拽优化 | P1 | 已完成 | 桌面端拖拽体验完整 |
| P1-06 | 证据引用详情 | P1 | 已完成 | 可从决策卡和简历工作室查看证据详情 |
| P1-07 | Demo 控制台 | P1 | 已完成 | 可切换数据模式、模拟 API 失败、模拟版本更新 |

P1 Review 监督：

- [x] P1-01 新增代码已完成 Review；
- [x] 已将简历工作室主体抽到 `ResumeStudioWorkspace`，避免 `/resume` 页面继续膨胀；
- [x] 已将职业素材跳转路径收敛到 `careerVaultService`，避免从岗位决策服务转出口；
- [x] 已将简历版本默认命名收敛到 `resumeStudioService`，避免展示组件硬编码；
- [x] 已保留 `resumeStudioStore` 按岗位隔离草稿状态，后续可扩展到 P1-02 简历版本实验。

### 5.1 P1 子小节拆分

> 后续 P1 按以下小节逐步开发；每个小节完成后先 Review / 重构，再更新本文档并进入下一小节。

| 小节 | 覆盖任务 | 状态 | 主要交付 | 验收标准 |
|---|---|---|---|---|
| P1-A 简历工作室收口 | P1-01 | 已完成 | 岗位定制简历、修改前后对比、证据引用、版本草稿 | `/resume?job=job_1001` 可展示 Diff、证据、接受 / 撤回 / 复制 / 保存 |
| P1-B 简历版本实验基础 | P1-02 | 已完成 | Resume A/B Lab 页面、版本列表、最佳版本推荐、核心指标卡 | 可展示投递数、面试数、无回复数、面试率和最佳版本 |
| P1-C 简历版本对比与联动 | P1-02、P1-06 | 已完成 | 版本对比、版本详情、从版本跳回简历工作室、证据引用详情入口 | 可选择两个版本对比，并能查看引用证据 / 修改建议 |
| P1-D 面试作战卡基础 | P1-03 | 已完成 | 公司简报、面试重点、高频问题、回答框架、关联证据 | `/interview` 不再是占位页，可展示岗位级面试作战卡 |
| P1-E 面试准备计划交互 | P1-03、P1-06 | 已完成 | 7 天计划、复习状态、复制回答要点、补充素材跳转 | 可标记复习、复制要点，并能跳转职业素材补充故事 |
| P1-F 投递反馈复盘基础 | P1-04 | 已完成 | 反馈总览、面试率 / 无回复率、最近跟进、复盘趋势 | `/feedback` 可展示反馈统计和下一轮策略建议 |
| P1-G 反馈录入与管线联动 | P1-04、P1-05 | 已完成 | 岗位结果标记、原因选择、备注、管线状态同步 | 可对管线岗位标记收到面试 / 被拒 / 无回复 / 放弃 |
| P1-H Kanban 桌面拖拽优化 | P1-05 | 已完成 | 桌面拖拽、失败回滚、移动端状态菜单保底 | 桌面端可拖拽变更状态，移动端仍可按钮切换 |
| P1-I 证据引用详情统一化 | P1-06 | 已完成 | 统一证据详情卡 / 抽屉，供决策卡、简历、面试复用 | 同一证据详情组件可被 3 个模块调用，无重复 UI |
| P1-J Demo 控制台完整化 | P1-07 | 已完成 | 数据模式切换、API 失败模拟、版本更新模拟、Demo 重置入口 | `/settings` 或 `/debug` 可集中控制演示场景 |

P1 推荐开发顺序：

```text
P1-A 已完成
  ↓
P1-B 已完成
  ↓
P1-C 已完成
  ↓
P1-D 已完成
  ↓
P1-E 已完成
  ↓
P1-F 已完成
  ↓
P1-G 已完成
  ↓
P1-H 已完成
  ↓
P1-I 已完成
  ↓
P1-J 已完成
```

P1 每小节固定完成门槛：

- [ ] 新增代码完成 Review，确认无明显重复逻辑和散落配置；
- [ ] 页面级组件只做组合，复杂逻辑进入 `services` / `stores` / `hooks`；
- [ ] Mock 数据从 `frontend/src/data/demoData.ts` 统一暴露；
- [ ] 至少通过 `npm run build` 和 `git diff --check`；
- [ ] 完成后更新本清单状态和模块进度总表。

P1-B 完成记录：

- [x] 已新增 `/resume-lab` 简历版本实验基础页；
- [x] 已展示版本数、投递数、面试数、无回复数、综合面试率；
- [x] 已展示最佳版本推荐和当前最高面试率；
- [x] 已展示版本列表、适合岗位方向和调整建议；
- [x] 已完成 Review：简历版本实验保持页面内入口，不新增左侧一级导航；路径计算集中在 `resumeLabService`。
- [x] 已完成 Review 修复：补充空版本兜底，避免真实数据为空时 `/resume-lab` 崩溃。
- [x] 已完成重构：移除 `summary.best_version_name` 冗余配置，最佳版本名称统一从版本实体派生。
- [x] 已通过 `npm run typecheck`、`npm run build`、`git diff --check`。

P1-C 完成记录：

- [x] 已新增简历版本详情区域，可查看关键修改、修改前后文案和修改原因；
- [x] 已新增证据入口，版本详情中的证据可跳转到 `/resume?job=...&evidence=...`；
- [x] 已新增投递岗位入口，可从版本详情跳转对应岗位决策卡；
- [x] 已新增两个版本对比能力，支持 URL 参数 `compare` 和页面内下拉切换；
- [x] 已完成 Review：对比路径、版本选择、证据解析、岗位解析均收敛到 `resumeLabService`，页面只负责组合渲染。

P1-D 完成记录：

- [x] 已新增 `/interview` 面试作战卡页面，替换原占位页；
- [x] 已展示公司简报、岗位关注、面试风格和面试重点；
- [x] 已展示高频问题、面试官意图、回答框架、回答风险和关联证据；
- [x] 已展示 7 天准备计划预览和反问面试官建议；
- [x] 已完成岗位级联动：岗位决策卡、职业素材库可跳转 `/interview?job=job_1001`；
- [x] 已完成 Review：面试路径与证据解析收敛到 `interviewGuideService`，Mock 数据从 `demoData` 统一暴露。

P1-E 完成记录：

- [x] 已新增 7 天准备计划复习状态，可标记 / 取消复习；
- [x] 已新增复习进度统计，显示 `已复习 / 总计划数`；
- [x] 已新增回答要点复制，复制内容由 `interviewGuideService` 统一格式化；
- [x] 已新增缺失素材补充入口，问题卡可跳转职业素材库补齐证据；
- [x] 已新增 `interviewGuideStore`，按岗位隔离面试准备状态；
- [x] 已完成 Review：问题卡和计划卡拆为业务组件，状态、路径和复制格式均未散落在页面中。
- [x] 已完成 Review 修复：复习状态 selector 使用稳定空对象兜底，避免 Zustand snapshot 无限更新。
- [x] 已完成 Review 修复：抽取全局 Toast 封装，复制提示改为固定安全区展示，避免被页面内容遮挡。
- [x] 已完成全局 Toast 替换：页面内联 notice、局部定时提示、管线跳转 state notice 已统一迁移到 `useToast()`。
- [x] 已完成 Toast 复用约束：`<Toast />` 仅由 `ToastViewport` 挂载，业务侧只传 `ToastInput`，管线提示文案收敛到 `pipelineNoticeService`。

P1-F 完成记录：

- [x] 已新增 `/feedback` 投递反馈复盘基础页，替换原占位页；
- [x] 已新增反馈总览指标：投递记录、面试数、面试率、无回复率、被拒数、待跟进；
- [x] 已新增结果分布、复盘趋势、简历版本反馈表现、最近反馈记录、最近跟进和下一轮策略建议；
- [x] 已新增 `feedback-review.json` Mock 数据，覆盖面试、无回复、被拒、已投递等结果；
- [x] 已新增 `feedbackReviewService`，反馈统计、趋势、版本表现、跟进列表均收敛到服务层；
- [x] 已新增 `FeedbackRecordCard` 业务卡片，反馈记录展示和岗位 / 简历 / 面试跳转不散落在页面中；
- [x] 已完成 Review 重构：抽取 `CompactStatCard`，复用简历实验和反馈复盘中的小型统计卡，减少重复 UI 代码。
- [x] 已完成 Review 重构：反馈结果文案、颜色、管线状态映射集中到 `feedbackReviewService`，避免页面和卡片重复配置。

P1-G 完成记录：

- [x] 已新增 `FeedbackEntryForm`，支持选择岗位、结果、简历版本、原因标签和备注；
- [x] 已新增 `feedbackReviewStore`，反馈记录可按岗位更新或新增，并支持 Demo 重置恢复；
- [x] 已完成反馈录入与求职管线联动：收到面试 / Offer / 被拒 / 无回复 / 放弃会同步对应管线状态和下一步动作；
- [x] 已扩展 `pipelineStore.syncEntry`，反馈同步可直接对齐最终状态，避免被常规推进顺序误拦截；
- [x] 已新增管线“归档结果”区，展示被拒和放弃岗位，避免非活跃状态从主 Kanban 消失后不可见；
- [x] 已完成 Review 重构：反馈默认备注、默认下一步、标签解析和 outcome 选项统一收敛到 `feedbackReviewService`。
- [x] 已完成 Review 修复：反馈表单同步状态使用 `pipelineStatusLabel` 展示中文状态，避免枚举值外露。

P1-H 完成记录：

- [x] 已新增桌面端 Kanban 拖拽，岗位卡可拖到目标列完成状态变更；
- [x] 已保留移动端按钮推进作为兜底交互；
- [x] 已完成非法状态流转拦截，拖拽到非法列时复用管线 Toast 提示，不破坏原状态；
- [x] 已完成同列拖拽忽略，避免误弹非法流转提示；
- [x] 已新增拖拽高亮和卡片拖拽态，提升桌面演示反馈；
- [x] 已完成 Review 重构：拖拽状态和 drop 处理抽到 `usePipelineDrag`，页面只负责组合渲染。

P1-I 完成记录：

- [x] 已新增统一 `EvidenceDetailCard`，集中展示证据标题、类型、摘要、量化成果、STAR 结构和关联技能；
- [x] 已新增统一 `EvidenceDetailDrawer`，供岗位决策卡、简历工作室、面试作战卡和简历版本详情复用；
- [x] 已完成证据缺失兜底：证据 ID 找不到素材时展示缺失态，并提供补充职业素材入口；
- [x] 已完成证据编辑联动：证据详情内可跳转 `/resume?job=...&evidence=...` 定位对应职业素材；
- [x] 已完成 Review 重构：证据详情打开 / 关闭状态抽到 `useEvidenceDetail`，避免页面重复维护 `activeEvidenceId`。

P1-J 完成记录：

- [x] 已将 `/settings` 和 `/debug` 升级为完整 Demo 控制台，集中承载演示状态和高风险链路模拟；
- [x] 已支持运行时切换 `mock` / `api` / `hybrid` 数据模式，并持久化到 `appStore`；
- [x] 已新增 Demo 数据状态面板，集中展示登录态、岗位数据、职业素材、管线卡片、反馈记录和简历草稿数量；
- [x] 已新增控制台内 Demo 重置入口，重置数据模式、账号、身份、岗位筛选、职业素材、简历工作室、反馈复盘和求职管线；
- [x] 已集中支持 Token 过期、API 失败、发现新版本、更新失败模拟，结果统一展示在验证结果面板；
- [x] 已完成 Review 重构：数据模式选项、场景卡片和状态 Badge 映射收敛到 `demoConsoleService`，避免页面散落配置；
- [x] 已完成 Review 优化：顶部栏只保留用户与身份上下文，数据模式、版本、Demo 重置、检查更新和退出登录统一迁移到 `/settings`；
- [x] 已新增个人设置统一入口：可在 `/settings` 修改昵称、邮箱、身份名称、目标方向、目标城市和核心技能，并同步顶部栏与身份上下文；
- [x] 已完成 Review 重构：个人设置表单抽为 `ProfileSettingsForm`，列表解析和校验收敛到 `profileSettingsService`，避免设置页继续膨胀；
- [x] 已新增演示偏好：可在 `/settings` 开关大屏 Demo 模式，并复制 / 进入固定演示入口 `/?mode=demo&reset=demo`；
- [x] 已新增系统连通性检查：可在 `/settings` 检查 API 健康状态，切换 `api` / `hybrid` 前可先验证后端可用性；
- [x] 已完成 Review 重构：设置页大块面板抽到 `SettingsPanels`，`ValidationPage` 只保留状态组合和动作编排；
- [x] 已通过 `npm run typecheck`、`npm run build`、`git diff --check`。

---

## 六、P2 开发清单

> P2 = 比赛后续增强，不进入本轮主计划。

| ID | 任务 | 优先级 | 状态 | 说明 |
|---|---|---|---|---|
| P2-01 | PWA 增强 | P2 | 未开始 | 支持离线能力和桌面安装 |
| P2-02 | 浏览器插件 | P2 | 未开始 | 后续探索 |
| P2-03 | 自动填表 | P2 | 未开始 | 不纳入当前比赛主线 |
| P2-04 | 真实岗位爬虫 | P2 | 未开始 | 可选增强 |
| P2-05 | 实时面试 Copilot | P2 | 未开始 | 非当前重点 |
| P2-06 | 个性化推荐学习 | P2 | 未开始 | 等反馈闭环成熟后再做 |

---

## 七、P3 后台接口开发清单

> P3 = 后台接口最小闭环，让当前前端可从 Mock 平滑切到 API / hybrid，并支持本地极速部署。

### 7.1 后台服务完整架构

P3 后台以当前前端最新代码为接口落点，优先满足：**性能佳、易扩展、调用简单、极速部署**。

技术栈：

| 能力 | 选型 | 说明 |
|---|---|---|
| Web 框架 | FastAPI | 延续当前 `backend/` 骨架 |
| 数据库 | PostgreSQL | P3 起不再新增 SQLite 业务表 |
| 缓存 / 任务状态 | Redis | 用于缓存、任务状态、更新进度和轻量锁 |
| ORM / Migration | SQLAlchemy 2.x + Alembic | 所有表结构变更必须走 migration |
| DTO | Pydantic | 请求 / 响应结构统一约束 |
| 鉴权 | JWT access token + refresh token | 支持本地 Demo 和后续真实账号 |
| 文件存储 | 本地 `data/uploads` | P3 只支持简历文件本地上传和 Demo 样例简历 |
| 本地开发 | Vite + FastAPI 独立启动 | 前端保留热更新 |
| 完整部署 | FastAPI 托管 `frontend/dist` | 一条命令可启动完整演示环境 |

后台分层：

```text
backend/
  api/              # Router：路由、参数、依赖注入
  schemas/          # 请求 / 响应 DTO
  services/         # 业务编排、缓存策略、权限判断
  repositories/     # PostgreSQL 数据访问
  models/           # SQLAlchemy ORM
  core/             # 配置、响应、异常、中间件、安全、Redis、DB
  tasks/            # 任务状态、进度事件、轻量异步任务
  integrations/     # 后续 LLM / 外部数据源 / 更新脚本适配
```

运行链路：

```text
Frontend Service / Store
  ↓
API Client
  ↓
FastAPI Router
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL

Redis：
- 接口短缓存
- 决策卡 / 招聘官视角 / 简历定制 / 面试作战卡生成结果缓存
- 更新任务 / AI 生成任务状态
- 短 TTL 幂等键和轻量锁
```

架构边界：

- Router 不写业务逻辑；
- Service 不散写 SQL；
- Repository 不处理页面展示逻辑；
- 配置集中在 `core/config.py`；
- `user_id` 由后端从 Token / Demo Session 注入，禁止信任前端传入；
- 求职方向相关数据必须贯穿 `persona_id`；
- Redis 本阶段只做缓存和任务状态，不引入 Celery / RQ；
- 前端页面只调用业务 service / store，不直接处理底层请求、缓存和错误。

### 7.2 API 响应结构

P3 后端统一响应以当前前端 `frontend/src/services/apiClient.ts` 为准：

```ts
interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  request_id: string;
}
```

约定：

- 成功：`success = true`，`code = "OK"`；
- 失败：`success = false`，`data = null`；
- `request_id` 必须贯穿日志和响应；
- 架构文档中的数字错误码作为历史设计参考，P3 不强行切换，避免当前前端 API client 断裂。

建议错误码：

| code | 说明 |
|---|---|
| `OK` | 成功 |
| `AUTH_EXPIRED` | 未登录或 Token 过期 |
| `FORBIDDEN` | 无权限访问该用户数据 |
| `VALIDATION_ERROR` | 参数错误 |
| `RESOURCE_NOT_FOUND` | 资源不存在 |
| `CONFLICT` | 状态冲突或重复操作 |
| `SERVICE_ERROR` | 服务内部错误 |
| `MOCK_DATA_ERROR` | Mock / Seed 数据加载失败 |
| `TASK_FAILED` | 任务执行失败 |

### 7.3 API 契约补充

P3 接口契约必须优先兼容当前前端 Mock 类型和页面调用习惯：

- 前端可见 ID 统一使用字符串，后端如使用自增主键，需要额外提供稳定 `public_id`；
- 时间字段统一 ISO 8601 字符串；
- 列表响应统一包含 `items` 和 `pagination`；
- 列表接口必须声明 `page`、`page_size`、筛选、排序默认值，`page_size` 必须有上限；
- 写接口必须支持重复点击兜底，必要时使用唯一约束或 `Idempotency-Key`；
- 生成类接口和更新任务接口必须返回 `task_id` 或可复用的缓存结果；
- `Authorization`、`X-Request-ID`、`Idempotency-Key` 作为通用请求头预留；
- `persona_id` 优先从当前激活身份解析，允许查询参数覆盖时必须校验归属；
- 文件上传仅允许简历相关格式，并限制大小、类型和错误提示；
- 前端 `apiClient` 在 P3-J 需要补齐 `GET / POST / PATCH / DELETE`、Auth Header 和统一错误处理。

### 7.4 P3 总任务清单

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|---|---|---|---|---|
| P3-01 | 后端工程分层与配置 | P3 | 待验收 | Router / Service / Repository / Model / Schema 分层清晰，配置集中 |
| P3-02 | PostgreSQL 接入与 Alembic 迁移 | P3 | 已完成 | 可执行 migration，核心表可创建，可重复迁移 |
| P3-03 | Redis 接入与缓存 / 任务状态抽象 | P3 | 已完成 | 有统一 Redis client、key 规范、TTL 和降级策略 |
| P3-04 | 统一响应、异常、request_id、中间件 | P3 | 待验收 | 所有接口返回统一 `ApiResponse<T>`，异常不裸露堆栈 |
| P3-05 | Auth / 用户资料 API | P3 | 已完成 | 登录、注册、刷新、退出、个人资料读写可用 |
| P3-06 | Persona API | P3 | 已完成 | 身份列表、新增、编辑、激活可用，`persona_id` 可贯穿 |
| P3-07 | Mock Bootstrap / Demo Reset API | P3 | 已完成 | 后端可输出当前前端 Demo 所需完整数据并支持重置 |
| P3-08 | Market / Jobs API | P3 | 已完成 | 机会广场、岗位列表、岗位详情可被前端读取 |
| P3-09 | Vault / Resume API | P3 | 已完成 | 职业素材、简历版本、简历工作室基础接口可用 |
| P3-10 | Decision / Recruiter Lens / Tailor API | P3 | 已完成 | 生成类接口有 Mock 生成、缓存和任务状态 |
| P3-11 | Pipeline API | P3 | 已完成 | 加入管线、状态推进、备注更新、重复加入兜底可用 |
| P3-12 | Resume Lab / Feedback API | P3 | 已完成 | 简历实验数据、反馈录入、反馈趋势可用 |
| P3-13 | Interview / Sprint / Task Progress API | P3 | 部分完成 | 面试作战卡、冲刺任务、任务进度查询可用 |
| P3-14 | System Health / Version / Update API | P3 | 已完成 | 健康检查、版本、更新任务状态可用 |
| P3-15 | 前端 API / hybrid 联调 | P3 | 进行中 | `mock / api / hybrid` 可切换，核心页面不缺接口 |
| P3-16 | 后端测试、脚本、文档收口 | P3 | 待验收 | smoke test、health、部署命令和清单状态完成 |

### 7.5 当前前端接口覆盖矩阵

> 以下接口按当前前端路由、Store 写操作、Mock 数据结构和设置页调试能力整理，P3 开发时不得遗漏。

| 前端模块 | 后端接口 | 说明 |
|---|---|---|
| 登录 / 注册 | `POST /api/auth/login`、`POST /api/auth/register`、`POST /api/auth/logout`、`POST /api/auth/refresh`、`GET /api/auth/me`、`PATCH /api/auth/me` | 覆盖 `AuthPage`、个人设置和退出登录 |
| 首页驾驶舱 | `GET /api/dashboard`、`GET /api/sprint`、`GET /api/pipeline`、`GET /api/jobs` | 覆盖首页指标、冲刺任务、推荐岗位和管线概览 |
| Persona / 顶部切换 | `GET /api/personas`、`POST /api/personas`、`PATCH /api/personas/{id}`、`POST /api/personas/{id}/activate` | 覆盖身份切换和设置页身份编辑 |
| 机会热度广场 | `GET /api/market`、`GET /api/market/directions/{id}/jobs`、`POST /api/market/directions/{id}/favorite`、`POST /api/market/directions/{id}/apply-preference` | 覆盖全局 / 个性化热度和方向跳转 |
| 岗位雷达 | `GET /api/jobs`、`GET /api/jobs/{id}` | 支持筛选、排序、详情入口和来源标识 |
| 岗位决策卡 | `GET /api/jobs/{id}/decision`、`GET /api/jobs/{id}/recruiter-lens`、`GET /api/decisions` | 支持决策卡、招聘官视角和决策卡列表 |
| 职业素材库 | `GET /api/vault`、`POST /api/vault/items`、`PATCH /api/vault/items/{id}`、`DELETE /api/vault/items/{id}` | 支持素材列表、新增、编辑、删除和证据跳转 |
| 简历 / 简历工作室 | `POST /api/resumes/upload`、`POST /api/resumes/demo`、`GET /api/resumes/versions`、`POST /api/resumes/versions`、`GET /api/resumes/{id}/profile`、`GET /api/resume-studio?job_id=`、`POST /api/tailor/run` | 支持上传简历、加载样例、画像、岗位定制简历和保存版本 |
| 简历版本实验 | `GET /api/resume-lab`、`GET /api/resume-lab/compare` | 支持版本列表、最佳版本和版本对比 |
| 面试作战卡 | `POST /api/interview/start`、`GET /api/interview/cards?job_id=` | 支持按岗位生成和读取面试卡 |
| 反馈复盘 | `GET /api/feedback`、`POST /api/feedback`、`PATCH /api/feedback/{id}` | 支持反馈统计、录入和更新 |
| 求职管线 | `GET /api/pipeline`、`POST /api/pipeline/cards`、`PATCH /api/pipeline/cards/{id}` | 支持加入、状态推进、备注和提醒 |
| Demo / 设置 | `GET /api/mock/bootstrap`、`POST /api/demo/reset`、`GET /api/demo/summary` | 支持 Demo 初始化、重置和控制台摘要 |
| 系统能力 | `GET /api/health`、`GET /api/version`、`GET /api/system/health`、`GET /api/system/version`、`GET /api/system/update/check`、`POST /api/system/update/apply`、`GET /api/system/update/status/{id}`、`GET /api/tasks/{id}/events` | 支持健康检查、版本更新、任务状态和 SSE 可选进度；保留当前短路径别名 |
| 调试验证 | `GET /api/debug/failure` | 支持设置页 API 失败验证 |

### 7.6 P3 子小节拆分

> P3 按以下小节逐步开发；每个小节完成后先 Review / 重构，再更新本文档并进入下一小节。

| 小节 | 覆盖任务 | 状态 | 主要交付 | 验收标准 |
|---|---|---|---|---|
| P3-A 后端基础架构与一键启动 | P3-01、P3-04、P3-16 | 已完成 | 分层目录、配置、依赖、Docker Compose、`make dev`、`make deploy-local` | 一条命令可启动开发环境和完整部署环境，端口占用和 Docker 缺失有明确提示 |
| P3-B PostgreSQL 数据模型与迁移 | P3-02 | 已完成 | SQLAlchemy、Alembic、核心表、索引、迁移脚本 | migration 可重复执行，核心表和索引符合前端数据需要 |
| P3-C Redis 缓存与任务状态 | P3-03、P3-13 | 已完成 | Redis client、key 规范、TTL、任务状态抽象 | 缓存可读写，Redis 不可用时有明确降级，写入后能失效相关缓存 |
| P3-D Auth / User / Persona | P3-05、P3-06 | 已完成 | 认证、个人设置、身份列表、身份切换 | 登录注册、刷新、退出、资料编辑和 Persona 切换可用 |
| P3-E Demo Seed / Bootstrap / Reset | P3-07 | 已完成 | Demo 数据入库、Bootstrap、Reset | API 返回结构覆盖当前 `frontend/src/mocks` 全量数据 |
| P3-F 核心业务读接口 | P3-08、P3-09 | 已完成 | Dashboard、Market、Jobs、Vault、Resume Lab 读接口 | 前端核心读页面可切到 API 模式，列表分页 / 筛选 / 空状态稳定 |
| P3-G 生成类接口 | P3-10、P3-13 | 已完成 | Decision、Recruiter Lens、Tailor、Interview Mock 生成和缓存 | 重复请求命中缓存，任务状态可查询，超时可回退最近缓存 |
| P3-H 写入类接口 | P3-11、P3-12 | 已完成 | Pipeline、Feedback、Vault、Resume Version 写接口 | 写入后刷新可保留状态，重复/非法操作有兜底 |
| P3-I 系统健康、版本、更新任务 | P3-14 | 已完成 | Health、Version、Update、Task Events | 设置页健康检查和更新任务状态可用 |
| P3-J 前端 hybrid 联调与回归验收 | P3-15、P3-16 | 进行中 | 前端 adapter、smoke test、文档收口 | `mock / api / hybrid` 切换稳定，核心链路无缺口，API 失败不会白屏 |

P3 推荐开发顺序：

```text
P3-A 后端基础架构与一键启动
  ↓
P3-B PostgreSQL 数据模型与迁移
  ↓
P3-C Redis 缓存与任务状态
  ↓
P3-D Auth / User / Persona
  ↓
P3-E Demo Seed / Bootstrap / Reset
  ↓
P3-F 核心业务读接口
  ↓
P3-G 生成类接口
  ↓
P3-H 写入类接口
  ↓
P3-I 系统健康、版本、更新任务
  ↓
P3-J 前端 hybrid 联调与回归验收
```

### 7.7 P3 一键启动 / 极速部署目标

P3-A 必须先完成以下命令目标，后续接口开发才能继续：

```bash
make init          # 首次安装依赖、生成 .env、检查环境
make bootstrap-system # Ubuntu / Debian 服务器系统依赖自检和安装
make dev           # 本地开发：Vite 前端 + FastAPI 后端 + PostgreSQL + Redis
make migrate       # 执行 PostgreSQL Alembic migration
make seed-demo     # 初始化 / 恢复 Demo 数据
make health        # 检查前端、后端、PostgreSQL、Redis
make deploy-local  # 本地完整部署：构建前端后由 FastAPI 托管静态产物
make deploy-start  # 后台启动完整部署环境，写入 pid 和运行日志
make deploy-stop   # 停止后台部署服务
make deploy-status # 查看后台部署状态
make deploy-logs   # 跟踪后台部署日志
```

`make dev` 默认行为：

- 启动 PostgreSQL；
- 启动 Redis；
- 执行迁移；
- 启动 FastAPI；
- 启动 Vite；
- 保留前端热更新。

`make deploy-local` 默认行为：

- 构建前端；
- 启动 PostgreSQL 和 Redis；
- 执行迁移和 Demo seed；
- 启动 FastAPI；
- FastAPI 托管 `frontend/dist`；
- 适合演示、快速交付和另一台机器拉代码后直接运行。

`make deploy-start / deploy-stop / deploy-status / deploy-logs` 默认行为：

- 后台启动完整部署环境，不占用 SSH 终端；
- `logs/runtime/jobhunter.pid` 记录运行 PID；
- `logs/runtime/deploy.log` 记录 Uvicorn 运行日志；
- 启动前检查端口占用，避免重复部署冲突；
- 启动后等待 `/api/health` 通过，不通过则清理 PID 并输出最近日志。

### 7.8 P3 每小节固定完成门槛

- [ ] 新增代码完成 Review，确认无明显重复逻辑和散落配置；
- [ ] Router 只做入参 / 出参 / 依赖注入，业务逻辑进入 Service；
- [ ] 数据访问统一进入 Repository，不在 Router / Service 中散写 SQL；
- [ ] 配置统一进入 `core/config.py`，禁止业务代码硬编码连接串、TTL、密钥；
- [ ] 所有接口统一 `ApiResponse<T>`，并携带 `request_id`；
- [ ] 涉及用户数据的接口必须由后端注入 `user_id`，不能信任前端传入；
- [ ] 涉及求职方向的数据必须贯穿 `persona_id`；
- [ ] Redis key 命名、TTL、缓存降级策略在对应小节声明，用户 / 身份相关缓存必须隔离；
- [ ] 写接口必须有事务、幂等或唯一约束，重复点击不产生脏数据；
- [ ] 写接口完成后必须清理或刷新相关 Redis 缓存；
- [ ] 列表接口必须有分页、筛选、排序默认值和最大 `page_size`；
- [ ] 文件上传必须校验大小、类型和失败兜底；
- [ ] CORS、前端独立启动端口、完整部署静态托管路径已验证；
- [ ] PostgreSQL 结构变更必须通过 Alembic migration 管理；
- [ ] 至少通过 `python -m compileall backend`、`git diff --check`、`make health`；
- [ ] 有后端 smoke test / 单测覆盖本小节关键接口；
- [ ] 完成后更新本清单状态和模块进度总表。

### 7.9 P3 Review 监督

- [ ] 接口覆盖当前前端路由、Store 写操作、Mock 数据模块和设置页调试能力；
- [ ] 架构文档核心接口均已被 P3 覆盖：上传简历、加载样例简历、简历画像、简历版本列表、决策卡列表不能遗漏；
- [ ] 后端响应结构与当前 `apiClient.ts` 保持兼容；
- [ ] PostgreSQL migration 替换当前 SQLite 迁移思路；
- [ ] Redis 只用于缓存和任务状态，不提前引入复杂队列；
- [ ] 生成类接口有超时、失败、最近一次成功缓存和任务状态兜底；
- [ ] SSE 不可用时必须允许轮询任务状态；
- [ ] 一键启动脚本能重复执行，不破坏本地数据；
- [ ] 端口占用、Docker 未启动、`.env` 缺失、数据库未启动、Redis 未启动都有明确错误；
- [ ] 前端页面不直接拼底层 API，调用统一收敛到 service / store；
- [ ] 完成 P3-J 后，`mock / api / hybrid` 三种模式均可走完整核心链路。

P3 Review 补充结论：

- 已补齐架构文档中容易遗漏的 `/api/resumes/upload`、`/api/resumes/demo`、`/api/resumes/versions`、`/api/resumes/{id}/profile`、`/api/decisions`；
- 已明确 `/api/health`、`/api/version` 与 `/api/system/health`、`/api/system/version` 的兼容关系；
- 已把分页、幂等、缓存失效、文件上传、CORS、端口占用和 Redis 降级列为固定门槛；
- 已确认 P3 仍保持最小闭环，不把 Celery / RQ、真实爬虫、生产级监控纳入当前阶段。

P3-A 完成记录：

- [x] 已新增 `docker-compose.yml`，提供 PostgreSQL 16 和 Redis 7；
- [x] 已新增 `make bootstrap-system / infra-up / infra-down / infra-logs / deploy-local / deploy-start / deploy-stop / deploy-status / deploy-logs / seed-demo`；
- [x] 已将 Ubuntu / Debian 服务器系统依赖自检和安装并入 `make init`，覆盖 `python3-venv`、Node.js、npm、Docker、Docker Compose、git、make；
- [x] 已修复后端虚拟环境半初始化问题：如果 `backend/.venv` 缺少 `bin/activate`，`make init` 会自动删除并重建；
- [x] 已将 `make dev`、`make start`、`make deploy-local` 串接 PostgreSQL / Redis 启动和迁移；
- [x] 已将迁移基线切到 Alembic，新增 `backend/alembic.ini`、`backend/migrations/` 和 `0001_p3a_baseline`；
- [x] 已新增 `DATABASE_URL`、`REDIS_URL` 等环境变量样例；
- [x] 已增强 `/api/health`，可返回 PostgreSQL / Redis 依赖状态；
- [x] 已新增 `/api/system/health`、`/api/system/version`，兼容 P3 接口规划；
- [x] 已修复 Alembic 与 psycopg v3 的驱动兼容：迁移统一使用 `postgresql+psycopg://`，旧 `postgresql://` 写法自动兼容；
- [x] 已新增后台部署脚本：`make deploy-start / deploy-stop / deploy-status / deploy-logs`，支持 PID、日志和端口占用检查；
- [x] 已完成本地静态验证：`python3 -m compileall backend`、`npm run typecheck`、`npm run build`、`bash -n scripts/*.sh`、`git diff --check`；
- [x] 已完成远程服务器验证：Docker 启动后执行 `make init && make infra-up && make migrate`，PostgreSQL / Redis 容器健康；
- [x] 已完成远程服务器验证：执行 `make deploy-local`，确认 FastAPI 可托管前端静态产物，`0.0.0.0:8000` 可公网访问。

P3-B 完成记录：

- [x] 已将算法侧岗位原始 JSON 样本记录到架构文档 `5.15.3.1 岗位原始数据样本`；
- [x] 已确认算法侧当前字段可作为 `job_source_records` 输入，后端后续负责清洗、归一化和用户态决策生成；
- [x] 已新增 SQLAlchemy ORM 基础层：`models/base.py`、`models/__init__.py`；
- [x] 已新增核心业务模型：User、Persona、JobSourceRecord、Job、Market、Vault、Resume、Decision、Pipeline、Feedback、Task、System；
- [x] 已新增 `0002_p3b_core_tables` Alembic migration，覆盖 22 张核心表、外键、唯一约束和查询索引；
- [x] 已补齐 `source_site`、`source_url` 等前端岗位卡展示字段，避免 Jobs API 后续临时拼接；
- [x] 已强制用户态 / 求职方向态核心表携带 `persona_id`，降低身份数据串台风险；
- [x] 已完成 Review 重构：JSONB 数组 / 对象列定义收敛到 `jsonb_list_column`、`jsonb_dict_column`，避免后续模型重复写默认值；
- [x] 已新增 `core/dependencies.py` 和 SQLAlchemy Session 工厂，为后续 Repository / Router 注入做准备；
- [x] 已完成本地静态验证：`python3 -m compileall backend/core backend/api backend/models backend/services backend/migrations`、Alembic 离线 SQL 生成、`git diff --check`；
- [x] 已完成远程服务器验证：执行 `make migrate`、`make health`，确认 22 张业务表可创建且健康检查通过。

P3-C 完成记录：

- [x] 已新增 Redis key 规范：`core/redis_keys.py`，统一 `cache / task / lock / idempotency` 前缀；
- [x] 已增强 Redis client：统一 `create_redis_client`、超时参数和安全关闭；
- [x] 已新增 JSON 缓存封装：`services/cache_service.py`，支持 `get / set / delete_pattern` 和 Redis 不可用降级；
- [x] 已新增任务状态封装：`services/task_state_service.py`，支持任务状态、任务事件、TTL 和状态枚举；
- [x] 已新增任务查询接口：`GET /api/tasks/{task_id}`、`GET /api/tasks/{task_id}/events`；
- [x] 已新增 `make verify-redis-cache`，覆盖 Redis 缓存读写、模式失效、任务状态读写和事件读取；
- [x] 已完成 Review 优化：任务 ID / event limit 增加入参约束，任务接口绑定 `ApiResponse<T>` schema，验证脚本改用统一 TTL 配置并输出 API 复验命令；
- [x] 已完成 Review 重构：Redis 操作执行、降级返回和 ServiceResult 收敛到公共封装，避免缓存服务与任务状态服务重复写连接关闭逻辑；
- [x] 已修复 API 路由未命中时被 SPA fallback 返回 HTML 的边界，`/api/*` 未命中统一返回 JSON 404，避免 `json.tool` 解析空值或 HTML；
- [x] 已完成远程服务器验证：执行 `make verify-redis-cache && make health`，任务状态与事件接口可返回 JSON。

P3-D 完成记录：

- [x] 已新增 Auth 接口：`POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/refresh`、`POST /api/auth/logout`、`GET /api/auth/me`、`PATCH /api/auth/me`；
- [x] 已新增 Persona 接口：`GET /api/personas`、`POST /api/personas`、`PATCH /api/personas/{id}`、`POST /api/personas/{id}/activate`；
- [x] 已新增 Repository 分层：`repositories/user_repository.py`、`repositories/persona_repository.py`，Router 不直接写 SQL；
- [x] 已新增 Auth / Persona Service：密码哈希、Token 签发、Redis Token TTL、用户资料更新、身份列表 / 新建 / 编辑 / 激活；
- [x] 已将认证 TTL、Demo 用户邮箱、Demo 密码、Demo 昵称配置集中到 `core/config.py` 和 `.env.*.example`；
- [x] 已增强 `make seed-demo`：可重复导入标准 Demo 用户和 Demo Persona，不产生重复身份；
- [x] 已新增 `make verify-auth-persona`，覆盖注册、登录、获取当前用户、更新资料、新建身份、编辑身份、激活身份、刷新和退出；
- [x] 已完成 Review 重构：Bearer Token 解析抽到 `core/auth_headers.py`，错误状态映射收敛到 `fail_from_status()`；
- [x] 已完成 Review 重构：Auth Token 的 Redis 读写、签发、撤销抽到 `services/auth_token_service.py`，避免 Auth Service 混入底层 Token 存储细节；
- [x] 已完成 Review 重构：当前用户解析抽到 `core/dependencies.py:get_current_user_result`，后续业务接口可复用同一鉴权入口；
- [x] 已完成 Review 重构：数据库提交 / 回滚错误处理抽到 `services/db_tx.py`，Auth、Persona、Demo Seed 复用统一事务结果；
- [x] 已修复注册事务边界：注册时如果 Token 签发失败会回滚用户；如果数据库提交失败会撤销已签发 Token；
- [x] 已完成远程 / 浏览器验证：执行 `make verify-auth-persona && make health`，并在浏览器 Console 验证登录、用户资料、Persona 列表 / 新建 / 激活链路。

P3-E 完成记录：

- [x] 已新增 `GET /api/mock/bootstrap`，按当前 `frontend/src/data/demoData.ts` key 输出全部 12 份前端 Mock 数据；
- [x] 已新增 `POST /api/demo/reset`，复用标准 Demo seed，恢复 Demo 用户与 Demo Persona，并清理 Demo 用户下非标准 Persona；
- [x] 已增强 `GET /api/demo/summary`，返回 dataset 列表、数量和缺失文件列表；
- [x] 已补齐 `data/demo/seed-manifest.json`，覆盖 `feedback-review`、`interview-guide`、`resume-lab`、`resume-studio` 等当前前端 Mock 文件；
- [x] 已新增 `make verify-demo-bootstrap`，覆盖 summary、bootstrap key 完整性和 reset；
- [x] 已完成 Review 重构：新增 `data/demo/mock-datasets.json` 作为 Mock dataset key / 文件名单一来源，后端服务和验证脚本复用同一映射，避免重复硬编码；
- [x] 已完成 Review 优化：Mock 文件名增加 JSON 单文件校验，summary 暴露 `missing_files`，验证脚本校验 `frontend/src/mocks`、`seed-manifest`、`mock-datasets` 三方一致；
- [x] 已完成 Review 修复：Demo seed 首次创建用户后立即 flush，避免新库中 Persona 绑定空 `user_id`；reset 返回 `personas_deleted` 便于确认标准态清理；
- [x] 已完成本地静态验证：`python3 -m compileall backend/core backend/api backend/services backend/schemas backend/repositories`、`bash -n scripts/*.sh scripts/lib/common.sh`、`git diff --check`、`npm --prefix frontend run typecheck`；
- [x] 已完成本地接口 smoke：`/api/demo/summary`、`/api/mock/bootstrap` 返回统一 JSON，bootstrap 覆盖 12 个 dataset；
- [x] 已完成远程服务器验证：执行 `make verify-demo-bootstrap && make health`，确认 Bootstrap、Reset 标准态恢复和健康检查通过。

P3-F 完成记录：

- [x] 已新增核心读接口：`GET /api/dashboard`、`GET /api/market`、`GET /api/sprint`、`GET /api/pipeline`；
- [x] 已新增岗位读接口：`GET /api/jobs` 支持 `city / direction / priority / source_site / sort / page / page_size`，`GET /api/jobs/{id}` 支持详情和 404；
- [x] 已新增机会方向岗位接口：`GET /api/market/directions/{id}/jobs`，支持方向进入岗位雷达；
- [x] 已新增职业素材读接口：`GET /api/vault`、`GET /api/vault/items/{id}`；
- [x] 已新增简历读接口：`GET /api/resume-lab`、`GET /api/resume-lab/compare`、`GET /api/resume-studio?job_id=`、`GET /api/resumes/versions`、`GET /api/resumes/{id}/profile`；
- [x] 已新增 `make verify-core-read-api`，覆盖核心读接口、分页 / 筛选 / 详情和 404 边界；
- [x] 已完成 Review 重构：核心读接口统一复用 `services/demo_dataset_service.py` 和 `services/job_query_service.py`，Router 只保留入参、响应和错误映射；
- [x] 已完成 Review 优化：Demo dataset 读取继续复用 `data/demo/mock-datasets.json`，避免新增一份 Mock 文件映射；
- [x] 已完成 Review 重构：Demo 数据错误映射抽到 `api/demo_helpers.py`，避免在各 Router 重复 `try/except`，且不污染 `core.responses`；
- [x] 已完成 Review 重构：分页抽到 `services/pagination_service.py`，Jobs、Vault、Resume Versions 统一分页结构和 `page_size <= 100` 约束；
- [x] 已完成 Review 重构：Resume Lab / Versions / Profile / Studio 查询逻辑抽到 `services/resume_query_service.py`，Router 不再内联筛选细节；
- [x] 已完成 Review 重构：详情接口读取、Demo 数据异常和 404 响应收敛到 `ok_or_demo_not_found()`，Jobs / Vault / Resume Profile 不重复写同一模式；
- [x] 已完成本地静态验证：`python3 -m compileall backend/core backend/api backend/services backend/schemas backend/repositories`、`bash -n scripts/*.sh scripts/lib/common.sh`、`git diff --check`、`npm --prefix frontend run typecheck`；
- [x] 已完成本地接口 smoke：核心读接口均返回统一 JSON，`/api/jobs/not_exists` 和 `/api/resumes/not_exists/profile` 返回 JSON 404；
- [x] 已完成远程服务器验证：执行 `make verify-core-read-api && make health`，确认核心读接口、分页、筛选、详情和健康检查通过。

P3-G 完成记录：

- [x] 已新增生成类接口：`GET /api/jobs/{id}/decision`、`GET /api/jobs/{id}/recruiter-lens`、`GET /api/decisions`；
- [x] 已新增简历定制生成接口：`POST /api/tailor/run`，返回 `task_id`、生成结果、缓存元信息和生成元信息；
- [x] 已新增面试作战卡生成 / 读取接口：`POST /api/interview/start`、`GET /api/interview/cards?job_id=`；
- [x] 已完成 Mock 生成兜底：`job_1001` 命中现有 Mock，其余岗位按当前前端 fallback 逻辑生成稳定结构；
- [x] 已完成 Redis JSON 缓存：缓存 key 按 `scope / user_id / persona_id / target_id / version / payload_hash` 隔离，重复请求可命中缓存；
- [x] 已完成任务状态写入：生成请求会写入 `/api/tasks/{task_id}` 和 `/api/tasks/{task_id}/events`，支持轮询查看状态与事件；
- [x] 已完成最近成功缓存兜底：生成失败或超时时优先回退 `latest` 缓存；Redis 不可用时返回 `fallback_mock`，页面可继续使用结果；
- [x] 已新增配置项：`generated_cache_ttl_seconds`、`generated_timeout_seconds`、`demo_user_public_id`，避免 TTL、超时和 Demo 用户 ID 散落硬编码；
- [x] 已新增 `make verify-generated-api`，覆盖生成接口、fallback、分页、重复请求缓存命中、任务状态 / 事件和 404；
- [x] 已完成 Review 重构：生成流程统一收敛到 `services/generated_content_service.py`，Router 只处理入参、响应和错误映射；
- [x] 已完成 Review 重构：决策卡列表分页复用 `services/pagination_service.py`，Demo 数据读取复用 `services/demo_dataset_service.py`；
- [x] 已完成本地静态验证：`python3 -m compileall backend/core backend/api backend/services backend/schemas backend/repositories`、`bash -n scripts/*.sh scripts/lib/common.sh`、`git diff --check`、`npm --prefix frontend run typecheck`；
- [x] 已完成本地接口 smoke：Redis 未启动时生成接口返回统一 JSON，并以 `fallback_mock` 标记降级，不影响页面继续使用结果；
- [x] 已完成远程服务器验证：执行 `make verify-generated-api && make health`，确认 Redis 缓存命中和任务状态查询通过；
- [x] 已完成 Review 重构：生成类服务新增 `generate_for_job()`，收敛 Decision、Recruiter Lens、Tailor、Interview 中重复的岗位查询和 `get_or_generate()` 调用。

P3-H 完成记录：

- [x] 已新增管线写接口：`POST /api/pipeline/cards`、`PATCH /api/pipeline/cards/{job_id}`，支持重复加入兜底、状态推进和备注更新；
- [x] 已新增职业素材写接口：`POST /api/vault/items`、`PATCH /api/vault/items/{id}`、`DELETE /api/vault/items/{id}`，支持新增、编辑、删除和删除后 404；
- [x] 已新增反馈复盘接口：`GET /api/feedback`、`POST /api/feedback`、`PATCH /api/feedback/{id}`，支持反馈录入、更新和写后读；
- [x] 已新增简历版本保存接口：`POST /api/resumes/versions`，保存后 `GET /api/resume-lab`、`GET /api/resumes/versions` 可读取；
- [x] 已新增 Demo 写入状态层：`services/demo_write_state_service.py`，写入态进入 Redis，支持刷新后保留，读接口在 Redis 不可用时降级读取标准 Mock；
- [x] 已完成 Demo seed / reset 污染清理：`seed_demo_identity()` 会清理 Demo 写入态，避免验证或演示被上次写入污染；
- [x] 已新增 `make verify-write-api`，覆盖管线重复加入、非法状态流转、素材写入生命周期、反馈更新、简历版本保存和写后读；
- [x] 已完成 Review 修复：避免对 frozen `ServiceResult` 直接赋值，读接口统一返回新的 `ServiceResult`；
- [x] 已完成 Review 重构：写接口错误映射收敛到 `api/write_helpers.py`，Router 只处理入参和响应映射；
- [x] 已完成 Review 重构：文本列表归一化抽到 `services/text_normalization_service.py`，Persona、Vault、Feedback 不再重复实现去重 / 截断逻辑；
- [x] 已完成本地静态验证：`python3 -m compileall backend/core backend/api backend/services backend/schemas backend/repositories`、`bash -n scripts/*.sh scripts/lib/common.sh`、`git diff --check`、`npm --prefix frontend run typecheck`；
- [x] 已完成本地接口 smoke：Redis 未启动时读接口不崩，写接口返回明确 `SERVICE_ERROR`，不误报保存成功；
- [x] 已完成远程服务器验证：执行 `make verify-write-api && make health`，确认 Redis 写入态、刷新保留和重复操作兜底通过。

P3-I 完成记录：

- [x] 已保留系统健康与版本别名：`GET /api/health`、`GET /api/system/health`、`GET /api/version`、`GET /api/system/version`；
- [x] 已新增更新检查接口：`GET /api/system/update/check`，返回当前版本、检测版本、更新通道和检测时间；
- [x] 已新增演示更新任务接口：`POST /api/system/update/apply`，当前阶段不执行破坏性升级，仅创建可轮询的模拟更新任务；
- [x] 已新增更新任务状态接口：`GET /api/system/update/status/{task_id}`，并复用现有 `/api/tasks/{task_id}`、`/api/tasks/{task_id}/events` 查询链路；
- [x] 已完成 Redis 任务状态写入：更新任务写入 `succeeded` 状态和 `system.update.completed` 事件，Redis 不可用时返回明确 `SERVICE_ERROR`；
- [x] 已新增 `make verify-system-api`，覆盖 Health / Version 别名、Update Check、Update Apply、Update Status、Task State / Events 和 404；
- [x] 已完成 Review 重构：任务状态和事件响应映射抽到 `api/task_helpers.py`，`tasks` 与 `system update` 不重复写 404 / 503 逻辑；
- [x] 已完成本地静态验证：`python3 -m compileall backend/core backend/api backend/services backend/schemas backend/repositories`、`bash -n scripts/*.sh scripts/lib/common.sh`、`git diff --check`、`npm --prefix frontend run typecheck`；
- [x] 已完成远程服务器验证：执行 `make verify-system-api && make health`，确认 Redis 任务状态和系统接口链路通过。

P3-J 进行中记录：

- [x] 已补齐前端统一 `apiClient`：支持 `GET / POST / PATCH / DELETE`、`Authorization`、`X-Request-ID`、统一 `ApiClientError` 和非 JSON 错误兜底；
- [x] 已新增前端运行时数据源：`stores/runtimeDataStore.ts` 统一承载 Mock / API bootstrap 数据，避免页面直接散落请求；
- [x] 已新增 `syncRuntimeData()`：`mock` 使用本地 JSON，`api / hybrid` 优先拉取后端 `/api/mock/bootstrap`，并合并 `/api/pipeline`、`/api/vault`、`/api/feedback`、`/api/resume-lab` 当前读接口状态；
- [x] 已新增运行时同步 Hook：应用启动和数据模式切换时自动同步 runtime data，hybrid API 失败时回退本地 Mock，页面不白屏；
- [x] 已新增设置页“运行时数据源”面板，展示当前数据源、同步状态和 fallback 错误；
- [x] 已新增 `make verify-frontend-api-adapter`，覆盖前端 apiClient、runtime data mock/api 同步和 `apiPost` 更新任务调用；
- [x] 已修复 API 模式黑屏兜底：`api / hybrid` 同步失败统一回退 Mock、记录错误并结束 loading，不再抛未捕获异步异常；
- [x] 已补齐运行时同步防竞态：快速切换 `mock / api / hybrid` 时，过期请求不会覆盖最新数据源状态；
- [x] 已补充 `make verify-frontend-api-adapter` 的 API 失败回退断言，覆盖网络失败时 `mode=mock`、`loading=false`、错误可见；
- [x] 已加强黑屏不可点击兜底：`Drawer` 关闭时不再挂载全屏层，避免隐藏遮罩残留拦截点击；
- [x] 已修复原生 Select 切换后焦点层残留：统一 `Select` 在 `onChange` 后自动 `blur()`，避免浏览器下拉层导致页面变暗不可点击；
- [x] 已新增运行时恢复入口：API / hybrid 或同步异常时显示“恢复 Mock / 定位遮罩”，保证远程联调可自救；
- [x] 已新增 `/debug/overlay` 诊断页，用于远程查看视口中心元素栈和大面积 fixed 元素，快速定位遮罩来源；
- [x] 已完成本地静态验证：`npm --prefix frontend run typecheck`、`npm --prefix frontend run build`、`bash -n scripts/*.sh scripts/lib/common.sh`、`git diff --check`；
- [ ] 待远程服务器验证：本地 Docker 未运行，`make verify-frontend-api-adapter` 已在 `infra-up` 前置检查处停止；远程执行 `make verify-frontend-api-adapter && make health`。

---

## 八、模块依赖关系

建议按以下依赖顺序推进：

```text
工程基建
  ↓
全局布局 / 基础组件
  ↓
登录态 / Persona / Mock 数据
  ↓
首页驾驶舱
  ↓
机会热度广场
  ↓
岗位雷达
  ↓
岗位决策卡
  ↓
求职管线
  ↓
职业素材库基础能力
  ↓
更新提示 / 一键运维
  ↓
P1 增强模块
  ↓
P3 后台基础架构 / PostgreSQL / Redis
  ↓
P3 后台业务接口
  ↓
前端 API / hybrid 联调
```

强依赖说明：

- 首页依赖：全局布局、Mock 数据、身份切换器；
- 热度广场依赖：Persona、机会热度 Mock；
- 岗位雷达依赖：岗位列表 Mock、SourceBadge；
- 决策卡依赖：岗位雷达、决策卡 Mock；
- 管线依赖：岗位卡加入动作、状态枚举；
- 更新提示依赖：版本信息接口或 `version.json`。
- P3 后台基建依赖：现有 `backend/` 骨架、一键脚本、当前前端 API client；
- P3 数据层依赖：PostgreSQL、Alembic、Demo seed、`user_id` / `persona_id` 贯穿原则；
- P3 缓存层依赖：Redis key 规范、TTL、生成结果缓存和任务状态抽象；
- P3 联调依赖：前端 service / store 统一适配，禁止页面散落请求逻辑。

---

## 九、每周 / 每日进度把控模板

### 9.1 每日站会记录模板

| 日期 | 今日目标 | 完成情况 | 阻塞项 | 明日计划 |
|---|---|---|---|---|
| YYYY-MM-DD |  |  |  |  |

### 9.2 模块进度总表

| 模块 | 负责人 | 优先级 | 状态 | 预计完成时间 | 实际完成时间 | 备注 |
|---|---|---|---|---|---|---|
| 工程基建 |  | P0 | 已完成 |  | 2026-06-03 | 已完成工程骨架、Mock、脚本、版本机制 |
| 首页驾驶舱 |  | P0 | 已完成 |  | 2026-06-03 | 已完成首页 Hero、指标、Sprint、推荐、管线概览 |
| 机会热度广场 |  | P0 | 已完成 |  | 2026-06-03 | 已完成热度广场、冷热启动和岗位筛选跳转 |
| 岗位雷达 |  | P0 | 已完成 |  | 2026-06-03 | 已完成筛选、排序、分页预留、来源边界 |
| 岗位决策卡 |  | P0 | 已完成 |  | 2026-06-03 | 已完成详情页、命中理由、风险、建议行动 |
| 招聘官视角 |  | P0 | 已完成 |  | 2026-06-03 | 已完成第一眼印象、亮点、疑点、追问 |
| 求职管线 |  | P0 | 已完成 |  | 2026-06-03 | 已完成 pipelineStore、Kanban、状态推进、桌面拖拽和移动端按钮兜底 |
| 职业素材库 |  | P0 | 已完成 |  | 2026-06-03 | 已完成素材列表、详情、编辑、证据联动 |
| 更新提示 |  | P0 | 已完成 |  | 2026-06-03 | 已完成版本轮询、更新提示、等待页、恢复原页面 |
| 一键运维 |  | P0 | 已完成 |  | 2026-06-03 | 已完成 init/dev/start/migrate/upgrade/health/reset-demo，迁移前备份 |
| 全平台适配与演示稳定性 |  | P0 | 已完成 |  | 2026-06-03 | 已完成移动端、大屏、错误兜底、Demo 重置和种子恢复 |
| 简历工作室 |  | P1 | 已完成 |  | 2026-06-03 | 已完成岗位定制简历、修改前后对比、证据引用、接受/撤回和版本草稿；Review 后已收敛路径和版本命名职责 |
| 简历版本实验 |  | P1 | 已完成 |  | 2026-06-04 | 已完成 Resume A/B Lab 基础页、最佳版本推荐、版本列表、核心指标卡、版本详情、版本对比和证据联动 |
| 面试作战卡 |  | P1 | 已完成 |  | 2026-06-04 | 已完成公司简报、面试重点、高频问题、回答框架、关联证据、7 天计划、复习状态、复制回答要点和补素材跳转 |
| 反馈复盘 |  | P1 | 已完成 |  | 2026-06-04 | 已完成反馈统计、结果分布、复盘趋势、版本表现、反馈录入、管线联动和下一轮策略建议 |
| 后端基础架构与一键启动 |  | P3 | 已完成 |  | 2026-06-04 | 已完成 Docker Compose、PG/Redis 启动脚本、`make dev`、`make deploy-local`、后台部署脚本、health 增强和远程实跑 |
| PostgreSQL 数据层 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 22 张业务表、索引、约束、ORM 模型和远程迁移验证 |
| Redis 缓存与任务状态 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 Redis key 规范、JSON 缓存、任务状态封装、`make verify-redis-cache` 和远程验证 |
| 后台认证与用户身份 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 Auth、User、Persona 后端最小闭环、`make verify-auth-persona` 和浏览器手动验证 |
| Demo Bootstrap / Reset |  | P3 | 已完成 |  | 2026-06-05 | 已完成 `/api/mock/bootstrap`、`/api/demo/reset`、`make verify-demo-bootstrap` 和远程验证 |
| 后台业务接口 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 Dashboard、Market、Jobs、Vault、Pipeline、Sprint、Resume Lab / Studio 核心读接口和远程验证 |
| 生成类后台接口 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 Decision、Recruiter Lens、Tailor、Interview 的 Mock 生成、Redis 缓存、任务状态和远程验证 |
| 写入类后台接口 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 Pipeline、Feedback、Vault、Resume Version 写接口和远程验证；Review 后已抽取文本归一化 |
| 系统健康与更新任务接口 |  | P3 | 已完成 |  | 2026-06-05 | 已完成 Health、Version、Update Check / Apply / Status、Task Events、`make verify-system-api` 和远程验证 |
| 前后端 API 联调 |  | P3 | 进行中 |  |  | 已完成前端 apiClient 与 runtime data 基础适配；待远程执行 `make verify-frontend-api-adapter` |

---

## 十、阶段验收门槛

### 10.1 可开发门槛

- [x] `make init` 可执行；
- [x] `make dev` 可启动本地环境；
- [x] Mock 数据可跑；
- [x] 左侧导航和顶部栏可见；
- [x] 登录 / 演示账号可进入系统。

### 10.2 可联调门槛

- [x] `mock / api / hybrid` 模式可切换；
- [x] 核心页面都有假数据兜底；
- [x] 决策卡和招聘官视角数据结构稳定；
- [x] `persona_id` 已贯穿请求与状态。

### 10.3 可演示门槛

- [x] 首页驾驶舱可完整展示；
- [x] 热度广场 → 岗位雷达 → 决策卡 → 管线链路可走通；
- [x] Demo 账号与 Demo 数据稳定；
- [x] 移动端不崩，大屏可展示；
- [x] 页面可显示更新提示；
- [x] 升级失败有兜底，不会直接白屏。

### 10.4 比赛前门槛

- [x] `make start` 可一键启动；
- [x] `make upgrade` 可一键升级；
- [x] `make migrate` 可一键迁移；
- [x] `make health` 可验证环境健康；
- [x] `make reset-demo` 可恢复标准演示态；
- [ ] 录屏备份已准备；
- [ ] 最近一个稳定 tag 已打好。

### 10.5 P3 后端可联调门槛

- [ ] `make dev` 可一键启动 Vite、FastAPI、PostgreSQL、Redis；
- [ ] `make deploy-local` 可构建前端并由 FastAPI 托管完整演示环境；
- [ ] `make migrate` 使用 Alembic 管理 PostgreSQL 结构；
- [ ] `make seed-demo` 可恢复标准 Demo 数据；
- [ ] `make health` 可检查前端、后端、PostgreSQL、Redis；
- [ ] 所有 API 返回统一 `success / code / message / data / request_id`；
- [ ] Auth、Persona、Dashboard、Market、Jobs、Vault、Pipeline、Feedback、System 接口 smoke test 通过；
- [x] 生成类接口有 Redis 缓存和任务状态兜底；
- [ ] 前端切到 `api` 模式时核心页面不缺接口；
- [ ] 前端切到 `hybrid` 模式时接口失败可回退 Mock 或显示明确兜底。

### 10.6 边界 Case 验证门槛

- [ ] 认证与用户边界已验证；
- [ ] Persona 与冷启动边界已验证；
- [ ] 机会热度广场边界已验证；
- [ ] 岗位雷达与来源标识边界已验证；
- [ ] 决策卡与招聘官视角边界已验证；
- [ ] 职业素材库与简历边界已验证；
- [ ] 求职管线边界已验证；
- [ ] 更新提示与恢复逻辑边界已验证；
- [ ] 一键启动 / 一键升级 / 一键迁移边界已验证；
- [ ] 移动端 / 大屏 / 低性能设备边界已验证。

### 10.7 高风险边界 Case 验证清单

> 以下清单优先级最高，比赛前必须逐项验证。

| 模块 | Case | 风险级别 | 验证方式 | 通过标准 | 状态 |
|---|---|---|---|---|---|
| 认证 | 未登录直接访问主工作区 | 高 | 手动访问受保护路由 | 自动跳转登录，并保留目标路由 | 未开始 |
| 认证 | Token 过期 | 高 | 本地模拟过期 Token | 能尝试刷新，失败后回登录，不白屏 | 已完成 |
| Persona | 切换身份时连续点击 | 高 | 快速重复点击切换器 | 只保留一个请求，UI 不错乱 | 未开始 |
| Persona | 当前身份无数据 | 高 | 切到空身份 | 展示空状态与引导入口 | 未开始 |
| 热度广场 | 无用户画像 | 高 | 清空画像数据 | 默认展示全局热度 | 未开始 |
| 岗位雷达 | 来源未知 / 无原始链接 | 高 | 构造异常岗位数据 | Badge 正常兜底，无异常跳转 | 未开始 |
| 岗位雷达 | 重复加入管线 | 高 | 连续点两次加入管线 | 只生成一张卡，提示已存在 | 未开始 |
| 决策卡 | 决策数据为空 | 高 | Mock 空响应 | 显示兜底内容，不崩溃 | 未开始 |
| 决策卡 | 证据 ID 失效 | 高 | Mock 错误 evidence_id | 显示“证据已失效”，可跳素材库 | 未开始 |
| 管线 | 非法状态流转 | 高 | 尝试跳过中间状态 | 阻止操作并提示 | 未开始 |
| 管线 | 移动端无法拖拽 | 高 | 手机尺寸验证 | 有按钮式替代操作 | 未开始 |
| 更新 | 发现新版本后点击立即更新 | 高 | 模拟版本变更 | 出现等待页并最终恢复页面 | 已完成 |
| 更新 | 更新失败 | 高 | 模拟升级脚本失败 | 保留当前版本，可重试 | 未开始 |
| 更新 | 恢复点损坏 | 高 | 手动篡改 `localStorage` | 忽略损坏恢复点并回首页 | 已完成 |
| 运维 | `make start` 重复执行 | 高 | 连续执行两次 | 不因重复执行破坏环境 | 未开始 |
| 运维 | `make migrate` 失败 | 高 | 构造失败迁移 | 日志明确，返回非 0，可回滚 | 未开始 |
| 运维 | `make upgrade` 后健康检查失败 | 高 | 模拟后端启动失败 | 升级流程中止并给出回滚路径 | 未开始 |
| Demo | Demo 数据污染后重置 | 高 | 手动修改核心 Demo 数据 | 能恢复标准演示态 | 未开始 |
| P3 后端 | PostgreSQL 未启动 | 高 | 停止数据库后访问接口 | 健康检查失败明确，页面不白屏 | 未开始 |
| P3 后端 | Redis 未启动 | 高 | 停止 Redis 后访问生成类接口 | 降级为无缓存执行或返回明确错误 | 未开始 |
| P3 后端 | Redis 缓存串身份 | 高 | 切换 Persona 后访问生成类接口 | 不返回上一个身份的缓存结果 | 未开始 |
| P3 后端 | 生成类接口超时 | 高 | 模拟生成超时 | 返回任务状态或最近成功缓存，不阻塞页面 | 未开始 |
| P3 后端 | SSE 不可用 | 中 | 禁用事件流后查询任务 | 可降级轮询 `/api/system/update/status/{id}` 或任务状态接口 | 未开始 |
| P3 后端 | Migration 重复执行 | 高 | 连续执行 `make migrate` | 不重复建表，不破坏数据 | 未开始 |
| P3 后端 | Demo seed 重复执行 | 高 | 连续执行 `make seed-demo` | 标准 Demo 数据稳定，不产生无限重复数据 | 未开始 |
| P3 后端 | API 模式接口缺失 | 高 | 前端切 `api` 模式巡检 | 核心页面均有数据或明确兜底 | 未开始 |
| P3 后端 | 写接口重复点击 | 高 | 连续提交新增素材 / 加入管线 / 反馈录入 | 不产生重复脏数据，返回明确状态 | 未开始 |
| P3 后端 | 列表分页越界 | 中 | 请求超大 `page_size` 或不存在页码 | 自动限制 page size，空页返回空列表 | 未开始 |
| P3 后端 | 简历上传异常 | 高 | 上传超大文件 / 非简历文件 | 拒绝并返回明确错误，不写入坏数据 | 未开始 |
| P3 后端 | 跨用户访问资源 | 高 | 用 A 用户访问 B 用户资源 ID | 返回无权限或不存在，不泄露数据 | 未开始 |
| P3 后端 | Persona 数据串台 | 高 | 切换身份后读取岗位决策 / 管线 / 简历 | 只返回当前身份数据 | 未开始 |
| P3 部署 | `make deploy-local` 重复执行 | 高 | 连续执行两次 | 服务可用，端口和进程不冲突 | 未开始 |
| P3 部署 | 前端独立服务跨域 | 中 | Vite 访问 FastAPI | CORS 正常，Auth Header 和请求头可通过 | 未开始 |
| P3 部署 | Docker 未启动或端口占用 | 高 | 停止 Docker 或占用 8000 / 5173 / PG / Redis 端口 | 脚本给出明确提示并退出 | 未开始 |
| 适配 | 大屏模式 | 中 | `?mode=demo` 验证 | 字号、布局、主链路可讲 | 未开始 |
| 适配 | 低性能设备 | 中 | 降级动效验证 | 页面可用，不明显卡顿 | 未开始 |

### 10.8 建议验证顺序

建议按以下顺序执行边界验证：

```text
认证
→ Persona
→ 热度广场
→ 岗位雷达
→ 决策卡
→ 管线
→ 更新机制
→ 一键运维
→ Demo 重置
→ P3 后台接口
→ P3 极速部署
→ 全平台适配
```

说明：

- 前 8 项通过后，才适合进入比赛排练；
- 若更新机制和一键运维未通过，不建议上远端演示环境；
- 若 Demo 重置未通过，不建议在比赛现场频繁切换流程。

---

## 十一、当前建议执行顺序

建议实际按以下顺序开工：

1. 工程基建与一键命令；
2. 全局布局与首页 Base 组件；
3. 登录 / 演示账号 / 身份切换；
4. 首页驾驶舱；
5. 机会热度广场；
6. 岗位雷达；
7. 岗位决策卡；
8. 求职管线；
9. 职业素材库基础能力；
10. 更新提示；
11. 响应式适配与大屏模式；
12. P1 增强模块；
13. P3 后端基础架构与一键启动；
14. P3 PostgreSQL / Redis 数据底座；
15. P3 后台业务接口；
16. P3 前端 API / hybrid 联调。

---

## 十二、备注

1. 当前清单默认前端为主线，算法真实能力暂不阻塞开发；
2. 后续如果算法同学开始交付真实数据，应在本清单中追加“联调清单”；
3. 本文档建议作为后续每次同步进度时的唯一执行清单；
4. 后续可以直接在本文档中维护状态，不需要另起新的待办文件；
5. P3 后台接口优先完成最小闭环，暂不引入复杂队列、生产级监控和真实岗位爬虫。
