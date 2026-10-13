/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { GlobalStoreInterface } from '../utils/interface';

export const GlobalStore = create<GlobalStoreInterface>((set) => ({
  modal: null,
  setModal: (newModal: string, value?: any) => set({ modal: { str: newModal, data: value } }),

  drawer: null,
  setDrawer: (newDrawer: string, value?: any) =>
    set({ drawer: newDrawer ? { str: newDrawer, data: value } : null }),

  loading: false,
  setLoading: (value: boolean) => set({ loading: value }),
}));
