# JobHunter 黑马大赛架构设计文档

> **项目方向**：找工作 / AI 求职助手  
> **文档版本**：v2.9  
> **更新日期**：2026-06-03  
> **比赛配置**：3 名算法 + 1 名前端  
> **演示形态**：Web 页面演示  
> **重要决策**：不使用 Hermes，不做 Telegram Bot，不做复杂多端接入，聚焦 Web 可视化闭环。

---

## 一、项目定位

### 1.1 一句话介绍

**JobHunter 是一个可解释、可追踪、可学习的 AI 求职作战中枢：帮助用户判断哪些岗位值得投、如何定制简历、如何准备面试，并根据投递反馈持续优化求职策略。**

### 1.2 核心价值

传统求职流程是：

```text
看岗位 → 猜自己合不合适 → 手动改简历 → 海投 → 临时准备面试
```

JobHunter 希望改成：

```text
注册登录 → 首次引导 → 选择求职身份 → 机会热度广场 → 职业素材库 → 岗位雷达 → 岗位决策卡 → 招聘官视角 → 求职管线 → 简历版本实验 → 投递反馈
```

核心不是“替用户乱投简历”，而是把求职从**海投**变成**可决策、可追踪、可复盘的精投**。

### 1.3 本次比赛目标

本次比赛只追求一个稳定、好看、有创新点的 Web Demo：

- 能在大屏上清楚展示完整闭环；
- 能体现 3 个算法同学的技术贡献；
- 能体现前端视觉和交互设计能力；
- 当前阶段先稳定前端功能和交互，算法结果先用 Mock / 静态 JSON 数据承接；
- 前端稳定后，再向算法同学索要真实接口数据；
- 不追求真实招聘平台全量接入；
- 不追求多用户生产级系统；
- 不使用 Hermes 这类 Agent 框架，避免演示链路过重。

---

## 二、产品创新点

### 2.1 求职数字分身

系统不是简单保存一份简历文本，而是把简历拆成一个“求职数字分身”：

- 技能栈；
- 项目经验；
- 行业背景；
- 年限与职级；
- 可证明的成果；
- 适合岗位类型；
- 当前短板。

前端可以用“能力雷达图 / 技能标签云 / 项目证据链”展示，让观众一眼看到系统真的理解了用户。

### 2.2 岗位决策卡，而不是单一匹配分

普通推荐系统只告诉用户“这个岗位匹配 92 分”。  
JobHunter 要告诉用户：

- 这个岗位值不值得投；
- 应该今天优先投，还是先观望；
- 匹配度、岗位质量、成长潜力、竞争风险分别如何；
- 如果要投，简历应该重点改哪里；
- 投递之后下一步该做什么。

这会比单纯的岗位列表更有决策价值。

### 2.3 机会热度广场：先发现方向，再进入岗位

很多用户第一次进入时并不知道自己要投什么岗位。  
因此需要一个“机会热度广场”作为探索入口：

- 第一次进入或用户画像不足时，展示全局热门方向；
- 用户有职业素材、偏好、浏览行为后，展示当前用户倾向高的机会热度；
- 让用户先看到行业、岗位、城市、技能的机会趋势，再进入具体岗位雷达。

广场不是信息流，而是“求职机会导航”。

### 2.4 求职管线：从分析工具变成工作台

很多 AI 产品停留在“分析”。本项目要进一步管理求职过程：

- 感兴趣；
- 已定制简历；
- 已投递；
- HR 沟通；
- 面试中；
- Offer；
- 拒绝 / 放弃。

这样 Demo 不是一个查询工具，而是一个真正的求职工作台。

### 2.5 职业素材库：避免 AI 编造

用户不只是上传一份简历，还可以维护一个“职业素材库”：

- 项目经历；
- 技术能力；
- 量化成果；
- STAR 故事；
- 证书与作品；
- 简历版本。

所有简历优化、面试回答建议，都尽量引用职业素材库中的真实证据。

### 2.6 投递反馈闭环

用户投递后，可以记录结果：

- 已投递；
- 收到面试；
- 被拒；
- 无回复；
- 放弃。

系统后续可以根据这些反馈优化推荐策略。当前阶段前端先完成反馈记录和状态展示，算法学习逻辑后续接入。

### 2.7 多求职身份：支持不同方向并行探索

同一个用户可能同时考虑多个方向：

- 后端开发；
- AI 应用工程师；
- 技术产品经理；
- 数据工程师。

JobHunter 支持 `Career Persona`，每个求职身份可以有独立的：

- 目标岗位；
- 职业素材选取；
- 机会热度倾向；
- 岗位决策结果；
- 简历版本；
- 求职管线。

这让产品更适合转岗、校招和方向不确定的用户。

### 2.8 招聘官视角：从“我觉得匹配”到“HR 会怎么看”

岗位决策卡告诉用户“值不值得投”，招聘官视角进一步告诉用户：

- 招聘官第一眼会看到什么；
- 简历亮点是什么；
- 简历疑点是什么；
- 可能被筛掉的原因；
- 面试最可能被追问的问题；
- 如何提升通过率。

这比普通 ATS 分数更有代入感，也更适合比赛演示。

### 2.9 简历版本实验：用数据反向优化简历

不同简历版本对不同岗位的效果不一样。  
`Resume A/B Lab` 用来记录：

- 某个简历版本投了多少岗位；
- 收到多少面试；
- 无回复多少；
- 哪类岗位更有效；
- 是否建议继续使用。

这让产品从“生成简历”升级为“数据驱动简历优化”。

### 2.10 求职冲刺计划：告诉用户今天该做什么

`Job Search Sprint` 把管线、反馈和岗位机会转成今日任务：

- 今天优先投递哪些岗位；
- 哪些岗位需要跟进；
- 哪些素材需要补充；
- 哪个面试主题需要复习；
- 本周求职节奏是否健康。

这个模块可以放在首页，不一定单独成页。

### 2.11 高颜值 Web 演示

比赛演示重点是“看得懂、记得住、愿意投票”。  
前端设计采用“求职雷达 / 作战驾驶舱”的视觉方向：

- 暗色科技底 + 亮色高光；
- 岗位卡片瀑布流；
- 匹配度环形进度；
- 能力雷达图；
- 技能缺口热力图；
- 简历修改前后对比；
- 面试作战卡。

---

## 三、系统边界

### 3.1 本次做什么

| 模块 | 本次是否实现 | 说明 |
|---|---:|---|
| Web 首页与演示动线 | 是 | 前端核心展示面 |
| 用户注册与登录 | 是 | 支持用户概念、会话鉴权、个人数据隔离 |
| 首次引导 Onboarding | 是 | 首次进入时引导用户选择身份、偏好和 Demo 数据 |
| 机会热度广场 | 是 | 首次展示全局热度，有画像后展示用户倾向高的机会热度 |
| 多求职身份 | 是 | 用户可切换不同求职方向，每个方向有独立上下文 |
| 职业素材库 | 是 | 前端先实现素材维护、证据展示，数据先用 Mock |
| 简历上传与画像展示 | 是 | 前端展示画像结果，解析算法后续接入 |
| 岗位雷达 | 是 | 岗位卡片、筛选、排序、匹配分布 |
| HC 来源标识 | 是 | 每个 HC / 岗位展示源网站标识、来源类型和原始链接 |
| 岗位决策卡 | 是 | 展示是否值得投、投递优先级、风险与建议 |
| 招聘官视角 | 是 | 模拟 HR/招聘官如何看用户简历和岗位匹配 |
| 求职管线 Kanban | 是 | 管理感兴趣、已投递、面试中、Offer 等状态 |
| 简历工作室 | 是 | 展示定制简历、证据引用、修改前后对比 |
| 简历版本实验 | 是 | 对比不同简历版本投递效果，形成 A/B Lab |
| 面试作战卡 | 是 | 展示面试题、回答框架、7 天计划 |
| 求职冲刺计划 | 是 | 首页展示今日任务和本周求职 Sprint |
| 投递反馈闭环 | 是 | 用户记录投递结果，后续供算法学习 |
| 岗位数据集 | 是 | 使用静态 Demo 数据集，保证稳定 |
| 在线更新提示 | 是 | 前端感知版本变化，提示用户点击更新并重启续连 |
| API 统一响应格式 | 是 | 前后端统一成功、失败、分页、请求 ID |
| 前端状态管理 | 是 | 明确 Store 划分、当前身份、筛选条件和恢复点 |
| 状态枚举规范 | 是 | 统一管线、任务、反馈、来源等枚举 |
| 算法真实实现 | 暂缓 | 当前阶段只定义数据结构与 Mock 数据，稳定后向算法同学索要数据 |
| 实时招聘平台爬虫 | 可选 | 不作为演示主链路 |
| 自动投递 | 否 | 风险高、展示价值不如决策与管线管理 |
| Hermes / Telegram | 否 | 已明确不使用 |

### 3.2 演示稳定性原则

比赛现场不能依赖不稳定外部因素，因此采用多层兜底：

1. **静态岗位数据集**：内置 300-800 条结构化岗位；
2. **预置简历样例**：上传失败时可一键加载 Demo 简历；
3. **前端 Mock 数据**：算法未就绪时，页面仍可完整演示；
4. **算法结果缓存**：LLM 或模型调用失败时，展示最近一次成功结果。

---

## 四、总体架构

### 4.1 架构总览

```text
┌──────────────────────────────────────────────────────────────┐
│                         Web 前端                              │
│ 注册登录 / 热度广场 / 职业素材库 / 岗位雷达 / 决策卡 / 管线     │
└───────────────────────────────┬──────────────────────────────┘
                                │ HTTP / SSE
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                      API 与编排服务                           │
│  鉴权会话 / Mock 数据 / Demo 状态 / 任务进度 / 版本更新         │
└───────────────┬───────────────────────┬──────────────────────┘
                │                       │
                ▼                       ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│      算法数据契约层          │   │          数据服务             │
│  A1 画像结果 Schema          │   │  SQLite / 静态数据集 / Mock JSON │
│  A2 决策卡结果 Schema        │   │  用户 / 素材 / 岗位 / 管线 / 缓存 │
│  A3 行动建议结果 Schema      │   └─────────────────────────────┘
└─────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                     可选外部能力                              │
│  算法同学真实接口 / OpenAI 兼容模型 / 简历文件解析组件          │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 推荐技术栈

| 层级 | 推荐选型 | 理由 |
|---|---|---|
| 前端 | React + Vite + TypeScript + Tailwind CSS | 快速、好看、适合比赛 Demo |
| 可视化 | ECharts / Recharts | 雷达图、漏斗图、环形图实现简单 |
| API 服务 | Python FastAPI | 算法同学容易接入，接口定义清晰 |
| 算法编排 | 暂不实现真实算法，只定义数据契约 | 当前阶段先稳定前端交互 |
| 数据库 | SQLite | Demo 足够，零运维 |
| Mock 数据 | JSON / SQLite Seed | 支撑前端完整演示 |
| 文件解析 | 暂用样例简历和 Mock 画像 | 真实解析后续接入 |
| 模型接入 | 暂缓 | 等前端稳定后再接算法同学接口 |
| 部署 | Docker Compose | 一台机器即可演示 |
| 鉴权 | JWT Access Token + Refresh Token | 实现简单，适合 Web 登录态 |
| 密码安全 | bcrypt / argon2 | 不明文存储密码 |

---

## 五、算法数据契约与 Mock 策略

> 当前阶段不实现真实算法，只负责前端功能、页面交互和数据展示稳定。  
> 算法同学后续只要按本节 Schema 返回数据，即可替换 Mock 数据。

### 5.1 前端先行原则

当前阶段的开发顺序：

```text
先做页面和交互
  ↓
使用 Mock JSON 跑通完整 Demo
  ↓
沉淀清晰的数据 Schema
  ↓
