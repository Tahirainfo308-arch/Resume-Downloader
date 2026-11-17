import { create } from 'zustand';

interface AppState {
  appName: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const configuredAppName = import.meta.env.VITE_APP_NAME;

export const useAppStore = create<AppState>((set) => ({
  appName:
    typeof configuredAppName === 'string' && configuredAppName.length > 0
      ? configuredAppName
      : 'AI Career Studio',
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
