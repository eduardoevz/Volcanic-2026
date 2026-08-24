import { create } from 'zustand';

type MascotEvolutionState = {
  // Nivel al que acaba de subir la mascota, o null si no hay nada que
  // celebrar en este momento. Nunca se dispara al bajar (no puede bajar) ni
  // al quedarse igual — ver checkMascotEvolution en features/mascot.
  justEvolvedToLevel: number | null;
  triggerEvolution: (level: number) => void;
  clear: () => void;
};

export const useMascotEvolutionStore = create<MascotEvolutionState>((set) => ({
  justEvolvedToLevel: null,
  triggerEvolution: (level) => set({ justEvolvedToLevel: level }),
  clear: () => set({ justEvolvedToLevel: null }),
}));
