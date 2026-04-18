import { create } from 'zustand';

/**
 * Auth store for managing user state in JS.
 */
export const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
