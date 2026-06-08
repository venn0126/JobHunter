# 黑马大赛 JobHunter 算法接口开发文档

> 面向算法同学与后端联调用。
> 当前原则：**算法只作为数据与结构化结果提供方；登录态、业务状态、缓存、降级、持久化、前端 API 适配全部收口到 JobHunter 后台。**

---

## 1. 接入目标

算法接入服务当前后台 MVP，而不是让算法服务接管业务流程。

算法侧只需要提供：

- 原始岗位数据；
- 简历画像结果；
- 岗位决策结果；
- 招聘官视角结果；
- 简历定制建议；
- 面试作战卡建议；
- 求职 Sprint / 反馈复盘建议。

后台负责：

- 用户、登录、Persona、权限；
- PostgreSQL 持久化；
- Redis 缓存与任务状态；
- 岗位去重、清洗、分页、筛选；
- 算法结果校验、转换、缓存、降级；
- 对前端暴露稳定 `/api/*` 接口；
- Mock / 最近成功缓存 / 真实算法结果的统一适配。

前端只调用后台，不直接调用算法服务。

---

## 2. 推荐内网部署拓扑

```text
Frontend
  ↓
JobHunter Backend API
  ↓
Algorithm Adapter / Gateway
  ↓
Algorithm Service
```

推荐内网部署方式：

| 方式 | 适用场景 | 推荐度 |
|---|---|---:|
| 后端 + 算法服务同机不同端口 | 最快 MVP、单服务器演示 | 高 |
| Docker Compose 多服务 | 内网演示、依赖隔离 | 高 |
| 内网机器 IP / 域名 | 算法单独部署 | 中 |
| 静态 JSON / JSONL 文件 | 算法未服务化前 | 高 |
| CLI / Python 脚本 | 临时联调 | 中 |
| 共享数据库 | 不建议，边界容易混乱 | 低 |

后台通过环境变量接入算法：

```env
ALGORITHM_BASE_URL=http://127.0.0.1:9000
ALGORITHM_TIMEOUT_SECONDS=15
ALGORITHM_MODE=hybrid
ALGORITHM_VERSION=algo_v1
```

---

## 3. 接入边界

### 3.1 算法不要做的事

算法服务不要：

- 处理登录态；
- 校验用户 Token；
- 直接读写 JobHunter 业务库；
- 直接写管线、反馈、简历版本等业务状态；
- 返回前端组件结构；
- 控制页面跳转；
- 直接给前端提供接口；
- 编造职业素材中不存在的项目、指标、证书；
- 把 Persona A 的结果返回给 Persona B；
- 返回系统提示词、模型内部日志或原始异常堆栈。

### 3.2 算法应该做的事

算法服务应该：

- 接收后端整理后的上下文；
- 输出稳定 JSON；
- 明确算法名称和版本；
- 给出可解释原因；
- 引用后端提供的 `evidence_id`；
- 对不确定内容放入 `warnings`；
- 失败时返回明确错误码；
- 保证字段只增不删，枚举稳定。

---

## 4. 最小 MVP 接入顺序

### 第一阶段：岗位原始数据提供

目标：让真实岗位进入系统。

算法侧交付：

- JSONL 文件；
- 或 HTTP 批量接口；
- 或定时生成文件。

后台负责：

- 写入 `job_source_records`；
- 去重；
- 清洗到 `jobs`；
- 继续对前端暴露现有 `/api/jobs`。

### 第二阶段：岗位决策与招聘官视角

目标：让岗位详情页产生真实智能分析。

优先接：

```text
job_decision
recruiter_lens
```

对应后台现有接口：

```text
GET /api/jobs/{job_id}/decision
GET /api/jobs/{job_id}/recruiter-lens
GET /api/decisions
```

### 第三阶段：简历定制与面试作战卡

优先接：

```text
tailor_resume
interview_card
```

对应后台现有接口：

```text
POST /api/tailor/run
POST /api/interview/start
GET  /api/interview/cards?job_id={job_id}
```

### 第四阶段：简历画像、Sprint、反馈复盘

后续接：

```text
resume_profile
sprint_plan
feedback_review
```

这些可以晚于岗位决策，因为当前演示已经有 Mock / 后台兜底。

---

## 5. 算法服务 HTTP 接口约定

推荐算法服务提供以下接口：

```text
GET  /algorithm/health
POST /algorithm/job-source-records
POST /algorithm/resume-profile
POST /algorithm/job-decision
POST /algorithm/recruiter-lens
POST /algorithm/tailor-resume
POST /algorithm/interview-card
POST /algorithm/sprint-plan
POST /algorithm/feedback-review
```