向算法同学索要对应接口数据
  ↓
替换 Mock 数据，不改页面结构
```

### 5.2 Mock 数据组织

推荐前端先维护以下 Mock 数据文件：

```text
frontend/src/mocks/
├── user.json
├── career-personas.json
├── opportunity-market.json
├── career-vault.json
├── resume-profile.json
├── jobs.json
├── job-decision-cards.json
├── recruiter-lens.json
├── pipeline.json
├── resume-ab-lab.json
├── sprint-plan.json
├── tailor-output.json
├── interview-card.json
└── feedback-summary.json
```

后端如果先行搭建，也可以把这些数据放在：

```text
backend/mock_data/
```

### 5.3 多求职身份数据 Schema

用于驱动求职身份切换。每个身份都可以影响机会热度、岗位雷达、简历版本和管线。

```json
{
  "active_persona_id": "persona_ai_app",
  "personas": [
    {
      "id": "persona_backend",
      "name": "后端开发",
      "target_roles": ["Java 后端", "Go 后端"],
      "core_skills": ["Java", "Redis", "微服务"],
      "preferred_cities": ["北京", "上海", "杭州"],
      "status": "active"
    },
    {
      "id": "persona_ai_app",
      "name": "AI 应用工程师",
      "target_roles": ["AI 应用工程师", "LLM 工程师"],
      "core_skills": ["Python", "LLM", "RAG", "后端服务"],
      "preferred_cities": ["北京", "上海", "远程"],
      "status": "active"
    }
  ]
}
```

### 5.4 机会热度广场数据 Schema

用于驱动“机会热度广场”。首次进入时展示 `global`，有用户画像后展示 `personalized`。

```json
{
  "mode": "personalized",
  "global": {
    "hot_roles": [
      {"name": "AI 应用工程师", "heat": 92, "growth": 18, "tags": ["LLM", "RAG", "Python"]},
      {"name": "后端开发工程师", "heat": 88, "growth": 8, "tags": ["Java", "Go", "微服务"]}
    ],
    "hot_cities": [
      {"name": "北京", "heat": 90},
      {"name": "上海", "heat": 86},
      {"name": "杭州", "heat": 82}
    ],
    "hot_skills": [
      {"name": "Agent", "heat": 95, "growth": 25},
      {"name": "RAG", "heat": 91, "growth": 22},
      {"name": "React", "heat": 80, "growth": 6}
    ]
  },
  "personalized": {
    "recommended_directions": [
      {
        "name": "AI 应用工程师",
        "heat": 92,
        "fit": "高",
        "reason": "你的 Python / 后端 / LLM 项目经验与该方向重合",
        "filters": {"role": "AI 应用工程师", "skills": ["Python", "LLM"]}
      }
    ],
    "next_actions": [
      "查看 AI 应用工程师岗位",
      "补充 RAG 项目素材",
      "将 AI 应用工程师加入求职偏好"
    ]
  }
}
```

### 5.5 简历画像数据 Schema

用于驱动“求职画像页”和首页概览。

```json
{
  "resume_id": 1,
  "basic": {
    "target_role": "后端开发工程师",
    "years": 5,
    "level": "中高级"
  },
  "skills": [
    {"name": "Java", "level": 0.88, "evidence": ["项目A", "项目B"]},
    {"name": "Redis", "level": 0.76, "evidence": ["缓存优化项目"]}
  ],
  "projects": [
    {
      "name": "订单系统重构",
      "role": "核心开发",
      "keywords": ["高并发", "微服务", "Redis"],
      "impact": "接口耗时降低 35%"
    }
  ],
  "strengths": ["后端工程经验扎实", "有性能优化成果"],
  "risks": ["云原生经验描述不足", "管理经验不明显"]
}
```

### 5.6 岗位决策卡数据 Schema

用于驱动“岗位雷达页”和“岗位详情页”。重点不是算法如何计算，而是前端如何展示决策。

```json
{
  "job_id": "job_1024",
  "source": {
    "source_site": "boss",
    "source_label": "BOSS 直聘",
    "source_type": "job_board",
    "source_url": "https://example.com/job/1024",
    "source_logo": "/assets/sources/boss.svg",
    "collected_by": "mock_seed",
    "collected_at": "2026-06-02T10:00:00+08:00"
  },
  "decision": "强烈推荐",
  "priority": "P0",
  "overall_grade": "A",
  "scores": {
    "match": 92,
    "job_quality": 86,
    "growth": 90,
    "salary": 78,
    "competition_risk": 55,
    "apply_cost": 30
  },
  "hit_reasons": [
    "JD 要求 Java / Redis / 高并发，简历中均有项目证据",
    "用户有订单系统重构经验，与岗位业务场景接近"
  ],
  "gaps": [
    "JD 提到 Kubernetes，但简历中描述较少"
  ],
  "risks": [
    {"type": "竞争风险", "level": "中", "text": "岗位发布时间较久，可能已有较多候选人"},
    {"type": "技能缺口", "level": "低", "text": "Kubernetes 经验需要补充说明"}
  ],
  "next_actions": [
    "加入求职管线",
    "生成定制简历",
    "准备面试作战卡"
  ]
}
```

### 5.7 HC / 岗位来源标识通用字段

每个 HC / 岗位必须带来源信息，前端统一渲染为 `SourceBadge`。

```json
{
  "source_site": "boss",
  "source_label": "BOSS 直聘",
  "source_type": "job_board",
  "source_url": "https://example.com/job/1024",
  "source_logo": "/assets/sources/boss.svg",
  "source_confidence": "high",
  "collected_by": "mock_seed",
  "collected_at": "2026-06-02T10:00:00+08:00"
}
```

字段说明：

| 字段 | 说明 |
|---|---|
| `source_site` | 来源站点枚举，例如 `boss`、`liepin`、`lagou`、`linkedin`、`company_site`、`referral`、`mock_seed` |
| `source_label` | 前端展示名称，例如 BOSS 直聘、猎聘、官网、内推 |
| `source_type` | 来源类型：招聘平台 / 公司官网 / 内推 / 手动录入 / Mock 数据 |
| `source_url` | 原始岗位链接，Mock 场景可为空或指向示例链接 |
| `source_logo` | 来源图标资源 |
| `source_confidence` | 来源可信度：`high` / `medium` / `low` |
| `collected_by` | 采集方式：爬虫、手动录入、Mock Seed、算法同学接口 |
| `collected_at` | 采集时间 |

前端用途：

- 岗位卡片展示来源 Badge；
- 岗位详情页展示“查看原始来源”；
- 支持按来源筛选；
- 区分真实数据和 Demo Mock 数据；
- 展示数据可信度。

来源枚举建议：

| `source_site` | 展示名称 | 类型 |
|---|---|---|
| `boss` | BOSS 直聘 | 招聘平台 |
| `liepin` | 猎聘 | 招聘平台 |
| `lagou` | 拉勾 | 招聘平台 |
| `linkedin` | LinkedIn | 招聘平台 |
| `company_site` | 公司官网 | 公司官网 |
| `referral` | 内推 | 内推 |
| `manual` | 手动录入 | 手动录入 |
| `mock_seed` | Demo 数据 | Mock 数据 |

SourceBadge 视觉建议：

- 招聘平台：蓝色系；
- 公司官网：紫色系；
- 内推：绿色系；
- Mock 数据：灰色系；
- 低可信来源：显示弱提示，不参与默认高优先级推荐。

### 5.8 招聘官视角数据 Schema

用于驱动 `Recruiter Lens` 页面或岗位决策卡中的招聘官视角模块。

```json
{
  "job_id": "job_1024",
  "persona_id": "persona_ai_app",
  "first_impression": "候选人有后端工程基础，并具备 LLM 应用经验，适合 AI 应用工程岗位。",
  "highlights": [
    "订单系统重构项目有明确量化结果",
    "Python / LLM / 后端服务经验与岗位方向重合"
  ],
  "concerns": [
    "RAG 项目细节描述较少",
    "Kubernetes 经验没有直接证据"
  ],
  "screen_out_risks": [
    {"risk": "AI 项目深度不足", "level": "中", "fix": "补充 RAG 项目的业务目标、技术方案和效果指标"}
  ],
  "likely_questions": [
    "请介绍你做过的 LLM 应用项目",
    "RAG 检索质量如何评估",
    "你在后端系统中如何接入大模型服务"
  ],
  "pass_rate_tips": [
    "把 LLM 项目放到简历第一页",
    "增加检索准确率、响应耗时等量化指标"
  ]
}
```

### 5.9 职业素材库数据 Schema

用于驱动“职业素材库”和简历证据引用。

```json
{
  "projects": [
    {
      "id": "proj_order",
      "name": "订单系统重构",
      "role": "核心开发",
      "tags": ["Java", "Redis", "高并发"],
      "metrics": ["P95 延迟降低 35%", "峰值 QPS 提升到 8000"],
      "stories": [
        {
          "id": "story_1",
          "type": "STAR",
          "title": "高并发接口优化",
          "content": "通过缓存预热、异步削峰和 SQL 优化降低核心链路延迟。"
        }
      ]
    }
  ],
  "skills": [
    {"name": "Java", "level": "熟练", "evidence_ids": ["proj_order"]},
    {"name": "Redis", "level": "熟练", "evidence_ids": ["proj_order"]}
  ],
  "resume_versions": [
    {"id": "resume_backend_v1", "name": "后端通用版", "updated_at": "2026-06-02"}
  ]
}
```

### 5.10 简历工作室数据 Schema

用于展示“修改前后对比”和“证据引用”。

```json
{
  "job_id": "job_1024",
  "sections": [
    {
      "section": "项目经历",
      "before": "负责订单系统开发和性能优化。",
      "after": "负责订单系统核心链路重构，通过 Redis 缓存预热和异步削峰，将 P95 延迟降低 35%。",
      "reason": "JD 强调高并发和 Redis 经验，因此突出性能优化结果。",
      "evidence": [
        {
          "source_type": "career_vault_project",
          "source_id": "proj_order",
          "quote": "P95 延迟降低 35%"
        }
      ],
      "status": "可直接使用"
    },
    {
      "section": "技能补充",
      "before": "",
      "after": "建议补充 Kubernetes 部署经验。",
      "reason": "JD 提到 Kubernetes，但素材库缺少直接证据。",
      "evidence": [],
      "status": "建议补充"
    }
  ]
}
```

### 5.11 简历版本实验数据 Schema

用于驱动 `Resume A/B Lab`，展示不同简历版本的投递效果。

```json
{
  "summary": {
    "best_version_id": "resume_ai_app_v2",
    "best_version_name": "AI 应用强化版",
    "recommendation": "建议优先使用 AI 应用强化版投递 LLM / RAG 相关岗位"
  },
  "versions": [
    {
      "id": "resume_backend_v1",
      "name": "后端通用版",
      "applied_count": 10,
      "interview_count": 1,
      "no_response_count": 7,
      "interview_rate": 10,
      "best_for": ["Java 后端", "平台工程"]
    },
    {
      "id": "resume_ai_app_v2",
      "name": "AI 应用强化版",
      "applied_count": 6,
      "interview_count": 3,
      "no_response_count": 2,
      "interview_rate": 50,
      "best_for": ["AI 应用工程师", "LLM 工程师"]
    }
  ]
}
```

### 5.12 求职冲刺计划数据 Schema

用于驱动首页 `Job Search Sprint` 模块。

```json
{
  "today": [
    {"type": "apply", "title": "投递 2 个 P0 岗位", "priority": "P0"},
    {"type": "follow_up", "title": "跟进 3 天前投递的字节岗位", "priority": "P1"},
    {"type": "prepare", "title": "复习 RAG 项目讲述", "priority": "P1"}
  ],
  "week": [
    {"day": "周一", "task": "补充 AI 应用方向职业素材"},
    {"day": "周二", "task": "定制 2 份 AI 应用简历"},
    {"day": "周三", "task": "投递 5 个 P0/P1 岗位"}
  ],
  "health": {
    "apply_count": 18,
    "no_response_count": 12,
    "suggestion": "今天优先跟进和复盘，不建议继续盲目海投"
  }
}
```

### 5.13 面试作战卡数据 Schema

用于展示面试准备，而不是实时面试 Copilot。

```json
{
  "job_id": "job_1024",
  "company_brief": {
    "company": "某互联网公司",
    "business": "电商交易平台",
    "team_guess": "交易中台 / 订单系统"
  },
  "focus_areas": ["Java 并发", "Redis 缓存", "系统设计", "项目复盘"],
  "questions": [
    {
      "type": "项目题",
      "question": "请介绍你做过的高并发优化项目。",
      "answer_framework": ["背景", "瓶颈", "方案", "指标结果"],
      "evidence_ids": ["proj_order"]
    }
  ],
  "seven_day_plan": [
    {"day": 1, "task": "复盘订单系统重构项目"},
    {"day": 2, "task": "准备 Redis 缓存击穿、穿透、雪崩问题"}
  ]
}
```

### 5.14 求职管线数据 Schema

用于驱动 Kanban 页面。

```json
{
  "columns": [
    {"key": "interested", "title": "感兴趣"},
    {"key": "tailored", "title": "已定制简历"},
    {"key": "applied", "title": "已投递"},
    {"key": "hr", "title": "HR 沟通"},
    {"key": "interview", "title": "面试中"},
    {"key": "offer", "title": "Offer"},
    {"key": "closed", "title": "拒绝 / 放弃"}
  ],
  "cards": [
    {
      "id": "pipe_1",
      "job_id": "job_1024",
      "status": "applied",
      "company": "某互联网公司",
      "title": "高级 Java 后端工程师",
      "decision": "强烈推荐",
      "next_step": "等待 HR 回复，3 天后跟进",
      "updated_at": "2026-06-02"
    }
  ]
}
```

---

## 六、Web 页面设计

### 6.1 页面结构

```text
/
├── /login：登录
├── /register：注册
├── 首页：产品定位 + 一键开始 Demo
├── /personas：多求职身份
├── /market：机会热度广场
├── /vault：职业素材库 Career Vault
├── /resume：上传简历 / 加载样例简历 / 简历版本
├── /profile：求职画像页
├── /jobs：岗位雷达页
├── /jobs/:id：岗位决策卡
├── /jobs/:id/recruiter-lens：招聘官视角
├── /pipeline：求职管线 Kanban
├── /tailor/:id：简历工作室
├── /resume-lab：简历版本实验
├── /interview/:id：面试教练
├── /feedback：投递反馈复盘
└── /demo：演示控制台
```

### 6.2 核心页面说明

#### 注册 / 登录页

本次比赛版本需要有明确“用户”的概念，避免所有求职数据混在一起。

核心能力：

- 用户注册：邮箱 / 用户名 + 密码；
- 用户登录：登录成功后进入个人求职驾驶舱；
- 登录态保持：刷新页面后仍保持登录；
- 退出登录：清理本地 Token；
- 个人数据隔离：不同用户只能看到自己的简历、画像、岗位决策卡、求职管线和生成内容。

Demo 策略：

- 保留一个内置演示账号，例如 `demo@jobhunter.local`；
- 首页提供“使用演示账号进入”按钮，方便现场快速演示；
- 真实注册登录能力仍可展示，体现产品完整度。

#### 首次引导 Onboarding

首次引导用于避免用户登录后不知道从哪里开始。

流程：

```text
登录 / 演示账号进入
  ↓
