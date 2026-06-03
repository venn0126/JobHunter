export interface NavItem {
  path: string;
  label: string;
  description: string;
}

export const primaryNavItems: NavItem[] = [
  { path: "/", label: "首页", description: "今日求职状态与行动入口" },
  { path: "/opportunity", label: "机会广场", description: "探索岗位、城市和技能热度" },
  { path: "/jobs", label: "岗位雷达", description: "查看值得优先投递的岗位" },
  { path: "/pipeline", label: "求职管线", description: "管理投递状态和下一步动作" },
  { path: "/resume", label: "简历工作室", description: "定制简历并沉淀版本" },
  { path: "/interview", label: "面试作战卡", description: "准备高频追问和 7 天计划" },
  { path: "/feedback", label: "反馈复盘", description: "记录投递结果并复盘趋势" },
  { path: "/settings", label: "设置", description: "用户、数据模式和演示配置" },
];