如果算法同学暂时不能提供 HTTP 服务，可以先提供：

- `data/algorithm/job-source-records.jsonl`
- `data/algorithm/job-decision.sample.json`
- `data/algorithm/recruiter-lens.sample.json`
- Python 函数；
- CLI 脚本。

后台会通过 adapter 适配。

### 5.1 内网调用安全与 HTTP 约束

MVP 内网演示阶段不引入复杂权限系统，但后端调用算法服务仍建议使用轻量服务间鉴权。

推荐请求头：

```http
X-Request-ID: req_20260608_001
X-Algorithm-Token: ${ALGORITHM_INTERNAL_TOKEN}
Content-Type: application/json
```

要求：

- `ALGORITHM_INTERNAL_TOKEN` 只在后端和算法服务之间使用，不能暴露给前端；
- 算法服务不接收浏览器跨域调用，不配置面向公网的 CORS；
- 算法服务所有接口默认只监听内网地址或本机地址；
- 单次请求体大小需要有限制，超大简历或超大岗位批次由后台切分后再调用；
- 后台设置统一超时，算法服务不要无限阻塞；
- 业务错误优先返回 `success=false` 的 JSON；服务进程异常可以返回 5xx，但不得返回 HTML 错误页；
- 后台会兼容 HTTP 4xx / 5xx，但算法侧仍应尽量保持统一 JSON 响应，便于记录日志和回退。

---

## 6. 健康检查接口

### `GET /algorithm/health`

响应：

```json
{
  "success": true,
  "code": "OK",
  "message": "ok",
  "data": {
    "service": "jobhunter-algorithm",
    "version": "algo_v1",
    "status": "ok",
    "available_algorithms": [
      "job_decision",
      "recruiter_lens"
    ],
    "updated_at": "2026-06-08T10:00:00+08:00"
  }
}
```

要求：

- 该接口不能依赖大模型实时调用；
- 必须快速返回；
- 后台用它判断算法服务是否可接入。

---

## 7. 统一请求结构

后端调用算法服务时统一使用以下请求壳。

```json
{
  "request_id": "req_20260608_001",
  "task_id": "task_job_decision_job_1001",
  "algorithm": "job_decision",
  "version": "algo_decision_v1",
  "mode": "real",
  "user_context": {
    "user_id": "demo_user",
    "locale": "zh-CN"
  },
  "persona_context": {
    "persona_id": "persona_ai_app",
    "name": "AI 应用工程师",
    "target_roles": ["AI 应用工程师", "LLM 工程师"],
    "core_skills": ["Python", "LLM", "RAG"],
    "preferred_cities": ["北京", "上海", "杭州"]
  },
  "resume_context": {
    "resume_id": "resume_ai_app_v2",
    "raw_text": "简历文本或已清洗文本",
    "profile": {}
  },
  "job_context": {
    "job_id": "job_1001",
    "title": "AI 应用工程师",
    "company": "某科技公司",
    "city": "北京",
    "jd": "岗位 JD 文本",
    "requirements": ["Python", "RAG", "LLM"],
    "tags": ["Python", "RAG", "LLM"]
  },
  "vault_context": {
    "items": [
      {
        "id": "ev_rag_project",
        "type": "project",
        "title": "企业知识库 RAG 项目",
        "summary": "负责检索增强问答链路",
        "skills": ["Python", "RAG", "FastAPI"],
        "impact": "问答命中率提升 18%，平均响应延迟降低 32%。"
      }
    ]
  },
  "feedback_context": {
    "records": []
  },
  "runtime_options": {
    "timeout_ms": 15000,
    "max_items": 8,
    "enable_explanation": true,
    "enable_cache": true
  }
}
```

字段要求：

| 字段 | 要求 |
|---|---|
| `request_id` | 必填，后端生成，用于日志追踪 |
| `task_id` | 生成类任务必填，用于状态查询和缓存 |
| `algorithm` | 必填，固定枚举 |
| `version` | 必填，算法版本，影响缓存失效 |
| `mode` | `mock` / `real` / `hybrid` / `demo` |
| `user_context` | 后端注入，算法不解析 Token |
| `persona_context` | 求职方向相关算法必填 |
| `resume_context` | 简历相关算法必填 |
| `job_context` | 岗位相关算法必填 |
| `vault_context` | 证据引用相关算法必填 |
| `runtime_options` | 后端控制超时、数量和缓存策略 |

---

## 8. 统一响应结构

### 成功响应

