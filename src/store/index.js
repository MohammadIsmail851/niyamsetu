import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      loading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      reset: () => set({ user: null, profile: null, loading: false }),
    }),
    {
      name: 'niyamsetu-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

export const useAppStore = create((set, get) => ({
  language: 'en',
  notifications: [],
  sidebarOpen: true,
  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications].slice(0, 50) })),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map(n => ({ ...n, read: true }))
  })),
  setNotifications: (notifications) => set({ notifications }),
}));