选择求职身份
  ↓
填写目标城市 / 岗位方向 / 薪资期望
  ↓
选择：加载 Demo 素材 或 上传简历
  ↓
进入机会热度广场
```

页面策略：

- 比赛演示默认走“演示账号 + Demo 素材”；
- 真实用户可以上传简历；
- 如果跳过引导，首页显示“继续完善求职身份”的行动卡；
- 引导完成后写入当前 `persona_id` 和 `user_preferences`。

#### 首页

展示一句话：

> 从海投到精投，AI 帮你判断哪些岗位值得投，并管理每一步求职行动。

视觉元素：

- 背景为流动网格或渐变粒子；
- 中间显示“启动求职作战中枢”按钮；
- 下方显示五步流程：身份、热度广场、岗位决策、求职管线、反馈复盘；
- 展示今日概览：强推荐岗位数、待跟进事项、面试准备任务。
- 展示今日求职冲刺计划：今天该投、该跟进、该补充、该复习什么。

#### 前端状态管理

前端需要明确 Store 划分，避免页面多后状态混乱。

| Store | 职责 |
|---|---|
| `authStore` | 登录态、Token、当前用户 |
| `personaStore` | 当前求职身份、身份列表 |
| `marketStore` | 机会热度广场、全局 / 我的倾向切换 |
| `vaultStore` | 职业素材库、素材编辑状态 |
| `jobStore` | 岗位列表、筛选、排序、来源筛选 |
| `decisionStore` | 岗位决策卡、招聘官视角 |
| `pipelineStore` | Kanban 列、卡片状态、提醒 |
| `resumeLabStore` | 简历版本、版本实验结果 |
| `sprintStore` | 今日 / 本周任务 |
| `systemStore` | 版本检测、更新状态、恢复点 |

关键状态：

- `currentUser`;
- `activePersonaId`;
- `dataMode`: `mock` / `api` / `hybrid`;
- `jobFilters`;
- `pendingRestore`;
- `updateStatus`。

#### 多求职身份 Career Persona

多求职身份用于支持用户并行探索不同方向。

页面模块：

- 当前激活身份；
- 身份卡片列表；
- 每个身份的目标岗位、核心技能、城市偏好；
- 该身份下的机会热度、岗位数量、管线状态；
- 新建身份 / 切换身份 / 归档身份。

核心交互：

- 切换求职身份后，全站上下文随之切换；
- 机会热度广场根据当前身份展示“我的倾向”；
- 岗位雷达自动按当前身份筛选；
- 简历版本实验按当前身份统计效果；
- 管线可以按身份过滤。

#### 机会热度广场

机会热度广场用于解决“用户第一次进来不知道从哪里开始”的问题。

展示策略：

- **首次进入 / 无画像**：展示全局热门机会；
- **已有画像 / 偏好**：展示当前用户倾向高的机会；
- **有浏览和反馈行为**：根据用户点击、加入管线、投递反馈高亮相关方向。

页面模块：

- 热门岗位方向，例如后端、AI 应用、数据分析、前端；
- 热门城市机会，例如北京、上海、深圳、杭州、远程；
- 热门技能趋势，例如 Agent、RAG、Java、Go、React；
- 高成长方向，例如 AI 应用工程师、数据工程、云原生；
- 用户倾向推荐，例如“更适合你的 5 个方向”；
- 从热度项一键进入岗位雷达。

关键交互：

- 点击热度卡片进入岗位雷达，并自动带上筛选条件；
- 切换“全局热度 / 我的倾向”；
- 收藏某个方向；
- 将方向写入求职偏好；
- 查看该方向下的代表岗位。

前端展示重点：

```text
AI 应用工程师
热度：92
增长：+18%
适配你：高
原因：你的 Python / LLM / 后端经验与该方向重合
[查看岗位] [加入偏好]
```

#### 职业素材库 Career Vault

这是前端当前阶段的重点页面之一。目标是让用户看到系统不是凭空生成内容，而是基于真实素材提供建议。

页面模块：

- 项目经历卡片；
- 技能证据卡片；
- 量化成果列表；
- STAR 故事库；
- 证书 / 作品链接；
- 简历版本管理。

核心交互：

- 新增素材；
- 编辑素材；
- 给素材打标签；
- 展开查看证据；
- 将素材关联到某个简历版本；
- 从素材库跳转到简历工作室。

前端展示重点：

```text
技能：Redis
证据：
  - 订单系统重构项目
  - P95 延迟降低 35%
  - 峰值 QPS 提升到 8000
```

#### 求职画像页

展示系统对用户的理解：

- 目标岗位；
- 核心技能；
- 项目亮点；
- 岗位适配类型；
- 简历风险提示。

#### 岗位雷达页

重点展示“美观”和“可决策”：

- 左侧为岗位卡片列表；
- 右侧为筛选条件与匹配分布；
- 顶部显示本次扫描概览：岗位数、强推荐数、平均决策分；
- 卡片展示：来源标识、匹配度、岗位质量、成长潜力、竞争风险；
- 筛选支持：城市、岗位、薪资、来源网站、决策等级、管线状态；
- 点击岗位进入详情。

#### 岗位决策卡

这是本项目区别于普通“岗位匹配”的核心页面。

页面模块：

- 投递建议：强烈推荐 / 推荐 / 观望 / 不建议；
- 综合等级：A / B / C；
- 分项得分：匹配度、岗位质量、成长潜力、薪资吸引力、竞争风险、投递成本；
- 命中理由；
- 技能缺口；
- 风险提示；
- 下一步行动。

关键按钮：

- 加入求职管线；
- 生成定制简历；
- 生成面试作战卡；
- 标记不感兴趣；
- 记录投递反馈。

#### 招聘官视角 Recruiter Lens

招聘官视角模拟 HR / 面试官如何看待当前用户和目标岗位。

页面模块：

- 第一眼印象；
- 简历亮点；
- 简历疑点；
- 可能被筛掉的原因；
- 最可能被追问的问题；
- 提高通过率建议。

核心交互：

- 从岗位决策卡进入；
- 点击疑点跳转职业素材库补充证据；
- 点击追问题跳转面试作战卡；
- 将建议同步到简历工作室。

#### 求职管线 Kanban

用于把求职从“看岗位”变成“管理过程”。

默认列：

```text
感兴趣 → 已定制简历 → 已投递 → HR 沟通 → 面试中 → Offer → 拒绝 / 放弃
```

核心交互：

- 拖拽岗位卡片变更状态；
- 点击卡片进入岗位决策卡；
- 设置下一步提醒；
- 记录 HR 沟通备注；
- 记录面试时间；
- 选择本岗位使用的简历版本；
- 标记最终结果。

前端演示重点：

- 把一个“强烈推荐”岗位加入管线；
- 拖到“已投递”；
- 设置“3 天后跟进 HR”；
- 后续在反馈页看到该记录。

#### 简历工作室

展示修改前后对比：

- 左边原始简历片段；
- 右边优化后片段；
- 中间显示修改原因；
- 所有增强句子都显示“依据来自哪个项目”；
- 区分“可直接使用”和“建议补充”。

关键交互：

- 查看证据来源；
- 接受某条修改；
- 撤回某条修改；
- 复制优化后的片段；
- 保存为新简历版本。

#### 简历版本实验 Resume A/B Lab

简历版本实验用于比较不同简历版本的投递效果。

页面模块：

- 简历版本列表；
- 每个版本的投递数、面试数、无回复数、面试率；
- 适合岗位方向；
- 建议继续使用 / 调整 / 停用；
- 最佳版本推荐。

核心交互：

- 查看版本效果；
- 对比两个简历版本；
- 从简历工作室保存新版本；
- 从管线中查看某岗位使用了哪个简历版本；
- 根据反馈更新版本表现。

#### 面试教练

展示面试准备：

- 高频题列表；
- 每题回答框架；
- 重点复习关键词；
- 面试风险提醒；
- 7 天准备计划。

#### 投递反馈复盘

用于形成“可学习”的产品闭环。当前阶段前端先记录和展示反馈，算法学习后续接入。

页面模块：

- 投递结果统计；
- 最近无回复岗位；
- 收到面试岗位；
- 被拒原因分布；
- 推荐调整建议，先用 Mock 文案；
- 下一轮求职策略。

核心交互：

- 对某个岗位标记：收到面试 / 被拒 / 无回复 / 放弃；
- 选择原因：技术栈不匹配、薪资不符、年限不足、JD 不清晰；
- 添加备注；
- 生成复盘摘要。

---

## 七、用户体系与权限设计

### 7.1 用户模型

本项目从比赛版开始引入用户体系，所有核心数据都归属于用户。

```text
用户
 ├── 简历
 ├── 求职画像
 ├── 求职偏好
 ├── 多求职身份
 ├── 职业素材库
 ├── 岗位决策卡
 ├── 招聘官视角
 ├── 求职管线
 ├── 定制简历输出
 ├── 简历版本实验
 ├── 面试作战卡
 ├── 投递反馈
 └── 求职冲刺计划
