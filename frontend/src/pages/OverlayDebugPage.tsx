import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";

interface OverlayElementInfo {
  backgroundColor: string;
  className: string;
  id: string;
  opacity: string;
  pointerEvents: string;
  position: string;
  rect: string;
  tag: string;
  text: string;
  zIndex: string;
}

export function OverlayDebugPage() {
  const [elements, setElements] = useState<OverlayElementInfo[]>([]);
  const [fixedElements, setFixedElements] = useState<OverlayElementInfo[]>([]);

  const refresh = () => {
    setElements(getElementsFromViewportCenter());
    setFixedElements(getLargeFixedElements());
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <Badge tone="warning" className="mb-4">
          Overlay Debug
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight">页面遮罩定位。</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          用于远程定位不可点击问题：检查视口中心元素栈和覆盖大部分页面的 fixed 元素。
        </p>
        <Button className="mt-5" onClick={refresh}>
          重新检测
        </Button>
      </Card>

      <Panel title="视口中心元素栈">
        <DebugList elements={elements} />
      </Panel>

      <Panel title="大面积 fixed 元素">
        <DebugList elements={fixedElements} emptyText="未发现覆盖大部分页面的 fixed 元素。" />
      </Panel>
    </div>
  );
}

function DebugList({
  elements,
  emptyText = "暂无检测结果。",
}: {
  elements: OverlayElementInfo[];
  emptyText?: string;
}) {
  if (elements.length === 0) {
    return (
      <Card surface="subtle" className="p-5 text-sm text-slate-400">
        {emptyText}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {elements.map((element, index) => (
        <Card key={`${element.tag}-${index}`} surface="subtle" className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={index === 0 ? "cyan" : "muted"}>#{index}</Badge>
            <span className="font-medium">{element.tag}</span>
            <span className="text-xs text-slate-500">
              z={element.zIndex} · pointer={element.pointerEvents} · opacity={element.opacity}
            </span>
          </div>
          <div className="mt-2 break-all text-xs leading-5 text-slate-400">
            class: {element.className || "-"}
          </div>
          <div className="mt-1 text-xs leading-5 text-slate-500">
            pos={element.position} · rect={element.rect} · bg={element.backgroundColor}
          </div>
          {element.text ? <div className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{element.text}</div> : null}
        </Card>
      ))}
    </div>
  );
}

function getElementsFromViewportCenter() {
  if (typeof document === "undefined") {
    return [];
  }

  const x = Math.floor(window.innerWidth / 2);
  const y = Math.floor(window.innerHeight / 2);
  return document.elementsFromPoint(x, y).slice(0, 12).map(readElementInfo);
}

function getLargeFixedElements() {
  if (typeof document === "undefined") {
    return [];
  }

  return Array.from(document.querySelectorAll("body *"))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.position === "fixed" && rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8;
    })
    .map(readElementInfo);
}

function readElementInfo(element: Element): OverlayElementInfo {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    backgroundColor: style.backgroundColor,
    className: typeof element.className === "string" ? element.className : "",
    id: element.id,
    opacity: style.opacity,
    pointerEvents: style.pointerEvents,
    position: style.position,
    rect: `${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)}x${Math.round(rect.height)}`,
    tag: element.tagName.toLowerCase(),
    text: (element.textContent ?? "").trim().slice(0, 160),
    zIndex: style.zIndex,
  };
}