```json
{
  "success": true,
  "code": "OK",
  "message": "ok",
  "request_id": "req_20260608_001",
  "task_id": "task_job_decision_job_1001",
  "algorithm": "job_decision",
  "version": "algo_decision_v1",
  "source": "real",
  "data": {},
  "warnings": [],
  "metrics": {
    "latency_ms": 1230,
    "token_input": 0,
    "token_output": 0
  }
}
```

### 失败响应

```json
{
  "success": false,
  "code": "ALGO_TIMEOUT",
  "message": "算法服务超时",
  "request_id": "req_20260608_001",
  "task_id": "task_job_decision_job_1001",
  "algorithm": "job_decision",
  "version": "algo_decision_v1",
  "source": "real",
  "data": null,
  "warnings": [
    {
      "code": "BACKEND_SHOULD_FALLBACK",
      "message": "建议后端回退最近成功缓存或 Mock"
    }
  ],
  "metrics": {
    "latency_ms": 15000
  }
}
```

### 错误码

| code | 说明 | 后端处理 |
|---|---|---|
| `OK` | 成功 | 写缓存并返回 |
| `ALGO_TIMEOUT` | 超时 | 回退最近成功缓存 / Mock |
| `ALGO_INVALID_INPUT` | 输入缺失或格式错误 | 记录日志，返回兜底 |
| `ALGO_EMPTY_RESULT` | 成功但无有效结果 | 使用兜底文案 / Mock |
| `ALGO_MODEL_ERROR` | 模型调用失败 | 回退缓存 / Mock |
| `ALGO_RATE_LIMITED` | 模型限流 | 回退缓存，稍后重试 |
| `ALGO_UNSUPPORTED_VERSION` | 版本不兼容 | 回退上一版本缓存 |

---

## 9. 岗位原始数据接口

### `POST /algorithm/job-source-records`

用途：算法 / 采集侧向后台提供原始岗位数据。

算法可以选择：

- 推送到后台；
- 或写 JSONL 文件，由后台导入；
- 或提供 HTTP 分页拉取。

### 单条岗位记录结构

```json
{
  "job_id": "35746c9cc9693a6e5b3f98a35db1ac0efaa536d3",
  "external_job_id": "34253",
  "title": "渠道销售专员",
  "normalized_title": "渠道销售专员",
  "company": "华为",
  "department": "辽宁政企数字政府系统部",
  "business_group": null,
  "source_id": "company:huawei:career",
  "source_name": "Huawei Careers",
  "source_type": "company_career",
  "fetch_method": "api_capture",
  "fetch_url": "https://career.huawei.com/...",
  "origin_url": "https://career.huawei.com/...",
  "apply_url": "https://career.huawei.com/...",
  "city": "中国/沈阳",
  "locations": ["中国/沈阳"],
  "country": "CN",
  "workplace_type": "unknown",
  "job_type": "社会招聘",
  "employment_type": null,
  "job_category": "销售族",
  "seniority": null,
  "education": "本科",
  "experience": "1年以上工作经验",
  "salary": null,
  "description": "岗位描述全文",
  "responsibilities": ["职责 1", "职责 2"],
  "requirements": ["要求 1", "要求 2"],
  "skills": [],
  "keywords": [],
  "language": "zh-cn",
  "publish_time": "2026-06-02T17:52:24.000+0800",
  "expire_time": "2026-12-31T00:00:00.000+0800",
  "status": "active",
  "confidence": 0.9,
  "dedupe_key": "696cb2c233b816b0e0d57534cb15659fe490ec9e",
  "embedding_text": null,
  "raw_payload": {},
  "raw_html": null,
  "raw_markdown": null,
  "batch_id": "batch_20260608_company_huawei",
  "crawled_at": "2026-06-08T10:00:00+08:00",
  "updated_at": "2026-06-08T10:00:00+08:00"
}
```

### 岗位数据要求

必填：

- `job_id`
- `external_job_id`
- `title`
- `company`
- `source_id`
- `source_name`
- `origin_url`
- `apply_url`
- `description`
- `dedupe_key`
- `status`
- `crawled_at`

稳定枚举：

| 字段 | 建议值 |
|---|---|
| `status` | `active` / `expired` / `closed` / `unknown` |
| `source_type` | `company_career` / `job_board` / `manual` / `unknown` |
| `workplace_type` | `onsite` / `remote` / `hybrid` / `unknown` |
| `language` | `zh-cn` / `en` / `unknown` |

后台负责：

