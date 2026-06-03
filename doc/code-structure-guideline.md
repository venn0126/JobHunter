# JobHunter 代码结构约束

> 本文用于防止 P0 后续开发出现重复代码、散落配置和难扩展问题。

## 一、前端归类规则

| 目录 | 用途 |
|---|---|
| `frontend/src/app/` | 应用入口、Provider、路由配置 |
| `frontend/src/components/layout/` | 全局布局组件，例如侧边栏、顶部栏、背景 |
| `frontend/src/components/ui/` | 纯展示基础组件，例如 Card、Badge、Panel、MetricCard |
| `frontend/src/config/` | 前端环境配置与运行模式 |
| `frontend/src/data/` | 前端数据入口，统一聚合 Mock 或后续 API 数据适配 |
| `frontend/src/hooks/` | 可复用 React hooks，例如版本读取 |
| `frontend/src/lib/` | 无框架业务含义的工具函数 |
| `frontend/src/mocks/` | 静态 Mock JSON |
| `frontend/src/pages/` | 页面级组件，只组合布局和业务组件，不堆通用样式 |
| `frontend/src/services/` | API 调用封装 |
| `frontend/src/stores/` | 全局状态管理 |
| `frontend/src/types/` | 共享 TypeScript 类型 |

## 二、前端开发约束

- 通用卡片样式统一使用 `Card`，不要在页面里重复写玻璃拟态边框；
- 通用标签样式统一使用 `Badge`；
- 页面区块标题容器优先使用 `Panel`；
- 指标卡优先使用 `MetricCard`；
- Mock JSON 不在页面直接 import，统一通过 `frontend/src/data/demoData.ts` 暴露；
- 版本信息不在组件内直接 fetch，统一使用 `useVersionInfo`；
- 类名拼接统一使用 `cn`，不要手写数组 join；
- 页面组件只负责组合和轻量业务逻辑，复杂逻辑进入 hooks / stores / services。

## 三、后端归类规则

| 目录 | 用途 |
|---|---|
| `backend/api/` | 路由注册与请求入口 |
| `backend/core/` | 配置、响应、静态服务等基础设施 |
| `backend/services/` | 业务服务与数据读取 |
| `backend/schemas/` | Pydantic Schema |
| `backend/mock_data/` | 后端 Mock 数据 |

## 四、脚本约束

- 脚本公共逻辑统一放在 `scripts/lib/common.sh`；
- 环境变量读取优先使用 `load_local_env` / `load_runtime_env`；
- 端口和 Vite 环境变量通过 `configure_dev_env` / `configure_runtime_env` 设置；
- 新增脚本应接入 `Makefile`，避免散落命令；
- 版本文件同步统一使用 `make sync-version`；
- `make health` 是合并和演示前的最小验证入口。
