import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  activeModule: string | null;
  toggleSidebar: () => void;
  setActiveModule: (module: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeModule: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveModule: (module) => set({ activeModule: module }),
}));