- 去重；
- 城市归一化；
- 岗位方向归类；
- 前端岗位卡字段生成；
- 用户态匹配分和决策生成。

### 批量交付方式

MVP 阶段优先支持 JSONL 文件，其次支持 HTTP 批量接口。

JSONL 要求：

- 每行一条完整岗位 JSON；
- 文件名建议：`job-source-records.{source_id}.{yyyyMMddHHmmss}.jsonl`；
- 单文件建议不超过 5000 条；
- 同一批次使用相同 `batch_id`；
- 重复岗位必须保持相同 `dedupe_key`；
- 失败行由后台记录到导入报告，不阻塞整批可用数据入库。

HTTP 批量接口请求：

```json
{
  "batch_id": "batch_20260608_company_huawei",
  "source_id": "company:huawei:career",
  "records": []
}
```

HTTP 批量接口响应：

```json
{
  "success": true,
  "code": "OK",
  "message": "ok",
  "request_id": "req_20260608_001",
  "data": {
    "batch_id": "batch_20260608_company_huawei",
    "received_count": 100,
    "valid_count": 98,
    "invalid_count": 2,
    "duplicate_count": 12,
    "warnings": []
  }
}
```

导入边界：

- 算法侧只保证原始数据稳定、可追溯；
- 后台负责生成前端岗位 `id`、`match`、`priority`、`source` 展示字段；
- 后台负责把异常记录落到导入报告，不能因为少量脏数据导致整批失败；
- 如果 `origin_url` / `apply_url` 缺失，后台允许入 `job_source_records`，但不应进入可投递岗位列表。

---

## 10. 简历画像算法

### `POST /algorithm/resume-profile`

输出 `data` 结构：

```json
{
  "resume_id": "resume_ai_app_v2",
  "summary": "候选人具备后端服务和 RAG 项目经验，适合 AI 应用工程师方向。",
  "skills": [
    {
      "name": "Python",
      "level": 0.85,
      "evidence_ids": ["ev_rag_project"]
    }
  ],
  "strengths": [
    "RAG 项目有量化结果",
    "后端服务稳定性经验明确"
  ],
  "gaps": [
    {
      "name": "Kubernetes",
      "severity": "medium",
      "suggestion": "补充容器化部署或服务治理经历"
    }
  ],
  "evidence_index": [
    {
      "evidence_id": "ev_rag_project",
      "title": "企业知识库 RAG 项目",
      "matched_skills": ["RAG", "Python", "FastAPI"]
    }
  ]
}
```

要求：

- `skills.level` 范围为 `0-1`；
- `evidence_id` 必须来自后端传入的职业素材或简历片段；
- 不确定内容写入 `warnings`，不要伪造成事实。

---

## 11. 岗位决策算法

### `POST /algorithm/job-decision`

输出 `data` 结构：

```json
{
  "job_id": "job_1001",
  "decision": "strong_recommend",
  "priority": "P0",
  "overall_grade": "A",
  "match_score": 88,
  "scores": {
    "skill": 90,
    "experience": 84,
    "location": 80,
    "growth": 86
  },
  "hit_reasons": [
    {
      "title": "RAG 项目与岗位关键词匹配",
      "detail": "岗位强调 RAG / LLM 应用，候选人有企业知识库 RAG 项目。",
      "evidence_id": "ev_rag_project"
    }
  ],
  "gaps": [
    {
      "title": "Kubernetes 证据不足",
      "severity": "medium",
      "suggestion": "补充容器化部署经历或弱化为了解。",
      "evidence_id": null
    }
  ],
  "risks": [
    {
      "level": "medium",
      "title": "云原生经验表达不足",
      "suggestion": "准备服务部署、灰度发布、回滚方案相关回答。"
    }
  ],
  "next_actions": [
    {
      "title": "定制 AI 应用版简历",
      "target_path": "/resume?job=job_1001"
    }
  ]
}
```

枚举建议：

| 字段 | 值 |
|---|---|
| `decision` | `strong_recommend` / `recommend` / `watch` / `not_recommend` |
| `priority` | `P0` / `P1` / `P2` |
| `overall_grade` | `A+` / `A` / `B` / `C` |
| `severity` | `low` / `medium` / `high` |

要求：

- 所有分数范围为 `0-100`；
- 解释尽量引用 JD 原文、技能、项目或素材；
- 缺少证据时不要编造，返回可补充建议。

---

## 12. 招聘官视角算法

### `POST /algorithm/recruiter-lens`

输出 `data` 结构：

