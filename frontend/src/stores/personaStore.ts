import { create } from "zustand";
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
  personas: CareerPersona[];
  setActivePersona: (personaId: string) => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  activePersonaId: demoData.careerPersonas.active_persona_id,
  personas: demoData.careerPersonas.personas as CareerPersona[],
  setActivePersona: (personaId) => set({ activePersonaId: personaId }),
}));

export function getActivePersona(state: Pick<PersonaState, "personas" | "activePersonaId">) {
  return state.personas.find((persona) => persona.id === state.activePersonaId);
}