```

### 7.2 注册登录流程

```text
注册
  │
  ├── 输入邮箱 / 用户名 / 密码
  ├── 后端校验邮箱唯一性
  ├── 密码 bcrypt / argon2 哈希
  └── 创建用户并返回登录 Token

登录
  │
  ├── 输入邮箱 / 密码
  ├── 校验密码哈希
  ├── 生成 Access Token + Refresh Token
  └── 前端保存 Token，进入求职驾驶舱
```

### 7.3 鉴权方案

推荐使用：

- `access_token`：短期有效，例如 2 小时；
- `refresh_token`：长期有效，例如 7 天；
- 前端请求 API 时在 Header 中携带：

```text
Authorization: Bearer <access_token>
```

Token 过期后：

1. 前端调用 `/api/auth/refresh`；
2. 成功则刷新 Token 并继续原请求；
3. 失败则跳转登录页。

### 7.4 数据隔离原则

所有涉及用户数据的表都必须包含 `user_id`：

- `resumes.user_id`;
- `resume_versions.user_id`;
- `resume_profiles.user_id`;
- `career_personas.user_id`;
- `user_opportunity_preferences.user_id`;
- `career_vault_items.user_id`;
- `job_decision_cards.user_id`;
- `recruiter_lens_reports.user_id`;
- `pipeline_cards.user_id`;
- `resume_version_metrics.user_id`;
- `application_feedback.user_id`;
- `sprint_tasks.user_id`;
- `tailor_outputs.user_id`;
- `interview_cards.user_id`;
- `user_preferences.user_id`。

后端不能信任前端传入的 `user_id`。  
正确做法：

```text
从 JWT 中解析当前用户 ID → 后端自动注入查询条件 → 只返回当前用户的数据
```

### 7.5 `persona_id` 贯穿原则

引入多求职身份后，仅有 `user_id` 不够。所有和求职方向强相关的数据，都应携带 `persona_id`。

必须携带 `persona_id` 的数据：

- 求职画像；
- 岗位决策卡；
- 招聘官视角；
- 求职管线；
- 定制简历输出；
- 简历版本实验；
- 面试作战卡；
- 投递反馈；
- 求职冲刺任务。

查询原则：

```text
当前用户 user_id + 当前求职身份 activePersonaId
  ↓
后端自动注入 user_id 和 persona_id
  ↓
返回当前身份下的数据
```

切换身份后：

- 机会热度广场刷新；
- 岗位雷达筛选条件刷新；
- 岗位决策卡重新读取；
- 管线只显示当前身份的数据；
- 简历版本实验只统计当前身份的数据。

### 7.6 比赛版简化策略

为了保证开发效率：

- 不做短信验证码；
- 不做第三方 OAuth；
- 不做复杂权限角色；
- 不做管理员后台；
- 只做普通用户登录态和个人数据隔离。

---

## 八、在线更新与重启续连设计

### 8.1 设计目标

比赛开发过程中，前端或后台代码经常会更新。用户希望在页面上看到提示：

```text
发现新版本，点击更新后将自动重启并加载最新代码。
```

更新后需要做到：

- 用户能看到更新提示；
- 用户主动点击更新；
- 前端刷新到最新静态资源；
- 后端服务可重启；
- 重启过程中前端有明确等待状态；
- 重启后自动继续同步当前用户状态。

### 8.2 版本信息机制

系统维护一个统一版本信息：

```json
{
  "version": "2026.06.02.1",
  "git_commit": "abc1234",
  "build_time": "2026-06-02T15:30:00+08:00",
  "frontend_hash": "fe_xxx",
  "backend_hash": "be_xxx",
  "update_required": true,
  "message": "岗位雷达页和求职管线交互已更新"
}
```

版本信息来源：

- 前端构建时生成 `version.json`；
- 后端启动时读取当前 `git_commit / build_time`；
- API `/api/system/version` 返回当前后端版本；
- 前端定时对比本地版本与后端版本。

### 8.3 前端更新提示流程

```text
前端启动
  │
  ├── 读取本地构建版本
  ├── 调用 /api/system/version
  ├── 每 30-60 秒轮询一次版本
  │
  ├── 若版本一致：不提示
  │
  └── 若版本不一致：
        页面右上角显示更新提示
        "发现新版本：岗位雷达页已更新"
        [立即更新] [稍后]
```

点击“立即更新”后：

1. 保存当前页面路由、任务 ID、筛选条件到 `localStorage`；
2. 调用 `/api/system/update/apply`；
3. 前端进入“正在更新”遮罩页；
4. 后端触发更新脚本或标记重启；
5. 前端轮询 `/api/system/health`；
6. 服务恢复后，前端强制刷新页面并清理旧缓存；
7. 自动回到更新前页面，继续加载当前用户数据。

### 8.4 后端更新执行方式

比赛版推荐两种模式，优先使用模式 A。

代码流转总原则：

```text
本地开发机写代码
  ↓
Git 仓库作为唯一代码真源
  ↓
远端演示机只负责拉取稳定版本并运行
```

约束：

- 不在远端演示机直接修改业务代码；
- 不把手工拷贝文件或 `rsync dist` 作为主流程；
- 远端环境的每一次更新都应能追溯到明确的 Git commit 或 tag；
- 本地开发优先使用热更新，演示环境优先使用手动可控部署。

#### 模式 A：本地开发热更新

适合开发联调：

- 前端 Vite dev server 自动热更新；
- 后端 FastAPI 使用 `--reload`；
- 页面只需要提示“前端资源已更新，请刷新”。

#### 模式 B：演示服务器一键更新

适合部署后的演示环境：

```text
用户点击更新
  │
  ▼
后端写入 update_jobs 记录
  │
  ▼
后台执行 scripts/update-and-restart.sh
  │
  └── 内部调用统一一键升级入口
  │
  ▼
前端健康检查通过后刷新
```

### 8.5 更新脚本建议

```bash
#!/usr/bin/env bash
set -e

cd /opt/jobhunter
make upgrade
```

说明：

- `scripts/update-and-restart.sh` 不应自己重复实现升级逻辑，而应只调用统一入口，例如 `make upgrade`；
- Git 仓库是唯一真源，推荐始终使用 `git pull` / `git checkout <tag>` 更新代码；
- `rsync` 只作为比赛现场极端情况下的应急兜底，不作为日常主流程；
- 如果使用 Docker 镜像部署，则改为 `docker compose build && docker compose up -d`；
- 更新完成后应刷新 `version.json`，并确保该文件禁缓存；
- 更新脚本必须写日志，便于前端展示更新进度。

### 8.6 重启续连机制

为了避免用户点击更新后状态丢失，前端需要保存：

```json
{
  "route": "/jobs/1024",
  "active_persona_id": "persona_ai_app",
  "resume_id": 1,
  "job_id": 1024,
  "task_id": "task_abc",
  "data_mode": "mock",
  "filters": {
    "city": "北京",
    "role": "Java 后端",
    "source_site": "boss"
  }
}
```

恢复流程：

```text
服务重启完成
  │
  ├── 前端刷新
  ├── 使用 refresh_token 恢复登录态
  ├── 读取 localStorage 中的 pending_restore
  ├── 重新拉取当前用户数据
  ├── 查询 task_id 是否完成
  └── 回到更新前页面
```

### 8.7 更新状态展示

更新过程不应该让用户看到空白页。推荐展示：

```text
正在更新 JobHunter...

✓ 已保存当前工作区
✓ 正在同步最新代码
✓ 正在重启服务
○ 正在恢复你的求职驾驶舱
```

如果更新失败：

```text
更新失败，已保留当前版本。
[重试更新] [返回当前页面]
```

### 8.8 安全限制

点击更新本质上会触发服务器执行脚本，因此必须限制：

- 只有已登录用户可查看更新提示；
- 只有演示环境允许点击更新；
- 生产环境应改成管理员权限；
- 更新接口需要防重复点击；
- 同一时间只能有一个更新任务执行；
- 更新脚本只能执行固定白名单脚本，不能接收任意命令。

---

## 九、API 设计

### 9.1 API 统一响应格式

所有 API 使用统一响应结构，方便前端统一处理 Loading、Error、Toast 和请求追踪。

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "request_id": "req_20260602_xxx"
}
```

失败响应：

```json
{
  "code": 40001,
  "message": "未登录或登录已过期",
  "data": null,
  "request_id": "req_20260602_xxx"
}
```