```json
{
  "job_id": "job_1001",
  "first_impression": "候选人 AI 应用和后端交付经历较匹配，但需要更清晰呈现模型服务部署经验。",
  "highlights": [
    "RAG 项目有量化结果",
    "后端稳定性优化经历完整"
  ],
  "concerns": [
    "Kubernetes / 云原生经验证据不足"
  ],
  "likely_questions": [
    "你们的 RAG 评估指标是如何设计的？",
    "如果向量检索召回不稳定，你会如何排查？"
  ],
  "improve_tips": [
    "把 RAG 项目写成问题、动作、结果三段式",
    "准备一个服务上线和回滚案例"
  ]
}
```

要求：

- 不输出攻击性、歧视性或与岗位无关评价；
- `concerns` 必须是可改进问题；
- `likely_questions` 至少 3 条。

---

## 13. 简历定制算法

### `POST /algorithm/tailor-resume`

输出 `data` 结构：

```json
{
  "job_id": "job_1001",
  "job_title": "AI 应用工程师",
  "company": "某科技公司",
  "keywords": ["RAG", "LLM", "Python", "FastAPI"],
  "summary": "建议突出 RAG 项目、后端服务稳定性和可量化业务结果。",
  "sections": [
    {
      "section": "项目经历",
      "before": "负责企业知识库问答项目开发。",
      "after": "负责企业知识库 RAG 服务的检索链路与后端接口建设，接入向量检索、重排和评估看板，使问答命中率提升 18%，平均响应延迟降低 32%。",
      "reason": "岗位强调 RAG 和工程落地能力。",
      "evidence_id": "ev_rag_project"
    }
  ]
}
```

要求：

- `before` / `after` 必须能用于前端 diff；
- 每条改写尽量绑定 `evidence_id`；
- 无证据时只输出“建议补充”，不能编造经历。

---

## 14. 面试作战卡算法

### `POST /algorithm/interview-card`

输出 `data` 结构：

```json
{
  "job_id": "job_1001",
  "company_brief": "该岗位关注 AI 应用落地、RAG 检索链路和后端服务稳定性。",
  "interview_focus": ["RAG 项目深挖", "后端服务设计", "模型效果评估"],
  "questions": [
    {
      "question": "请介绍你的 RAG 项目架构。",
      "answer_framework": [
        "业务问题",
        "检索链路",
        "评估指标",
        "上线效果"
      ],
      "evidence_ids": ["ev_rag_project"]
    }
  ],
  "reverse_questions": [
    "团队当前 RAG 应用的主要评估指标是什么？"
  ],
  "seven_day_plan": [
    {
      "day": 1,
      "title": "复盘 RAG 项目",
      "tasks": ["整理项目背景", "准备量化指标"]
    }
  ]
}
```

要求：

- 问题覆盖岗位技能、项目复盘、系统设计或业务理解；
- 回答框架短、可复制；
- 默认 7 天计划，后端可以按时间裁剪。

---

## 15. Sprint 任务算法

### `POST /algorithm/sprint-plan`

输出 `data` 结构：

```json
{
  "today": [
    {
      "id": "task_tailor_job_1001",
      "title": "定制 AI 应用工程师简历",
      "priority": "P0",
      "status": "todo",
      "target_path": "/resume?job=job_1001",
      "reason": "该岗位匹配度高，适合优先投递。"
    }
  ]
}
```

要求：

- `target_path` 必须是当前 Web 已存在页面；
- 不生成系统内无法完成的任务；
- `priority` 使用 `P0` / `P1` / `P2`。

---

## 16. 反馈复盘算法

### `POST /algorithm/feedback-review`

输出 `data` 结构：

```json
{
  "summary": {
    "applied_count": 10,
    "interview_count": 3,
    "interview_rate": 30,
    "main_blocker": "RAG 项目表达清晰，但云原生部署证据不足。"
  },
  "strategy_suggestions": [
    {
      "title": "提高 AI 应用岗位优先级",
      "reason": "该方向反馈明显好于通用后端岗位。",
      "target_path": "/jobs?direction=AI%20应用工程师"
    }
  ]
}
```

要求：

- 不基于单条失败反馈得出过度结论；
- 建议必须能落到简历版本、岗位筛选、素材补充或面试准备动作；
- 输出必须可按 `user_id`、`persona_id` 隔离缓存。

---

## 17. 缓存与降级要求

后台会按以下顺序处理：

```text
真实算法结果
  ↓ 失败
最近一次成功缓存
  ↓ 失败
Mock Seed 结果
  ↓ 失败
空状态 + 明确行动入口
```

算法侧需要保证：

