import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user, loading: false }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearAuth: () => set({ user: null, userProfile: null, loading: false, error: null }),
}));

export default useAuthStore;