分页响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 120,
      "has_more": true
    }
  },
  "request_id": "req_20260602_xxx"
}
```

错误码建议：

| 错误码 | 含义 |
|---:|---|
| `0` | 成功 |
| `40001` | 未登录或 Token 过期 |
| `40002` | 无权限访问该用户数据 |
| `40003` | 参数错误 |
| `40004` | 资源不存在 |
| `50001` | 服务内部错误 |
| `50002` | Mock 数据加载失败 |
| `50003` | 更新任务失败 |

### 9.2 核心接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/refresh` | POST | 刷新登录 Token |
| `/api/auth/logout` | POST | 退出登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/mock/bootstrap` | GET | 获取前端 Demo 所需全部 Mock 数据 |
| `/api/demo/reset` | POST | 重置 Demo 状态 |
| `/api/personas` | GET | 获取求职身份列表 |
| `/api/personas` | POST | 新建求职身份 |
| `/api/personas/{id}/activate` | POST | 切换当前求职身份 |
| `/api/market` | GET | 获取机会热度广场数据 |
| `/api/market/directions/{id}/jobs` | GET | 根据热度方向进入岗位雷达 |
| `/api/market/directions/{id}/favorite` | POST | 收藏机会方向 |
| `/api/market/directions/{id}/apply-preference` | POST | 将方向写入求职偏好 |
| `/api/vault` | GET | 获取职业素材库 |
| `/api/vault/items` | POST | 新增职业素材 |
| `/api/vault/items/{id}` | PATCH | 更新职业素材 |
| `/api/resumes/upload` | POST | 上传简历文件 |
| `/api/resumes/demo` | POST | 加载预置简历 |
| `/api/resumes/versions` | GET | 获取简历版本列表 |
| `/api/resumes/versions` | POST | 保存新简历版本 |
| `/api/resumes/{id}/profile` | GET | 获取简历画像 |
| `/api/jobs` | GET | 获取岗位列表 |
| `/api/jobs/{id}/decision` | GET | 获取岗位决策卡 |
| `/api/jobs/{id}/recruiter-lens` | GET | 获取招聘官视角 |
| `/api/decisions` | GET | 获取岗位决策卡列表 |
| `/api/pipeline` | GET | 获取求职管线 |
| `/api/pipeline/cards` | POST | 岗位加入求职管线 |
| `/api/pipeline/cards/{id}` | PATCH | 更新管线卡片状态 / 备注 / 提醒 |
| `/api/tailor/run` | POST | 生成定制简历 |
| `/api/resume-lab` | GET | 获取简历版本实验结果 |
| `/api/resume-lab/compare` | GET | 对比两个简历版本 |
| `/api/interview/start` | POST | 生成面试作战卡 |
| `/api/feedback` | GET | 获取投递反馈复盘 |
| `/api/feedback` | POST | 新增投递反馈 |
| `/api/sprint` | GET | 获取今日 / 本周求职冲刺计划 |
| `/api/tasks/{id}/events` | GET | 获取任务进度，SSE 可选 |
| `/api/system/version` | GET | 获取当前系统版本 |
| `/api/system/health` | GET | 健康检查 |
| `/api/system/update/check` | GET | 检查是否有新版本 |
| `/api/system/update/apply` | POST | 触发更新并重启 |
| `/api/system/update/status/{id}` | GET | 查询更新任务状态 |

### 9.3 任务进度推送

为了让 Web Demo 更有“AI 正在工作”的感觉，推荐使用 SSE 展示进度：

```text
正在加载机会热度广场...
正在加载职业素材库...
正在生成求职画像...
正在扫描岗位数据集...
正在生成岗位决策卡...
正在同步求职管线...
完成，发现 5 个强推荐岗位。
```

如果时间紧，也可以前端用固定进度条模拟。当前阶段优先保证页面状态、进度动画、错误提示和数据回填稳定。

### 9.4 状态与枚举规范

#### 求职管线状态

| 状态 | 展示名 | 说明 |
|---|---|---|
| `interested` | 感兴趣 | 用户收藏或加入管线，但还未处理 |
| `tailored` | 已定制简历 | 已为该岗位生成或选择简历版本 |
| `applied` | 已投递 | 用户已投递 |
| `hr_contact` | HR 沟通 | 已有 HR 联系或沟通记录 |
| `interviewing` | 面试中 | 已进入面试流程 |
| `offer` | Offer | 已获得 Offer |
| `rejected` | 拒绝 | 已被拒 |
| `abandoned` | 放弃 | 用户主动放弃 |

允许流转：

```text
interested → tailored / applied / abandoned
tailored → applied / abandoned
applied → hr_contact / interviewing / rejected / abandoned
hr_contact → interviewing / rejected / abandoned
interviewing → offer / rejected / abandoned
offer → abandoned
```

#### 求职冲刺任务状态

| 状态 | 展示名 |
|---|---|
| `todo` | 待处理 |
| `doing` | 进行中 |
| `done` | 已完成 |
| `skipped` | 已跳过 |

#### 投递反馈结果

| 状态 | 展示名 |
|---|---|
| `interview` | 收到面试 |
| `rejected` | 被拒 |
| `no_response` | 无回复 |
| `offer` | 收到 Offer |
| `abandoned` | 主动放弃 |

#### 决策等级

| 状态 | 展示名 |
|---|---|
| `strong_recommend` | 强烈推荐 |
| `recommend` | 推荐 |
| `watch` | 观望 |
| `not_recommend` | 不建议 |

#### 优先级

| 状态 | 展示名 |
|---|---|
| `P0` | 今天优先处理 |
| `P1` | 本周处理 |
| `P2` | 有空再看 |

---

## 十、数据模型

### 10.1 表结构

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    target_roles TEXT,
    cities TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    keywords_include TEXT,
    keywords_exclude TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_personas (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    target_roles TEXT,
    core_skills TEXT,
    preferred_cities TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opportunity_market_items (
    id INTEGER PRIMARY KEY,
    item_type TEXT NOT NULL, -- role / city / skill / industry
    name TEXT NOT NULL,
    heat_score REAL,
    growth_score REAL,
    tags TEXT,
    filters_json TEXT,
    source_site TEXT DEFAULT 'mock_seed',
    source_label TEXT DEFAULT 'Mock 数据',
    source_type TEXT DEFAULT 'mock',
    source_url TEXT,
    source_confidence TEXT DEFAULT 'medium',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_opportunity_preferences (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    market_item_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- viewed / favorited / applied_preference
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_vault_items (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL, -- project / skill / metric / story / certificate / link
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT,
    evidence_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    filename TEXT,
    raw_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    resume_id INTEGER,
    profile_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_versions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    resume_id INTEGER,
    name TEXT,
    content TEXT,
    source_job_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_version_metrics (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    resume_version_id INTEGER NOT NULL,
    applied_count INTEGER DEFAULT 0,
    interview_count INTEGER DEFAULT 0,
    no_response_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    offer_count INTEGER DEFAULT 0,
    metrics_json TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id INTEGER PRIMARY KEY,
    title TEXT,
    company TEXT,
    city TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    experience TEXT,
    jd TEXT,
    tags TEXT,
    source_site TEXT,
    source_label TEXT,
    source_type TEXT,
    source_url TEXT,
    source_logo TEXT,
    source_confidence TEXT DEFAULT 'medium',
    collected_by TEXT,
    collected_at DATETIME
);

CREATE TABLE job_decision_cards (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    resume_id INTEGER,
    job_id INTEGER,
    decision TEXT,
    priority TEXT,
    overall_grade TEXT,
    scores_json TEXT,
    detail_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recruiter_lens_reports (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    job_id INTEGER NOT NULL,
    report_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pipeline_cards (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    job_id INTEGER NOT NULL,
    resume_version_id INTEGER,
    status TEXT NOT NULL,
    next_step TEXT,
    reminder_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tailor_outputs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    resume_id INTEGER,
    job_id INTEGER,
    output_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_feedback (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    job_id INTEGER NOT NULL,
    pipeline_card_id INTEGER,
    result TEXT, -- interview / rejected / no_response / abandoned / offer
    reason TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sprint_tasks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    task_type TEXT,
    title TEXT NOT NULL,
    priority TEXT,
    status TEXT DEFAULT 'todo',
    due_at DATETIME,
    source_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_cards (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    persona_id INTEGER,
    resume_id INTEGER,
    job_id INTEGER,
    card_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_versions (
    id INTEGER PRIMARY KEY,
    version TEXT NOT NULL,
    git_commit TEXT,
    frontend_hash TEXT,
    backend_hash TEXT,
    build_time DATETIME,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE update_jobs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    status TEXT DEFAULT 'pending',
    from_version TEXT,
    to_version TEXT,
    log TEXT,
    started_at DATETIME,
    finished_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 10.2 Demo 数据集

岗位数据建议覆盖：

- Java 后端；
- Go 后端；
- Python / AI 应用；
- 前端；
- 数据分析；
- 算法工程师；
- 产品经理；
- 测试开发。

每条岗位至少包含：

- 岗位名称；
- 公司名称；
- 来源网站标识；
- 来源类型；
- 原始来源链接；
- 城市；
- 薪资；
- 年限；
- JD；
- 技能标签；
- 业务方向。

---

## 十一、工程结构建议

```text
jobhunter/
├── doc/
│   ├── JHS架构设计文档.md                    # 历史 Demo 文档
│   └── 黑马大赛-JobHunter架构设计文档.md      # 本次比赛文档
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── UpdateOverlay.tsx
│   │   ├── components/
│   │   ├── charts/
│   │   ├── auth/
│   │   ├── mocks/
│   │   ├── stores/
│   │   └── api/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── personas.py
│   │   ├── market.py
│   │   ├── vault.py
│   │   ├── resumes.py
│   │   ├── jobs.py
│   │   ├── decisions.py
│   │   ├── recruiter_lens.py
│   │   ├── pipeline.py
│   │   ├── resume_lab.py
│   │   ├── feedback.py
│   │   ├── sprint.py
│   │   └── system.py
│   ├── mock_data/
│   ├── schemas/
│   ├── services/
│   ├── db/
│   ├── migrations/
│   ├── alembic.ini
│   └── requirements.txt
├── .env.local.example
├── .env.demo.example
├── Makefile
├── scripts/
│   ├── bootstrap.sh
│   ├── start-local.sh
│   ├── deploy-demo.sh
│   ├── migrate.sh
│   ├── upgrade-demo.sh
│   ├── rollback-demo.sh
│   └── update-and-restart.sh
├── data/
│   ├── seed_jobs.json
│   ├── demo_career_personas.json
│   ├── demo_opportunity_market.json
│   ├── demo_resume.md
│   ├── demo_career_vault.json
│   ├── demo_decision_cards.json
│   ├── demo_recruiter_lens.json
│   ├── demo_pipeline.json
│   ├── demo_resume_ab_lab.json
│   ├── demo_sprint_plan.json
│   └── jobhunter.db
├── docker-compose.yml
└── README.md
```

### 11.2 前端代码工程要求

前端代码需要服务比赛演示和后续算法接入，目标是：

```text
性能佳 / 易扩展 / 调用简单 / 无重复代码 / Mock 与 API 可无缝切换
```

#### 总体原则

| 原则 | 要求 |
|---|---|
| 性能佳 | 首屏快速可见，路由、图表、大列表按需加载，避免无意义重渲染 |
| 易扩展 | 新增页面、接口、Mock 数据、业务组件时，不影响现有模块 |
| 调用简单 | 页面只调用业务 Hook 或 Service，不直接处理底层请求、缓存和错误 |
| 无重复代码 | 相同 UI、接口、枚举、状态流转、格式化逻辑必须抽象复用 |
| 类型安全 | TypeScript 类型贯穿 API、Store、组件 Props 和 Mock 数据 |
| 演示稳定 | API 失败、算法未就绪、数据为空时，前端仍能展示兜底状态 |

#### 推荐前端目录分层

```text
frontend/src/
├── api/                         # 请求封装与业务 service
│   ├── request.ts               # 统一 request<T>
│   ├── auth.service.ts
│   ├── persona.service.ts
│   ├── market.service.ts
│   ├── job.service.ts
│   ├── pipeline.service.ts
│   └── system.service.ts
├── assets/                      # 静态资源、来源 Logo、插图
├── components/
│   ├── base/                    # Button / Input / Modal / Drawer / Toast
│   ├── business/                # JobCard / SourceBadge / DecisionCard / PipelineBoard
│   └── charts/                  # RadarChart / HeatMap / FunnelChart
├── config/                      # 运行模式、路由常量、版本配置
├── hooks/                       # useJobs / usePersona / useUpdateChecker
├── layouts/                     # AuthLayout / AppLayout / DemoLayout
├── mocks/                       # Mock JSON 与 Mock Adapter
├── pages/                       # 页面编排，不写复杂业务逻辑
├── routes/                      # 路由表、路由守卫、懒加载配置
├── stores/                      # authStore / personaStore / jobStore 等
├── styles/                      # 全局样式、主题变量、响应式断点
├── types/                       # API DTO、枚举、领域模型
└── utils/                       # format、date、score、storage、guards
```

目录职责要求：

- `pages/` 只做页面布局、模块组合和跳转，不直接写复杂计算逻辑；
- `components/base/` 不包含业务含义，保证全站可复用；
- `components/business/` 承载 JobHunter 业务组件，如 `JobCard`、`SourceBadge`、`DecisionCard`；
- `api/` 只负责请求和数据适配，不写页面状态；
- `stores/` 只管理跨页面共享状态，不存临时 UI 状态；
- `hooks/` 封装页面常用业务调用，让页面调用足够简单；
- `types/` 集中定义所有枚举和 DTO，禁止在页面里散落字符串枚举。

#### 组件分层要求

| 层级 | 示例 | 要求 |
|---|---|---|
| 基础组件 | `Button`、`Input`、`Modal`、`Drawer`、`Toast` | 无业务字段，统一主题、尺寸、禁用态、加载态 |
| 业务组件 | `JobCard`、`SourceBadge`、`PersonaSwitcher`、`DecisionCard` | 只依赖明确 Props，可被多个页面复用 |
| 复合模块 | `OpportunityMarketPanel`、`PipelineBoard`、`ResumeLabSummary` | 负责一个完整业务区域，内部组合多个业务组件 |
| 页面组件 | `JobsPage`、`PipelinePage`、`MarketPage` | 只做数据获取、布局和交互编排 |

反例：

```text
JobsPage 里直接写岗位卡片 JSX、fetch、分数格式化、来源颜色判断、加入管线逻辑。
```

正确方式：

```text
JobsPage
  ├── useJobs()
  ├── usePipelineActions()
  └── <JobCard />
        ├── <SourceBadge />
        └── <ScoreRing />
