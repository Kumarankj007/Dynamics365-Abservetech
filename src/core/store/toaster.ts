import { create } from 'zustand';

type Severity = 'success' | 'error' | 'info' | 'warning'; // optional extra severities

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
  duration?: number;
  showSnackbar: (message: string, severity: Severity, duration?: number) => void;
  closeSnackbar: () => void;
}

const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'success',
  showSnackbar: (message, severity, duration) =>
    set({ open: true, message, severity, duration }),
  closeSnackbar: () => set({ open: false }),
}));

export default useSnackbarStore;
