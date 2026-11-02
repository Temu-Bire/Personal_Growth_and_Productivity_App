import { create } from 'zustand';

interface ToastOptions {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface UIState {
  activeDate: string; // YYYY-MM-DD
  toast: ToastOptions | null;
  showToast: (opts: ToastOptions) => void;
  hideToast: () => void;
  setActiveDate: (date: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeDate: new Date().toISOString().split('T')[0],
  toast: null,
  showToast: (opts) => {
    set({ toast: opts });
    setTimeout(() => {
      set({ toast: null });
    }, opts.duration || 3000);
  },
  hideToast: () => set({ toast: null }),
  setActiveDate: (date) => set({ activeDate: date }),
}));

