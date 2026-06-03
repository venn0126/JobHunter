import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoData } from "@/data/demoData";

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
  setActivePersona: (personaId: string) => void;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      activePersonaId: demoData.careerPersonas.active_persona_id,
      isSwitchingPersona: false,
      personaError: "",
      personas: demoData.careerPersonas.personas as CareerPersona[],
      setActivePersona: (personaId) => {
        const exists = demoData.careerPersonas.personas.some((persona) => persona.id === personaId);
        if (!exists) {
          set({ personaError: "求职身份不存在", isSwitchingPersona: false });
          return;
        }

        set({ isSwitchingPersona: true, personaError: "" });
        window.setTimeout(() => {
          set({ activePersonaId: personaId, isSwitchingPersona: false, personaError: "" });
        }, 160);
      },
    }),
    {
      name: "jobhunter-persona",
      partialize: (state) => ({ activePersonaId: state.activePersonaId }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function getActivePersona(state: Pick<PersonaState, "personas" | "activePersonaId">) {
  return state.personas.find((persona) => persona.id === state.activePersonaId);
}
