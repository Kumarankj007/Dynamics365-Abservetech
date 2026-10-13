import { create } from 'zustand';

interface TransitionState {
  isPending: boolean;
  setPending: (pending: boolean) => void;
}

const useTransitionStore = create<TransitionState>((set) => ({
  isPending: false,
  setPending: (pending) => set({ isPending: pending }),
}));

export default useTransitionStore;
