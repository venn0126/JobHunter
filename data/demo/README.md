# Demo 数据目录

本目录用于保存比赛演示的稳定种子数据。

当前阶段的约定：

- `frontend/src/mocks/`：前端优先使用的 Mock JSON；
- `backend/mock_data/`：后端 API 演示数据入口；
- `data/runtime/`：本地运行态数据，由脚本生成，不提交 Git；
- `make migrate`：初始化运行态 SQLite 文件。

后续进入 P0 Demo 稳定化阶段时，会补充 `make reset-demo` 与固定种子数据恢复机制。
