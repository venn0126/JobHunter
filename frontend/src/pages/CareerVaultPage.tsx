import { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CareerVaultDetail } from "@/components/business/CareerVaultDetail";
import { CareerVaultListItem } from "@/components/business/CareerVaultListItem";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { createBlankVaultItem, useCareerVaultStore } from "@/stores/careerVaultStore";

export function CareerVaultPage() {
  const [searchParams] = useSearchParams();
  const evidenceId = searchParams.get("evidence") ?? "";
  const lastAppliedEvidenceIdRef = useRef("");
  const items = useCareerVaultStore((state) => state.items);
  const selectedItemId = useCareerVaultStore((state) => state.selectedItemId);
  const addItem = useCareerVaultStore((state) => state.addItem);
  const deleteItem = useCareerVaultStore((state) => state.deleteItem);
  const loadDemoItems = useCareerVaultStore((state) => state.loadDemoItems);
  const selectItem = useCareerVaultStore((state) => state.selectItem);
  const updateItem = useCareerVaultStore((state) => state.updateItem);
  const evidenceItem = useMemo(
    () => (evidenceId ? items.find((item) => item.id === evidenceId) : undefined),
    [evidenceId, items],
  );
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId),
    [items, selectedItemId],
  );
  const isRequestedEvidenceMissing = Boolean(evidenceId && !evidenceItem);
  const isSelectedRequestedEvidence = Boolean(evidenceId && selectedItem?.id === evidenceId);

  useEffect(() => {
    if (!evidenceItem) {
      lastAppliedEvidenceIdRef.current = "";
      return;
    }

    if (evidenceItem && lastAppliedEvidenceIdRef.current !== evidenceId) {
      lastAppliedEvidenceIdRef.current = evidenceId;
      if (evidenceItem.id !== selectedItemId) {
        selectItem(evidenceItem.id);
      }
    }
  }, [evidenceId, evidenceItem, selectItem, selectedItemId]);

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              职业素材库
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              让 AI 的每条建议都有真实证据。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              维护项目经历、技能证据和 STAR 故事，供岗位决策卡、简历工作室和面试作战卡复用。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => addItem(createBlankVaultItem())}>新增素材</Button>
            <Button variant="secondary" onClick={loadDemoItems}>
              一键加载 Demo 素材
            </Button>
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title="暂无职业素材"
          description="点击“一键加载 Demo 素材”进入标准演示态，或新增一条项目经历。"
          action={<Button onClick={loadDemoItems}>加载 Demo 素材</Button>}
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="素材列表">
            <div className="space-y-3">
              {items.map((item) => (
                <CareerVaultListItem
                  active={item.id === selectedItemId}
                  item={item}
                  key={item.id}
                  onClick={() => selectItem(item.id)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="素材详情">
            {isSelectedRequestedEvidence ? (
              <Card surface="subtle" className="mb-4 border-cyanGlow/30 bg-cyanGlow/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="cyan">正在补充</Badge>
                  <span className="text-sm text-slate-300">{evidenceId}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  直接编辑下方标题、量化成果和摘要即可，当前素材会自动保存到职业素材库。
                </p>
              </Card>
            ) : null}

            {isRequestedEvidenceMissing ? (
              <Card surface="subtle" className="mb-4 border-risk-medium/30 bg-risk-medium/10 p-4">
                <div className="font-medium text-risk-medium">目标证据暂未收录</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  决策卡请求的证据 ID 为 {evidenceId}，可新增素材补齐该证据，或加载 Demo 素材恢复标准演示态。
                </p>
                <Button className="mt-4" size="sm" onClick={() => addItem(createBlankVaultItem(evidenceId), evidenceId)}>
                  新增对应素材
                </Button>
              </Card>
            ) : null}
            {selectedItem ? (
              <CareerVaultDetail item={selectedItem} onDelete={deleteItem} onUpdate={updateItem} />
            ) : (
              <div className="text-sm text-slate-400">请选择一条素材。</div>
            )}
          </Panel>
        </section>
      )}

      <Panel title="联动入口">
        <div className="grid gap-3 md:grid-cols-3">
          <Button asChild variant="secondary">
            <Link to="/jobs/job_1001">返回岗位决策卡</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/jobs">查看岗位雷达</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/interview">准备面试作战卡</Link>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