```

#### API 调用要求

页面禁止直接调用 `fetch` 或 `axios`。统一使用：

```ts
const jobs = await jobService.listJobs({ personaId, filters });
```

底层统一封装：

```ts
request<T>({
  url: "/api/jobs",
  method: "GET",
  params,
});
```

要求：

- 所有接口统一通过 `request<T>()` 处理；
- 所有业务接口统一放入 `*.service.ts`；
- 统一处理 Token 注入、刷新、错误码、超时、重试和请求 ID；
- 统一支持 `dataMode`：
  - `mock`：完全使用前端 Mock；
  - `api`：完全请求后端；
  - `hybrid`：优先 API，失败时降级 Mock；
- 页面只感知业务数据，不感知接口细节；
- 接口返回必须经过 adapter 适配为前端领域模型，避免页面依赖后端字段细节。

推荐调用链：

```text
Page → useBusinessHook → service → request<T> → adapter → API / Mock
```

#### Store 与状态管理要求

已有 Store 划分保持不变，但需要补充以下约束：

- 同一份数据只能有一个主 Store，禁止多个 Store 重复存储；
- 页面临时状态留在页面内，例如弹窗开关、当前 Tab、局部表单草稿；
- 跨页面状态才进入 Store，例如登录态、当前身份、岗位筛选、管线数据；
- 派生数据通过 selector / computed 获取，不另存一份；
- `activePersonaId` 切换时，依赖身份的数据必须重新拉取或按身份隔离缓存；
- 更新重启前的恢复点只放在 `systemStore` 和 `localStorage`，避免散落在页面。

关键状态边界：

| 状态 | 存放位置 | 说明 |
|---|---|---|
| 当前用户 | `authStore` | 登录态和用户信息唯一来源 |
| 当前求职身份 | `personaStore` | 全局上下文核心 |
| 岗位筛选条件 | `jobStore` | 支持从热度广场跳转带入 |
| 管线列和卡片 | `pipelineStore` | 管线状态唯一来源 |
| 更新状态 | `systemStore` | 版本检测、更新进度、恢复点 |
| 弹窗开关 | 页面本地 state | 不进入全局 Store |

#### 性能要求

比赛演示需要“打开即有内容、交互不卡顿”。前端性能要求如下：

| 场景 | 要求 |
|---|---|
| 首屏 | 登录后优先展示首页骨架和 Mock 概览，不等待所有模块完成 |
| 路由 | 所有二级页面懒加载，首屏不打包全部页面 |
| 图表 | ECharts / Recharts 动态加载，不进入首屏主包 |
| 大列表 | 岗位列表超过 100 条使用分页或虚拟滚动 |
| 图片 | 来源 Logo、公司 Logo、插图懒加载，失败时显示默认图标 |
| 状态更新 | 避免一个 Store 更新导致全站重渲染 |
| 搜索筛选 | 输入防抖 200-300ms，复杂筛选使用 memo 缓存 |
| 动画 | 大屏可开视觉动效，移动端和低性能设备降低动画强度 |
| 更新检测 | 轮询间隔 30-60 秒，页面隐藏时暂停或降低频率 |

建议性能预算：

- 首屏可交互目标：本地 Demo 环境 2 秒内；
- 岗位雷达筛选响应：300ms 内；
- Kanban 拖拽响应：不卡顿，无明显掉帧；
- 单页面核心数据请求失败后：1 秒内展示兜底状态；
- 打包产物：图表库、Demo 数据和页面代码分包加载。

#### 易扩展要求

新增功能时应遵循固定扩展路径：

```text
新增页面：
routes 新增路由 → pages 新增页面 → api 新增 service → store 可选 → mocks 新增数据

新增业务组件：
components/business 新增组件 → types 补充 Props 类型 → Story / Demo 区域验证

新增接口：
types 定义 DTO → api service 调用 → mock adapter 兜底 → 页面 Hook 调用

新增来源网站：
source 枚举新增 → SourceBadge 配色新增 → assets 增加 Logo → 筛选项自动出现
```

要求：

- 新增岗位来源不允许改多个页面，只改来源枚举、Logo 和 `SourceBadge` 配置；
- 新增管线状态不允许散落改判断逻辑，只改状态枚举和状态流转配置；
- 新增算法结果字段时，页面默认忽略未知字段，避免接口升级导致崩溃；
- Mock 数据与 API 数据使用同一套 TypeScript 类型。

#### 调用简单要求

页面层应该像调用业务能力，而不是调用接口细节。

示例：

```ts
const { jobs, loading, error, filters, setFilters } = useJobs(activePersonaId);
const { addToPipeline } = usePipelineActions();
const { updateAvailable, applyUpdate } = useUpdateChecker();
```

页面不应该出现：

```text
token 拼接 / localStorage 读写 / 错误码判断 / source_site 颜色判断 / 管线状态流转校验
```

这些逻辑应放在：

- `api/request.ts`;
- `utils/storage.ts`;
- `utils/source.ts`;
- `utils/pipeline.ts`;
- `hooks/usePipelineActions.ts`;
- `hooks/useUpdateChecker.ts`。

#### 无重复代码要求

| 重复类型 | 处理方式 |
|---|---|
| 相同按钮、输入框、弹窗 | 抽到 `components/base/` |
| 相同岗位卡片结构 | 抽到 `JobCard` |
| 相同来源展示逻辑 | 抽到 `SourceBadge` 和 `sourceConfig` |
| 相同分数展示 | 抽到 `ScoreRing` / `ScoreBar` |
| 相同接口错误处理 | 放到 `request.ts` |
| 相同日期、薪资、分数格式化 | 放到 `utils/format.ts` |
| 相同管线状态判断 | 放到 `pipelineStatusConfig` |
| 相同 Mock / API 切换逻辑 | 放到 `dataModeAdapter` |

代码评审硬性规则：

- 页面文件超过 300 行，需要拆分组件或 Hook；
- 同一段逻辑出现第 2 次时，必须抽象；
- 禁止在多个页面手写同一组管线状态、来源枚举、颜色映射；
- 禁止在组件中硬编码后端 URL；
- 禁止页面直接读写 Token；
- 禁止为了 Demo 临时复制一份类似组件。

#### 类型与枚举要求

关键枚举集中维护：

```ts
export type DataMode = "mock" | "api" | "hybrid";
export type SourceSite =
  | "boss"
  | "liepin"
  | "lagou"
  | "linkedin"
  | "company_site"
  | "referral"
  | "manual"
  | "mock_seed";

export type PipelineStatus =
  | "interested"
  | "tailored"
  | "applied"
  | "hr_contact"
  | "interviewing"
  | "offer"
  | "rejected"
  | "abandoned";