- 成功结果可缓存；
- 失败时错误码明确；
- 同一输入和同一版本尽量输出稳定；
- 算法版本变化时必须更新 `version`。

推荐缓存 key 组成：

```text
algorithm
user_id
persona_id
target_id
algorithm_version
input_hash
```

---

## 18. 任务状态要求

生成类能力建议都返回 `task_id`。后台会写入任务状态。

任务状态枚举：

| status | 说明 |
|---|---|
| `pending` | 已创建，等待执行 |
| `running` | 执行中 |
| `succeeded` | 成功 |
| `failed` | 失败 |
| `fallback_cache` | 使用最近缓存 |
| `fallback_mock` | 使用 Mock 结果 |
| `cancelled` | 已取消 |

前端已有任务状态查询接口：

```text
GET /api/tasks/{task_id}
GET /api/tasks/{task_id}/events
```

算法服务不需要直接提供 SSE；如果后续支持流式进度，可以作为增强项。

---

## 19. 数据质量要求

算法输出必须满足：

- JSON 可解析；
- 字段名稳定；
- 枚举值稳定；
- 必填字段不缺失；
- 数组字段为空时返回 `[]`，不要返回 `null`；
- 分数字段范围明确；
- 文案长度适合页面展示；
- 证据 ID 可追溯；
- 不输出无法验证的经历；
- 不暴露提示词、系统内部日志、模型原始错误；
- 可新增字段，但不得删除已约定字段。

---

## 20. 联调交付清单

每个算法能力交付时至少提供：

- 算法名称；
- 算法版本；
- 接口路径；
- 请求样例；
- 成功响应样例；
- 失败响应样例；
- 错误码列表；
- 平均耗时和最大耗时；
- 是否依赖外部模型 Key；
- 是否可在公司内网无公网运行；
- 是否支持批量处理；
- 已知限制。

---

## 21. 推荐三名算法同学分工

| 角色 | 负责能力 | 优先交付 |
|---|---|---|
| 算法同学 1 | 岗位采集 / 岗位原始数据 / 岗位清洗建议 | `job_source_records` |
| 算法同学 2 | 岗位决策 / 招聘官视角 | `job_decision`、`recruiter_lens` |
| 算法同学 3 | 简历画像 / 简历定制 / 面试卡 / 反馈复盘 | `resume_profile`、`tailor_resume`、`interview_card` |

MVP 阶段建议先让算法同学 1 和 2 交付，优先保证“真实岗位 + 决策卡”演示效果。

---

## 22. 后端接入验收标准

后端接入某个算法能力后，需要满足：

- 算法服务不可用时页面不白屏；
- 算法超时时可以回退缓存或 Mock；
- 算法返回空结果时有兜底；
- 算法字段缺失时 adapter 能拦截；
- 算法版本变化后缓存能失效；
- 用户 / Persona 切换后不串缓存；
- 结果能被现有前端页面直接消费；
- 不需要前端直接改调用算法服务。

---

## 23. 当前后台 API 与算法能力映射

算法接口不直接暴露给前端。当前 P3 后台会继续对前端提供稳定 `/api/*` 接口，并在 Service / Adapter 层决定使用 Mock、缓存还是真实算法结果。

| 当前前端调用的后台接口 | 后台能力 | 推荐算法能力 | MVP 是否必须接 |
|---|---|---|---|
| `GET /api/jobs` | 岗位列表、筛选、分页 | `job_source_records` 导入后的清洗结果 | 是 |
| `GET /api/jobs/{job_id}` | 岗位详情 | `job_source_records` 导入后的清洗结果 | 是 |
| `GET /api/market` | 机会热度广场 | 岗位统计 / 方向归类建议 | 可后置 |
| `GET /api/market/directions/{direction_id}/jobs` | 方向岗位列表 | 岗位方向归类结果 | 可后置 |
| `GET /api/resumes/{resume_id}/profile` | 简历画像 | `resume_profile` | 可后置 |
| `GET /api/jobs/{job_id}/decision` | 岗位决策卡 | `job_decision` | 是 |
| `GET /api/jobs/{job_id}/recruiter-lens` | 招聘官视角 | `recruiter_lens` | 是 |
| `GET /api/decisions` | 决策卡列表 | `job_decision` 批量或后台聚合 | 可后置 |
| `POST /api/tailor/run` | 简历定制生成 | `tailor_resume` | 是 |
| `GET /api/resume-studio?job_id={job_id}` | 简历工作室读取 | `tailor_resume` 最近结果或 Mock | 是 |
| `POST /api/interview/start` | 面试作战卡生成 | `interview_card` | 是 |
| `GET /api/interview/cards?job_id={job_id}` | 面试作战卡读取 | `interview_card` 最近结果或 Mock | 是 |
| `GET /api/sprint` | 今日冲刺任务 | `sprint_plan` | 可后置 |
| `GET /api/feedback` | 反馈复盘 | `feedback_review` | 可后置 |
| `POST /api/feedback`、`PATCH /api/feedback/{id}` | 反馈录入 / 更新 | 不需要算法直接参与 | 否 |
| `GET /api/pipeline`、`POST /api/pipeline/cards`、`PATCH /api/pipeline/cards/{id}` | 求职管线状态 | 不需要算法直接参与 | 否 |
| `GET /api/tasks/{task_id}`、`GET /api/tasks/{task_id}/events` | 后台任务状态 | 不需要算法直接提供 | 否 |

