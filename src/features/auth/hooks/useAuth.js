import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth/authStore';
import * as authService from '../services/authService';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const userProfile = useAuthStore((state) => state.userProfile);
  const error = useAuthStore((state) => state.error);
  const setUser = useAuthStore((state) => state.setUser);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);

  const initialCheckRef = useRef(false);

  useEffect(() => {
    if (initialCheckRef.current) return;
    initialCheckRef.current = true;

    console.log('[Auth] Starting auth observer...');

    // Timeout fallback (10 seconds)
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Auth check timed out, forcing loading false');
        setLoading(false);
      }
    }, 10000);

    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      console.log('[Auth] Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      clearTimeout(timeout);
      
      if (firebaseUser) {
        console.log('[Auth] Fetching user profile for:', firebaseUser.uid);
        setUser(firebaseUser);
        try {
          const profileResponse = await authService.getUserProfile(firebaseUser.uid);
          if (profileResponse.success) {
            // Auto-migration for search consistency
            const consistentProfile = await authService.ensureProfileConsistency(firebaseUser.uid, profileResponse.data);
            setUserProfile(consistentProfile);
          }
        } catch (err) {
          console.error('[Auth] Error fetching profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      console.log('[Auth] Setting loading to false');
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [setUser, setUserProfile, setLoading]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    const result = await authService.loginUser(email, password);
    if (!result.success) setError(result.error);
    setLoading(false);
    return result;
  };

  const register = async (email, password, userData) => {
    setLoading(true);
    setError(null);
    const result = await authService.registerUser(email, password, userData);
    if (!result.success) setError(result.error);
    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    const result = await authService.logoutUser();
    if (result.success) {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates, imageUri = null) => {
    setLoading(true);
    setError(null);
    try {
      let finalUpdates = { ...updates };

      if (imageUri) {
        const uploadResult = await authService.uploadProfileImage(user.uid, imageUri);
        if (uploadResult.success) {
          finalUpdates.profilePicture = uploadResult.url;
        } else {
          setLoading(false);
          return uploadResult;
        }
      }

      const result = await authService.updateUserProfile(user.uid, finalUpdates);
      if (result.success) {
        // Refresh local profile
        const profileResponse = await authService.getUserProfile(user.uid);
        if (profileResponse.success) {
          setUserProfile(profileResponse.data);
        }
      } else {
        setError(result.error);
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword: authService.updatePassword,
  };
};
