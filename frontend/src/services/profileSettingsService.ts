export function parseProfileList(value: string) {
  return value
    .split(/[\n,，、;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatProfileList(items: string[]) {
  return items.join("，");
}

export function validateProfileSettings({
  coreSkills,
  personaName,
  preferredCities,
  targetRoles,
  userName,
}: {
  coreSkills: string[];
  personaName: string;
  preferredCities: string[];
  targetRoles: string[];
  userName: string;
}) {
  if (!userName.trim()) {
    return "昵称不能为空";
  }
  if (!personaName.trim()) {
    return "身份名称不能为空";
  }
  if (!targetRoles.length) {
    return "至少填写一个目标方向";
  }
  if (!preferredCities.length) {
    return "至少填写一个目标城市";
  }
  if (!coreSkills.length) {
    return "至少填写一个核心技能";
  }
  return "";
}