### 23.1 当前后台生成类响应适配

当前 P3 后台生成类接口已经统一返回：

```json
{
  "success": true,
  "code": "OK",
  "message": "ok",
  "data": {
    "task_id": "task_job_decision_job_1001_xxx",
    "status": "succeeded",
    "source": "mock",
    "result": {},
    "cache": {
      "key": "jobhunter:cache:...",
      "status": "set",
      "ttl_seconds": 86400
    },
    "generation": {
      "scope": "job_decision",
      "target_id": "job_1001",
      "payload_hash": "xxx",
      "version": "mock_v1",
      "origin_source": "mock",
      "warnings": []
    }
  },
  "request_id": "req_xxx"
}
```

算法响应适配规则：

| 算法响应字段 | 后台生成类响应字段 | 说明 |
|---|---|---|
| `task_id` | `data.task_id` | 算法未返回时由后台生成 |
| `source` | `data.source` / `data.generation.origin_source` | `real`、`cache`、`fallback_cache`、`fallback_mock` 等 |
| `algorithm` | `data.generation.scope` | 与 `job_decision`、`recruiter_lens` 等枚举一致 |
| `version` | `data.generation.version` | 版本变化必须导致缓存失效 |
| `data` | `data.result` | 前端只消费后台 `result`，不直接消费算法原始壳 |
| `warnings` | `data.generation.warnings` | 后台可追加缓存、降级、字段修复等告警 |
| `metrics.latency_ms` | 后台日志 / 后续监控字段 | MVP 阶段可不返回给前端 |

要求：

- 后台 Adapter 必须校验算法 `data` 后再写入 `result`；
- 算法返回的额外字段可以保留到 `result`，但不能破坏前端当前已使用字段；
- 算法失败、超时、空结果时，后台仍返回现有 `GeneratedResponse` 结构，`source` 标记为 `fallback_cache` 或 `fallback_mock`；
- 算法版本号必须进入缓存 key，避免新旧结果混用；
- 用户、Persona、岗位、简历版本必须进入输入 hash 或缓存维度，避免串数据。

### 23.2 最小联调顺序

建议算法同学按以下顺序交付，后台按同顺序接入：

1. `GET /algorithm/health`：确认服务可连通；
2. `job_source_records`：先交 JSONL 或批量接口，让真实岗位能入库；
3. `job_decision`：支撑岗位详情页核心决策卡；
4. `recruiter_lens`：支撑招聘官视角；
5. `tailor_resume`：支撑简历工作室按岗位定制；
6. `interview_card`：支撑面试作战卡；
7. `resume_profile`、`sprint_plan`、`feedback_review`：后续增强。

每接入一个能力，都需要先用固定样例跑通：

```text
算法样例输入
  ↓
算法样例输出
  ↓
后台 Adapter 校验
  ↓
后台 /api/* 输出
  ↓
前端 api / hybrid 模式页面验证
```

### 23.3 当前前端 `result` 最小兼容字段

算法可以返回更丰富的原始结构，但后台 Adapter 最终写入 `data.result` 时必须兼容当前前端 Mock 类型。以下字段是当前 MVP 页面直接消费的最小结构。

#### `job_decision`

```json
{
  "job_id": "job_1001",
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
  "hit_reasons": ["岗位要求与当前求职身份核心技能高度重合。"],
  "gaps": [
    {
      "evidence_id": "ev_rag_project",
      "text": "简历中对向量检索指标描述不足。"
    }
  ],
  "risks": [
    {
      "type": "证据缺口",
      "evidence_id": "ev_missing_k8s",
      "level": "中",
      "text": "Kubernetes 经验没有有效证据支撑。",
      "fix_action": "补充部署或服务治理经历；没有则弱化该项。"
    }
  ],
  "next_actions": [
    {
      "label": "生成面试作战卡",
      "target_path": "/interview"
    }
  ]
}
```

