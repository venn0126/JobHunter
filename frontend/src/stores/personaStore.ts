import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoData } from "@/data/demoData";
import { storageKeys } from "@/lib/storageKeys";

export interface CareerPersona {
  id: string;
  name: string;
  target_roles: string[];
  core_skills: string[];
  preferred_cities: string[];
  status: "active" | "archived";
}

interface PersonaState {
  activePersonaId: string;
  isSwitchingPersona: boolean;
  personaError: string;
  personas: CareerPersona[];
  resetDemoPersona: () => void;
  restorePersona: (personaId: string) => void;
  setActivePersona: (personaId: string) => void;
  updatePersona: (
    personaId: string,
    persona: Pick<CareerPersona, "core_skills" | "name" | "preferred_cities" | "target_roles">,
  ) => void;
}

let personaSwitchTimerId: number | undefined;

function clearPersonaSwitchTimer() {
  if (personaSwitchTimerId) {
    window.clearTimeout(personaSwitchTimerId);
    personaSwitchTimerId = undefined;
  }
}

function cloneDemoPersonas() {
  return demoData.careerPersonas.personas.map((persona) => ({
    ...persona,
    core_skills: [...persona.core_skills],
    preferred_cities: [...persona.preferred_cities],
    target_roles: [...persona.target_roles],
  })) as CareerPersona[];
}

function createDemoPersonaState() {
  return {
    activePersonaId: demoData.careerPersonas.active_persona_id,
    isSwitchingPersona: false,
    personaError: "",
    personas: cloneDemoPersonas(),
  };
}

function normalizeActivePersonaId(personaId: unknown) {
  return typeof personaId === "string" && demoData.careerPersonas.personas.some((persona) => persona.id === personaId)
    ? personaId
    : demoData.careerPersonas.active_persona_id;
}

function normalizePersistedPersonas(personas: unknown) {
  if (!Array.isArray(personas)) {
    return undefined;
  }

  const demoPersonaIds = new Set(demoData.careerPersonas.personas.map((persona) => persona.id));
  const normalizedPersonas = personas.filter(
    (persona): persona is CareerPersona =>
      Boolean(persona) &&
      typeof persona === "object" &&
      typeof (persona as CareerPersona).id === "string" &&
      demoPersonaIds.has((persona as CareerPersona).id) &&
      typeof (persona as CareerPersona).name === "string" &&
      isStringList((persona as CareerPersona).target_roles) &&
      isStringList((persona as CareerPersona).core_skills) &&
      isStringList((persona as CareerPersona).preferred_cities) &&
      ((persona as CareerPersona).status === "active" || (persona as CareerPersona).status === "archived"),
  );

  return normalizedPersonas.length ? normalizedPersonas : undefined;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeActivePersonaIdByList(personaId: unknown, personas: CareerPersona[]) {
  return typeof personaId === "string" && personas.some((persona) => persona.id === personaId)
    ? personaId
    : demoData.careerPersonas.active_persona_id;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      ...createDemoPersonaState(),
      resetDemoPersona: () => {
        clearPersonaSwitchTimer();
        set(createDemoPersonaState());
      },
      restorePersona: (personaId) => {
        clearPersonaSwitchTimer();
        set({
          activePersonaId: normalizeActivePersonaId(personaId),
          isSwitchingPersona: false,
          personaError: "",
        });
      },
      setActivePersona: (personaId) => {
        clearPersonaSwitchTimer();
        const exists = get().personas.some((persona) => persona.id === personaId);
        if (!exists) {
          set({ personaError: "求职身份不存在", isSwitchingPersona: false });
          return;
        }

        set({ isSwitchingPersona: true, personaError: "" });
        personaSwitchTimerId = window.setTimeout(() => {
          set({ activePersonaId: personaId, isSwitchingPersona: false, personaError: "" });
          personaSwitchTimerId = undefined;
        }, 160);
      },
      updatePersona: (personaId, personaInput) => {
        const normalizedName = personaInput.name.trim();
        if (!normalizedName) {
          set({ personaError: "身份名称不能为空" });
          return;
        }

        set((state) => ({
          personaError: "",
          personas: state.personas.map((persona) =>
            persona.id === personaId
              ? {
                  ...persona,
                  core_skills: personaInput.core_skills,
                  name: normalizedName,
                  preferred_cities: personaInput.preferred_cities,
                  target_roles: personaInput.target_roles,
                }
              : persona,
          ),
        }));
      },
    }),
    {
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersonaState> | undefined;
        const personas = normalizePersistedPersonas(persisted?.personas) ?? currentState.personas;
        return {
          ...currentState,
          activePersonaId: normalizeActivePersonaIdByList(persisted?.activePersonaId, personas),
          personas,
        };
      },
      name: storageKeys.persona,
      partialize: (state) => ({
        activePersonaId: state.activePersonaId,
        personas: state.personas,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function getActivePersona(state: Pick<PersonaState, "personas" | "activePersonaId">) {
  return state.personas.find((persona) => persona.id === state.activePersonaId);
}
