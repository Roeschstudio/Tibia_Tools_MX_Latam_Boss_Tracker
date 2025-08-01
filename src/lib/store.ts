import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LiveBoss } from '@/types/boss';

interface AppState {
  // Tema
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Mundo seleccionado
  selectedWorld: string;
  setSelectedWorld: (world: string) => void;
  
  // Personaje seleccionado
  selectedCharacter: string;
  setSelectedCharacter: (character: string) => void;
  
  // Bosses favoritos
  favoriteBosses: string[];
  addFavoriteBoss: (bossName: string) => void;
  removeFavoriteBoss: (bossName: string) => void;
  
  // Bosses activos en caché
  liveBosses: LiveBoss[];
  setLiveBosses: (bosses: LiveBoss[]) => void;
  lastBossUpdate: string | null;
  setLastBossUpdate: (timestamp: string) => void;
}

// Crear la tienda con persistencia
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Tema - por defecto modo oscuro
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      // Mundo seleccionado - vacío por defecto
      selectedWorld: '',
      setSelectedWorld: (world) => set({ selectedWorld: world }),
      
      // Personaje seleccionado - vacío por defecto
      selectedCharacter: '',
      setSelectedCharacter: (character) => set({ selectedCharacter: character }),
      
      // Bosses favoritos - vacío por defecto
      favoriteBosses: [],
      addFavoriteBoss: (bossName) =>
        set((state) => ({
          favoriteBosses: state.favoriteBosses.includes(bossName)
            ? state.favoriteBosses
            : [...state.favoriteBosses, bossName],
        })),
      removeFavoriteBoss: (bossName) =>
        set((state) => ({
          favoriteBosses: state.favoriteBosses.filter((name) => name !== bossName),
        })),
      
      // Bosses activos en caché
      liveBosses: [],
      setLiveBosses: (bosses) => set({ liveBosses: bosses }),
      lastBossUpdate: null,
      setLastBossUpdate: (timestamp) => set({ lastBossUpdate: timestamp }),
    }),
    {
      name: 'tibia-tools-storage',
    }
  )
);