适配要求：

- 算法内部可使用 `strong_recommend` 等英文枚举，后台需要映射成当前中文展示文案；
- `scores` 必须补齐当前 6 个分项，缺失时后台用兜底分或 Mock 分；
- `hit_reasons` 当前前端消费字符串数组，算法返回对象数组时后台需要压成可读文案；
- `risks.level` 当前使用 `低` / `中` / `高`，后台需要做枚举映射。

#### `tailor_resume`

```json
{
  "job_id": "job_1001",
  "job_title": "AI 应用工程师",
  "company": "星河智能",
  "keywords": ["Python", "LLM", "RAG"],
  "summary": {
    "target_role": "AI 应用工程师",
    "readiness": "2 条可直接使用，1 条建议补充",
    "ready_sections": 2,
    "needs_evidence": 1
  },
  "sections": [
    {
      "id": "sec_rag_project",
      "section": "项目经历",
      "before": "负责企业知识库问答项目开发。",
      "after": "负责企业知识库 RAG 服务的检索链路与后端接口建设。",
      "reason": "JD 强调 RAG 和后端服务经验。",
      "evidence": [
        {
          "source_type": "career_vault_project",
          "source_id": "ev_rag_project",
          "quote": "问答命中率提升 18%。"
        }
      ],
      "status": "可直接使用"
    }
  ]
}
```

适配要求：

- `sections[].id` 必须稳定，用于前端接受 / 撤回状态；
- `status` 当前使用 `可直接使用` / `建议补充`；
- `evidence[].source_id` 必须来自后端传入的素材库；
- 无证据内容只能标记 `建议补充`，不能生成可直接使用的事实经历。

#### `interview_card`

```json
{
  "job_id": "job_1001",
  "company_brief": {
    "business": "公司业务简述",
    "role_focus": "岗位关注点",
    "interview_style": "面试风格"
  },
  "interview_focus": ["RAG 项目深挖"],
  "questions": [
    {
      "id": "iq_rag_arch",
      "question": "请完整讲一下你做过的企业知识库 RAG 项目。",
      "intent": "验证候选人是否真正参与过 RAG 检索链路。",
      "framework": ["业务背景", "技术链路", "量化结果"],
      "evidence_ids": ["ev_rag_project"],
      "risk_tip": "不要只说接了大模型。"
    }
  ],
  "reverse_questions": ["团队当前 RAG 应用的主要评估指标是什么？"],
  "seven_day_plan": [
    {
      "day": 1,
      "title": "梳理 RAG 项目主线",
      "focus": "用 STAR 结构讲清业务背景、技术链路和量化结果。"
    }
  ]
}
```

适配要求：

- `questions[].id` 必须稳定；
- `framework` 当前前端消费字符串数组；
- `seven_day_plan[].focus` 是当前前端展示字段，算法返回 `tasks` 时后台需要合并成 `focus`；
- `company_brief` 当前是对象，不是字符串。

#### `recruiter_lens`

该能力当前结构已经与前端基本一致，仍需保证：

- `likely_questions` 至少 3 条；
- `concerns` 只写可改进问题；
- 所有数组字段空时返回 `[]`。

#### `feedback_review`

算法可输出策略建议，但后台最终需要适配为当前前端使用的：

```json
{
  "strategy_suggestions": [
    {
      "id": "strategy_ai_app_priority",
      "priority": "P0",
      "title": "提高 AI 应用岗位优先级",
      "description": "该方向反馈明显好于通用后端岗位。",
      "action_path": "/jobs?direction=AI%20应用工程师"
    }
  ]
}
```

适配要求：

- 算法返回 `target_path` 时，后台映射为 `action_path`；
- `priority` 使用 `P0` / `P1` / `P2`；
- 不允许基于单条反馈生成过度结论。

## 24. 当前 MVP 结论

JobHunter 当前最小可行接入方式：

```text
算法提供数据与结构化建议
后台负责业务状态、缓存、降级、持久化、前端适配
前端继续消费现有 /api/* 接口
```

优先落地：

1. 岗位原始数据导入；
2. 岗位决策 `job_decision`；
3. 招聘官视角 `recruiter_lens`；
4. 简历定制 `tailor_resume`；
5. 面试作战卡 `interview_card`。

这样可以最大化演示效果，同时把算法不稳定对现场演示的影响降到最低。
