import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  formatProfileList,
  parseProfileList,
  validateProfileSettings,
} from "@/services/profileSettingsService";
import type { CareerPersona } from "@/stores/personaStore";
import type { AuthUser } from "@/types/auth";

export function ProfileSettingsForm({
  persona,
  user,
  onSave,
}: {
  persona?: CareerPersona;
  user?: AuthUser;
  onSave: (input: {
    coreSkills: string[];
    email: string;
    personaName: string;
    preferredCities: string[];
    targetRoles: string[];
    userName: string;
  }) => void;
}) {
  const [coreSkillsText, setCoreSkillsText] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [personaName, setPersonaName] = useState("");
  const [preferredCitiesText, setPreferredCitiesText] = useState("");
  const [targetRolesText, setTargetRolesText] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setCoreSkillsText(formatProfileList(persona?.core_skills ?? []));
    setEmail(user?.email ?? "");
    setError("");
    setPersonaName(persona?.name ?? "");
    setPreferredCitiesText(formatProfileList(persona?.preferred_cities ?? []));
    setTargetRolesText(formatProfileList(persona?.target_roles ?? []));
    setUserName(user?.name ?? "");
  }, [persona, user]);

  const handleSave = () => {
    const coreSkills = parseProfileList(coreSkillsText);
    const preferredCities = parseProfileList(preferredCitiesText);
    const targetRoles = parseProfileList(targetRolesText);
    const validationError = validateProfileSettings({
      coreSkills,
      personaName,
      preferredCities,
      targetRoles,
      userName,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onSave({
      coreSkills,
      email,
      personaName: personaName.trim(),
      preferredCities,
      targetRoles,
      userName: userName.trim(),
    });
  };

  if (!user || !persona) {
    return (
      <Card surface="subtle" className="p-5 text-sm leading-6 text-slate-400">
        暂无可编辑的个人设置，请先登录 Demo 账号并选择求职身份。
      </Card>
    );
  }

  return (
    <Card surface="subtle" className="p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="cyan">个人设置</Badge>
        <span className="text-sm text-slate-400">修改后会同步顶部栏和身份上下文</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="昵称">
          <Input value={userName} onChange={(event) => setUserName(event.target.value)} />
        </Field>
        <Field label="邮箱">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="当前身份名称">
          <Input value={personaName} onChange={(event) => setPersonaName(event.target.value)} />
        </Field>
        <Field label="目标城市">
          <Input
            value={preferredCitiesText}
            placeholder="北京，上海，远程"
            onChange={(event) => setPreferredCitiesText(event.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="目标方向">
          <Textarea
            value={targetRolesText}
            placeholder="AI 应用工程师，LLM 工程师"
            onChange={(event) => setTargetRolesText(event.target.value)}
          />
        </Field>
        <Field label="核心技能">
          <Textarea
            value={coreSkillsText}
            placeholder="Python，LLM，RAG，后端服务"
            onChange={(event) => setCoreSkillsText(event.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={handleSave}>保存个人设置</Button>
        {error ? <span className="text-sm text-risk-medium">{error}</span> : null}
      </div>
    </Card>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs text-slate-500">{label}</div>
      {children}
    </label>
  );
}
