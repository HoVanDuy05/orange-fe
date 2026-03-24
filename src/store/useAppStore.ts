import { create } from 'zustand';

interface AppState {
  user: any | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
