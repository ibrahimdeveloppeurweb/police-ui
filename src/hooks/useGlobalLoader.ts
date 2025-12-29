import { create } from "zustand";

interface LoaderState {
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export const useGlobalLoader = create<LoaderState>((set) => ({
  loading: false,
  setLoading: (v) => set({ loading: v }),
}));