```

要求：

- 枚举值和后端 Schema 保持一致；
- 展示文案、颜色、排序、图标通过 config 映射；
- 页面不直接判断中文文案；
- API 入参和返回值必须有明确类型；
- Mock JSON 需要能通过类型校验或最少通过字段完整性检查。

#### 可测试与可验收要求

前端至少保留以下本地验收方式：

- `npm run lint`：检查代码风格和潜在问题；
- `npm run typecheck`：检查 TypeScript 类型；
- `npm run build`：验证生产构建；
- `npm run preview`：验证构建后页面；
- Demo 控制台支持：
  - 切换 `mock` / `api` / `hybrid`;
  - 重置 Demo 数据；
  - 模拟 Token 过期；
  - 模拟 API 失败；
  - 模拟发现新版本；
  - 模拟更新失败。

### 11.3 架构 Review 与前端边界 Case 清单

本轮 Review 后，架构需要重点防住以下边界场景。每个场景都要有明确兜底 UI，避免比赛现场出现空白页、死循环或数据错乱。

#### 认证与用户边界

| Case | 预期处理 |
|---|---|
| 未登录访问主工作区 | 跳转登录页，并记录原目标路由 |
| 登录成功后无恢复路由 | 默认进入首页驾驶舱 |
| Token 过期 | 尝试 refresh；失败则提示重新登录 |
| 注册用户名重复 | 显示明确错误，不清空已填写表单 |
| 演示账号登录失败 | 显示“加载 Demo 账号失败”，允许改用本地 Mock 模式 |
| 用户退出登录 | 清理 Token 和用户态，保留公开 Mock 数据 |

#### 首次引导与身份边界

| Case | 预期处理 |
|---|---|
| 用户首次登录没有 persona | 进入 Onboarding 或显示创建身份行动卡 |
| 用户跳过 Onboarding | 首页显示“继续完善求职身份”，同时展示全局热度 |
| persona 切换中重复点击 | 按钮进入 loading，禁止并发切换 |
| persona 被归档后仍在 URL 中 | 自动切回默认身份并提示 |
| 当前身份无岗位数据 | 显示空状态和“查看全局机会”入口 |
| 多身份数据串台 | 所有请求必须携带 `persona_id`，Store 按身份隔离缓存 |

#### 机会热度广场边界

| Case | 预期处理 |
|---|---|
| 无用户画像 | 展示全局热度，不展示“我的倾向”结论 |
| 我的倾向数据为空 | 显示“先补充素材或浏览岗位”引导 |
| 点击热度项后岗位为空 | 岗位雷达展示空状态，并保留筛选条件 |
| 热度数据缺少增长值 | 只展示热度，不展示增长趋势 |
| 热度标签过多 | 最多展示 3-5 个，其余折叠 |

#### 岗位雷达与来源标识边界

| Case | 预期处理 |
|---|---|
| 岗位没有 `source_url` | `SourceBadge` 仍展示来源，隐藏“查看原始链接” |
| 来源站点未知 | 显示“未知来源”，使用默认灰色 Badge |
| 来源为 `mock_seed` | 明确展示“Demo 数据”，避免误解为真实采集 |
| 来源可信度为 low | 展示低可信提示，不进入默认强推荐 |
| 岗位匹配分缺失 | 展示“待分析”，不显示错误分数 |
| 岗位列表超过 100 条 | 使用分页或虚拟滚动 |
| 筛选条件组合后无结果 | 展示清空筛选按钮 |
| 重复点击加入管线 | 只保留一张管线卡，提示“已在管线中” |

#### 决策卡与招聘官视角边界

| Case | 预期处理 |
|---|---|
| 决策卡未生成 | 显示生成中 / 使用 Mock 决策入口 |
| 算法返回解释为空 | 展示兜底文案，并提示“缺少可解释证据” |
| 分项分数越界 | 前端归一化到 0-100，并记录异常 |
| 风险过多 | 默认展示 Top 3，其余折叠 |
| 招聘官视角数据缺失 | 决策卡仍可用，招聘官模块显示空状态 |
| 证据 ID 找不到素材 | 显示“证据已失效”，提供跳转素材库入口 |

#### 职业素材库与简历边界

| Case | 预期处理 |
|---|---|
| 素材库为空 | 显示 Demo 素材加载入口 |
| 上传简历失败 | 提供重试和加载样例简历 |
| 文件格式不支持 | 明确提示支持格式，不提交请求 |
| 文件过大 | 前端先拦截并提示 |
| 素材编辑未保存离开 | 弹出确认提示 |
| 简历版本实验数据不足 | 显示“样本不足，暂不判断最佳版本” |
| 简历版本被停用 | 不再作为默认推荐，但保留历史统计 |

#### 求职管线边界

| Case | 预期处理 |
|---|---|
| 非法状态流转 | 阻止操作，并提示可用下一步 |
| 移动端无法拖拽 | 使用“变更状态”操作菜单替代拖拽 |
| 拖拽失败 | 回滚到原列，显示失败提示 |
| 同一岗位重复加入 | 合并到已有卡片，不新增重复卡 |
| 管线卡片关联岗位被删除 | 显示岗位已失效，但保留用户备注 |
| Offer / rejected / abandoned 后再编辑 | 允许备注，不默认回流到活跃状态 |

#### 在线更新边界

| Case | 预期处理 |
|---|---|
| 版本检查接口失败 | 不打断页面，降低轮询频率并展示轻提示 |
| 发现新版本但用户点稍后 | 本轮会话内延迟提醒，避免频繁打扰 |
| 用户重复点击立即更新 | 按钮置灰，只创建一个更新任务 |
| 更新过程中后端重启 | 前端进入等待页，轮询健康检查 |
| 更新失败 | 保留当前版本，提供重试和返回当前页面 |
| 更新后路由不存在 | 回到首页，并提示“原页面已变更” |
| 更新后 persona 不存在 | 自动切换默认 persona |
| localStorage 恢复点损坏 | 忽略恢复点，进入首页 |

#### 全平台适配边界

| Case | 预期处理 |
|---|---|
| 手机端屏幕过窄 | 只保留核心行动按钮，复杂图表改为卡片摘要 |
| 平板端宽度中等 | 双栏布局，抽屉承载详情 |
| 大屏演示模式 | 提高字号和视觉冲击，隐藏复杂筛选 |
| 浏览器不支持 PWA 能力 | 退化为普通 Web，不影响主流程 |
| 低性能设备 | 降低粒子、阴影和复杂动画 |

#### Demo 数据与算法接入边界

| Case | 预期处理 |
|---|---|
| Mock JSON 字段缺失 | adapter 补默认值，页面不崩溃 |
| API 返回空数组 | 显示空状态，而不是 loading 常驻 |
| API 返回未知字段 | 页面忽略未知字段 |
| 算法接口超时 | 显示最近一次缓存或 Mock 结果 |
| 三个算法接口交付时间不一致 | 每个模块独立降级，不阻塞全站 |
| `dataMode` 从 mock 切到 api | 清理旧请求状态，重新拉取当前身份数据 |

#### 架构 Review 结论

当前架构已覆盖 Web 演示主链路，但实现时要特别注意：

1. **不要把页面做成大而全的单文件**：否则后期接算法接口时会很难改；
2. **不要让 Mock 数据和 API 数据走两套页面逻辑**：必须通过 adapter 统一；
3. **不要把当前身份只做成 UI 选中态**：`persona_id` 必须贯穿接口、Store 和缓存；
4. **不要让更新机制影响主流程稳定性**：更新失败必须能留在当前版本；
5. **不要为了视觉牺牲移动端可用性**：复杂交互必须有移动端替代方案；
6. **不要忽略空状态**：空数据、失败、未登录、未生成、无权限都要有明确 UI。

### 11.4 开发、Git 与远端部署流程建议

本项目推荐采用以下开发方式：

```text
本地开发 → Git 提交 → 远端演示机手动部署 → 页面检测版本变化并提示更新
```

这是当前比赛阶段最稳妥的方式，原因是：

- 本地开发速度最快，适合前端高频改 UI；
- Git 能提供版本记录、回滚能力和协作边界；
- 远端演示机只负责运行稳定代码，环境更可控；
- 页面更新提示可以和部署流程自然衔接。

#### 本地开发环境

本地开发是唯一主战场。

推荐方式：

- 前端：Vite dev server；
- 后端：FastAPI `--reload`；
- 数据模式优先使用 `mock`；
- UI、交互和组件联调尽量在本地完成后再推送。

推荐环境变量：

```text
.env.local
VITE_APP_ENV=local
VITE_DATA_MODE=mock
VITE_VERSION_POLLING=false
```

本地阶段规则：

- 默认不展示“发现新版本”弹窗；
- 使用 HMR / reload 快速验证页面；
- 算法接口未就绪时，全部走 Mock 数据；
- 只在本地验证通过后再提交 Git。

#### Git 作为唯一代码真源

Git 负责：

- 记录每次可追溯改动；
- 作为远端演示机的唯一代码来源；
- 支持比赛期间快速回滚；
- 给前端、后端、算法同学一个统一交付边界。

推荐最小分支策略：

```text
main       当前稳定可演示版本
feat/*     单个功能开发分支
hotfix/*   演示前紧急修复分支
```

推荐规则：

- `main` 只保留可演示版本；
- 完成一个完整模块后再合入 `main`；
- 演示前打 tag，例如 `demo-2026-06-03-home`；
- 远端演示机默认部署 `main` 或指定 demo tag；
- 禁止在远端修代码但不回写 Git。

#### 远端演示环境职责

远端演示机只负责：

- 拉取指定 Git 分支或 tag；
- 安装依赖；
- 构建前端；
- 启动 / 重启前后端服务；
- 提供健康检查和版本接口。

远端演示机不负责：

- 日常写代码；
- 临时试验性修改；
- 保存唯一源码副本。

#### 推荐发布流程

```text
1. 本地开发完成
2. 本地执行 lint / typecheck / build
3. git commit
4. git push
5. 远端执行 scripts/deploy-demo.sh
6. 部署脚本拉取最新代码并构建
7. 后端刷新版本信息
8. 前端页面检测到新版本并提示更新
```

推荐部署脚本职责：

- `git fetch --all`
- `git checkout main` 或指定 tag
- `git pull`
- 安装前后端依赖
- 构建前端产物
- 重启服务
- 校验 `/api/system/health`
- 生成或刷新 `version.json`

#### 推荐演示环境变量

```text
.env.demo
VITE_APP_ENV=demo
VITE_DATA_MODE=hybrid
VITE_VERSION_POLLING=true
```

说明：

- `hybrid`：优先 API，失败时降级 Mock；
- 演示环境必须保留版本轮询；
- 演示环境需要保留更新失败兜底页面。

#### 网页更新操作建议

开发期和演示期的更新机制需要区分。

开发期：

```text
改本地代码 → Vite HMR → 立即查看效果
```

此阶段不依赖“发现新版本”能力。

演示期：

```text
远端部署完成
  ↓
前端轮询 version.json 或 /api/system/version
  ↓
发现版本变化
  ↓
页面右上角提示“发现新版本”
  ↓
用户点击“立即更新”
  ↓
保存恢复点 → 进入等待页 → 健康检查通过后刷新 → 恢复到原页面
```

要求：

- `version.json` 必须带 `version / git_commit / build_time / message`；
- `version.json` 必须禁缓存；
- 页面更新只在演示环境启用强提示；
- 更新按钮必须防重复点击；
- 更新失败后必须保留当前可用版本。

#### 不推荐的方式

以下方式不建议作为主流程：

- 直接在远端演示机改代码；
- 本地改完后手工复制零散文件到远端；
- 不经过 Git 直接同步 `dist` 当作长期方案；
- 每次 push 都自动发布到演示环境。

原因：

- 本地和远端容易不一致；
- 回滚困难；
- 责任边界不清；
- 比赛现场更容易把可演示环境改坏。

### 11.5 一键启动 / 一键升级 / 一键迁移约束

后续所有运行操作必须满足：

```text
启动一键
升级一键
迁移一键
```

目标：

- 降低比赛现场操作复杂度；
- 避免手工输入长命令造成失误；
- 保证不同同学在本地和远端执行的是同一套流程；
- 保证启动、升级、迁移都可记录日志、可回滚、可健康检查。

#### 统一操作入口

推荐在仓库根目录提供统一入口，优先使用：

```text
Makefile
```

推荐保留的命令：

```bash
make init       # 一键初始化依赖与环境
make dev        # 一键启动本地开发环境
make start      # 一键启动演示环境
make migrate    # 一键执行数据库迁移
make upgrade    # 一键升级当前环境
make rollback   # 一键回滚到上一稳定版本
make health     # 一键检查服务健康状态
```

如果不使用 `Makefile`，则需要提供一个等价统一入口，例如：

```bash
./scripts/jobhunter init|dev|start|migrate|upgrade|rollback|health
```

但无论使用哪种形式，项目中只能保留**一套主入口语义**，不能让不同同学分别记忆不同命令。

#### 一键启动要求

`make dev` 或等价命令至少完成：

- 检查 Node / Python / Docker / pnpm 或 npm 是否可用；
- 自动复制 `.env.local.example` 为 `.env.local`，若本地文件不存在；
- 安装前后端依赖；
- 初始化本地数据库；
- 自动执行一次迁移；
- 按需注入 Demo Seed 数据；
- 启动前端 dev server 和后端 reload 服务；
- 输出本地访问地址、日志位置和常用调试说明。

`make start` 或演示环境启动命令至少完成：

- 校验 `.env.demo`；
- 检查必要目录、数据库、静态资源是否存在；
- 自动执行迁移；
- 启动或重启前后端服务；
- 输出版本号、commit、访问地址和健康检查结果。

要求：

- 启动过程必须无交互或尽量少交互；
- 启动失败必须有明确错误原因；
- 启动完成后必须自动做健康检查；
- 启动命令重复执行时应尽量幂等。

#### 一键升级要求

`make upgrade` 或等价命令至少完成：

```text
拉取稳定代码
→ 安装或更新依赖
→ 执行数据库迁移
→ 构建前端
→ 重启服务
→ 刷新 version.json
→ 健康检查
→ 成功后记录新版本
```

升级流程中必须包含：

- `git fetch --all`
- 切换到目标分支或 tag
- 备份当前版本标识与数据库文件
- 执行迁移
- 构建前端静态资源
- 重启服务
- 调用 `/api/system/health` 验证服务可用
- 记录升级日志

要求：

- 升级命令不可依赖人工逐步敲命令；
- 升级失败时必须中止，并保留失败日志；
- 若迁移或健康检查失败，应自动触发回滚或至少给出明确回滚指令；
- 页面更新提示触发的后端更新，本质上也应调用这一套统一升级入口。

#### 一键迁移要求

`make migrate` 或等价命令至少完成：

- 自动执行数据库 schema migration；
- 迁移前备份 SQLite 数据文件或核心表；
- 输出当前版本、目标版本、执行结果；
- 失败时返回非 0 退出码；
- 支持重复执行而不破坏数据。

推荐方式：

- FastAPI 后端使用 `Alembic` 管理数据库版本；
- 迁移脚本统一放在 `backend/migrations/`；
- 所有表结构变化必须通过 migration 管理，禁止手工改线上 SQLite 表结构。

推荐迁移命令示意：

```bash
alembic upgrade head
```

#### 一键回滚要求

虽然用户当前重点是启动、升级、迁移，但比赛环境必须同时准备回滚能力。

`make rollback` 或等价命令至少完成：

- 切回上一稳定 tag 或记录中的上一版本；
- 恢复上一次数据库备份（如本次升级涉及迁移）；
- 重启服务；
- 刷新版本信息；
- 做健康检查。

#### 日志与可观测性要求

所有一键命令都应：

- 输出统一前缀日志，例如 `[jobhunter]`；
- 将日志写入固定目录，例如 `logs/ops/`；
- 结束时明确返回成功 / 失败；
- 失败时打印下一步建议，而不是静默退出。

建议日志文件：

```text
logs/ops/init.log
logs/ops/start.log
logs/ops/migrate.log
logs/ops/upgrade.log
logs/ops/rollback.log
```

#### 比赛现场操作约束

比赛现场只允许记忆以下少量命令：

```bash
make dev
make start
make upgrade
make migrate
make rollback
make health
```

不允许现场再临时执行：

- 手工 `git pull` 后逐条重启；
- 手工进入多个目录分别安装依赖；
- 手工修改数据库结构；
- 手工复制 dist 覆盖旧版本。

---

## 十二、团队分工

### 当前阶段分工原则

当前阶段先不要求算法同学交付真实算法。  
前端先把功能、交互、视觉和状态流转做稳定，算法同学后续只需要按文档中的 Schema 提供数据即可。

### 前端同学

负责内容：

- 注册 / 登录页面；
- 登录态保持与路由守卫；
- 首页求职作战中枢视觉；
- 多求职身份切换；
- 今日求职冲刺计划；
- 机会热度广场；
- 职业素材库 Career Vault；
- 求职画像页；
- 岗位雷达页；
- 岗位决策卡；
- 招聘官视角；
- 求职管线 Kanban；
- 简历工作室；
- 简历版本实验；
- 面试作战卡；
- 投递反馈复盘；
- 页面视觉设计；
- Demo 动线；
- 卡片、图表、进度动画；
- 更新提示弹窗；
- 点击更新后的重启等待与状态恢复；
- 前端 Mock 数据组织；
- 和后端 API / Mock API 联调。

### 算法同学 1：简历画像数据提供

后续交付：

- `resume-profile.json` 对应的数据；
- `career-personas.json` 中身份画像相关数据，可选；
- 能力雷达图数据；
- 技能、项目、风险、优势字段；
- 职业素材库自动抽取结果，可选。

### 算法同学 2：岗位决策卡数据提供

后续交付：

- `opportunity-market.json` 中个性化倾向推荐的数据，可选；
- `job-decision-cards.json` 对应的数据；
- `recruiter-lens.json` 对应的数据；
- 匹配度、岗位质量、成长潜力、风险、投递成本；
- 命中理由、技能缺口、风险提示；
- 投递建议与下一步行动。

### 算法同学 3：求职行动数据提供

后续交付：

- `tailor-output.json` 对应的数据；
- `resume-ab-lab.json` 对应的数据；
- `sprint-plan.json` 对应的数据；
- 修改前后对比；
- 证据引用；
- 面试作战卡；
- 7 天准备计划；
- 反馈复盘建议。

### 后端能力，最小即可

如果后端时间有限，只需要提供：

- 用户注册登录；
- Mock 数据读取接口；
- 求职身份保存与切换；
- 管线状态保存；
- 简历版本实验数据保存；
- 反馈记录保存；
- 版本检测与健康检查；
- 更新触发接口。

---

## 十三、Demo 演示脚本

### 13.1 5 分钟演示流程

#### 第 1 分钟：痛点与入口

打开首页：

> 找工作最大的问题不是岗位少，而是不知道哪些岗位值得投，也不知道简历该怎么改。

点击“启动求职作战中枢”。

如果需要展示产品完整度，可以先快速展示：

- 注册新用户；
- 登录进入个人求职驾驶舱；
- 使用演示账号一键进入。
- 切换当前求职身份为“AI 应用工程师”。

#### 第 2 分钟：身份、机会热度广场、职业素材库与画像

先进入机会热度广场，展示首次进入时的全局热度，以及登录后当前用户倾向高的方向。

展示：

- 全局热门岗位方向；
- 用户倾向高的方向；
- 热门技能和城市；
- 点击“AI 应用工程师”进入岗位雷达。

再进入职业素材库，展示用户不是只有一份简历，而是有项目、技能、成果和 STAR 故事。

展示：

- 项目证据；
- 技能证据；
- 量化成果；
- 技能雷达；
- 项目亮点；
- 求职方向；
- 简历短板。

#### 第 3 分钟：岗位雷达与决策卡

进入岗位雷达页。

展示：

- 扫描岗位总数；
- 强推荐岗位数量；
- Top 5 岗位卡片；
- 每个岗位的匹配分、岗位质量、成长潜力、风险。

点击最高优先级岗位，进入岗位决策卡。

展示：

- 是否值得投；
- 投递优先级；
- 分项得分；
- 风险提示；
- 下一步行动。
- 招聘官视角：第一眼印象、简历疑点、可能追问。

#### 第 4 分钟：求职管线

展示：

- 将岗位加入管线；
- 拖拽到“已投递”；
- 设置“3 天后跟进 HR”；
- 添加备注；
- 显示下一步任务。

#### 第 5 分钟：求职行动

点击“生成定制简历”和“生成面试作战卡”。

展示：

- 简历修改前后对比；
- 证据引用；
- JD 关键词高亮；
- 简历版本实验：AI 应用强化版面试率更高；
- 面试题；
- 7 天准备计划。

最后进入反馈复盘页，标记某岗位“收到面试”，并在首页求职冲刺计划中看到下一步任务。

收尾：

> JobHunter 不只是推荐岗位，而是把找工作变成一个可解释、可追踪、可复盘的求职作战中枢。

### 13.2 更新机制演示，可选

如果现场时间允许，可以补充 20 秒更新机制展示：

```text
页面右上角出现提示：发现新版本
  │
  ▼
点击「立即更新」
  │
  ▼
页面展示：正在同步最新代码 / 正在重启服务 / 正在恢复驾驶舱
  │
  ▼
刷新后回到原来的岗位决策卡页面
```

这个点可以体现系统不是一次性 Demo，而是一个可持续迭代的 Web 产品。

---

## 十四、竞赛亮点包装

### 14.1 创新性

- 求职数字分身；
- 机会热度广场，首次展示全局热度，登录后展示用户倾向机会；
- 多求职身份，支持用户并行探索不同求职方向；
- 岗位决策卡，不只给匹配分，还告诉用户是否值得投；
- 招聘官视角，让用户看到 HR / 面试官会如何看自己；
- 求职管线 Kanban，把岗位推荐变成过程管理；
- 职业素材库，所有生成建议都有真实证据来源；
- 简历版本实验，用投递反馈反向优化简历版本；
- 求职冲刺计划，把管线和反馈转成今日行动；
- 投递反馈闭环，从一次性推荐升级为可学习系统；
- 简历生成带证据引用，降低 AI 编造风险；
- Web 驾驶舱式演示，比聊天机器人更适合比赛现场。
- 用户体系完整，不是单用户脚本；
- 在线更新提示，体现产品工程化能力。

### 14.2 潜力

- 可以扩展成企业内推助手；
- 可以接入校园招聘；
- 可以服务内部转岗；
- 可以做成求职 SaaS；
- 可以连接职业规划、培训推荐、面试陪练。
- 可以扩展浏览器插件和自动填表；
- 可以根据反馈训练个性化求职策略。

### 14.3 美观

- 暗色科技风；
- 雷达图、热力图、卡片流；
- Kanban 拖拽；
- 进度动画；
- 简历 diff；
- 岗位决策解释视觉化；
- 投递反馈数据看板。

### 14.4 可落地

- 不依赖复杂 Agent 框架；
- 静态数据集保证演示稳定；
- 前端先用 Mock 数据稳定 Demo，后续替换算法数据；
- 三个算法数据契约边界清晰；
- 前后端接口简单；
- 一台机器即可部署。
- 支持前后端更新提示与重启续连，便于比赛期间快速迭代。

---

## 十五、风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| 简历解析不稳定 | 影响第一步体验 | 准备 Markdown 样例简历兜底 |
| LLM 调用慢 | 影响现场节奏 | 结果缓存 + 进度动画 + 限制 Top N |
| 岗位数据不足 | Demo 不够饱满 | 使用静态岗位数据集 |
| 决策解释空泛 | 说服力不足 | 每条解释绑定技能或项目证据 |
| 简历生成像编造 | 用户不信任 | 强制证据引用，无证据只作为建议 |
| 算法未及时交付 | 影响联调 | 前端先使用 Mock JSON，算法后续按 Schema 替换 |
| 功能太多做不完 | 影响交付 | P0 只做登录、首页、身份切换、热度广场、岗位雷达、决策卡、管线 |
| 登录流程影响演示速度 | 现场节奏变慢 | 准备演示账号和一键进入按钮 |
| Token 过期导致页面跳转 | 影响连续演示 | Demo 环境延长 refresh_token 有效期 |
| 更新重启失败 | 影响现场稳定 | 更新前保留当前版本，失败后回滚或返回当前页面 |
| 重启后状态丢失 | 用户体验割裂 | localStorage 保存恢复点，服务恢复后重新拉取用户数据 |
| 前端时间不足 | 影响观感 | 优先做 8 个核心页面：登录、首页、身份切换、热度广场、素材库、岗位雷达、决策卡、管线 |
| 算法接口不统一 | 联调成本高 | 统一 JSON Schema，先 Mock 后替换真实算法数据 |

---

## 十六、开发里程碑

### Day 1：确定骨架

- 前端原型；
- 页面路由设计；
- Mock 数据格式；
- API / Mock API 接口定义；
- 三个算法数据 Schema；
- 用户表、Token 方案、路由守卫方案；
- 系统版本接口和更新提示方案。

### Day 2-3：前端核心页面

- 登录 / 注册页；
- 首页驾驶舱；
- 多求职身份；
- 机会热度广场；
- 职业素材库；
- 求职画像页；
- 岗位雷达页；
- 岗位决策卡；
- 全部先接 Mock 数据。

### Day 4-5：前端交互闭环

- 注册 / 登录 / 退出；
- 上传 / 加载样例简历；
- 职业素材编辑；
- 身份切换后刷新热度广场和岗位雷达；
- 岗位加入管线；
- Kanban 状态拖拽；
- 简历工作室；
- 面试作战卡；
- 投递反馈记录；
- 版本检查接口联调；
- 点击更新后的等待页和健康检查联调。

### Day 6-7：视觉打磨

- 首页视觉；
- 求职 Sprint 视觉；
- 身份切换组件；
- 热度广场视觉；
- 岗位卡片；
- 决策卡视觉；
- Kanban 交互；
- 图表；
- 动画；
- 文案。

### Day 8：演示排练

- 固化 Demo 数据；
- 固化 Demo 账号；
- 固化 Demo 求职身份；
- 固化 Mock 算法结果；
- 缓存关键结果；
- 验证更新失败兜底；
- 准备 PPT；
- 录屏备份。

---

## 十七、最小可交付版本

如果时间紧，最小版本只保留这 8 个页面：

1. 登录 / 注册页；
2. 首页；
3. 多求职身份；
4. 机会热度广场；
5. 职业素材库；
6. 岗位雷达页；
7. 岗位决策卡；
8. 求职管线 Kanban。

最小数据能力只保留：

1. Mock 用户；
2. Mock 求职身份；
3. Mock 机会热度；
4. Mock 职业素材；
5. Mock 岗位列表；
6. Mock 岗位决策卡；
7. Mock 招聘官视角；
8. Mock 管线状态。

简历工作室、招聘官视角、简历版本实验、面试作战卡、反馈复盘可以先做成弹窗或抽屉，不一定要做完整页面。

在线更新能力的最小版本：

1. `/api/system/version` 返回版本；
2. 前端检测版本变化后提示“发现新版本”；
3. 用户点击后刷新页面；
4. 如果后端重启，前端显示等待并轮询 `/api/system/health`。

---

## 十八、结论

本次黑马大赛版本应从原来的 Hermes / Telegram Demo，调整为：

```text
Web 求职作战中枢 + 用户体系 + 多求职身份 + 机会热度广场 + 招聘官视角 + 简历版本实验 + 求职管线 + Mock 数据兜底 + 在线更新续连
```

这样更符合当前团队配置：

- 当前阶段前端可以独立推进，不被算法进度阻塞；
- 3 名算法同学后续按 Schema 提供数据即可；
- 1 名前端同学可以集中打造功能、交互和观感；
- Web 演示比聊天机器人更适合现场；
- 不使用 Hermes，系统更轻、更稳、更容易控场；
- 有注册登录和个人数据隔离，更像真实产品；
- 有多求职身份、机会热度广场、招聘官视角、简历版本实验和求职管线，比普通 AI 简历工具更有竞争力；
- 有更新提示和重启续连，适合比赛期间快速迭代；
- 创新点、潜力、美观度和可落地性都更容易讲清楚。
