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
    }),
    {
      merge: (persistedState, currentState) => ({
        ...currentState,
        activePersonaId: normalizeActivePersonaId((persistedState as Partial<PersonaState> | undefined)?.activePersonaId),
      }),
      name: storageKeys.persona,
      partialize: (state) => ({ activePersonaId: state.activePersonaId }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function getActivePersona(state: Pick<PersonaState, "personas" | "activePersonaId">) {
  return state.personas.find((persona) => persona.id === state.activePersonaId);
}
