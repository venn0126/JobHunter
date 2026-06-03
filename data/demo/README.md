# Demo 数据目录

本目录用于保存比赛演示的稳定种子数据。

当前阶段的约定：

- `frontend/src/mocks/`：前端优先使用的 Mock JSON；
- `backend/mock_data/`：后端 API 演示数据入口；
- `data/runtime/`：本地运行态数据，由脚本生成，不提交 Git；
- `make migrate`：初始化运行态 SQLite 文件。
- `data/demo/seed-manifest.json`：标准演示态种子清单；
- `make reset-demo`：备份并重建运行态数据，同时同步前端版本文件；
- `make verify-version-cache`：验证 `version.json`、`/api/version` 与 SPA fallback 均禁缓存；
- 顶部栏「重置 Demo」：恢复浏览器内 Demo 账号、Persona、岗位筛选、素材库和管线状态。
- `/?mode=demo&reset=demo`：浏览器内一键恢复标准演示态，并进入大屏 Demo 模式。

恢复标准演示态时，先执行 `make reset-demo`，再在浏览器顶部栏点击「重置 Demo」。
如只需要恢复浏览器内状态，也可以直接访问 `/?mode=demo&reset=demo`。
