import { NavLink } from "react-router-dom";
import { primaryNavItems } from "@/app/routes";
import { cn } from "@/lib/classNames";

const mobileItems = primaryNavItems.filter((item) =>
  ["/", "/opportunity", "/jobs", "/pipeline", "/settings"].includes(item.path),
);

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-white/10 bg-ink-950/90 px-2 py-2 backdrop-blur-xl lg:hidden">
      {mobileItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "rounded-2xl px-2 py-2 text-center text-xs transition",
              isActive ? "bg-cyanGlow/10 text-cyanGlow" : "text-slate-400 hover:bg-white/5 hover:text-white",
            )
          }
        >
          {item.path === "/settings" ? "我的" : item.label.replace("机会广场", "广场").replace("岗位雷达", "岗位").replace("求职管线", "管线")}
        </NavLink>
      ))}
    </nav>
  );
}
