import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { registerUser, loginUser, logoutUser, getUserProfile, onAuthChange } from '../firebase/auth';

const useAuth = () => {
  const { user, userProfile, loading, error, setUser, setUserProfile, setLoading, setError, clearError, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const result = await getUserProfile(firebaseUser.uid);
        if (result.success) setUserProfile(result.data);
      } else {
        clearAuth();
      }
    });
    return () => unsubscribe();
  }, []);

  const register = async (email, password, userData) => {
    setLoading(true);
    clearError();
    const result = await registerUser(email, password, userData);
    setLoading(false);
    if (!result.success) setError(result.error);
    return result;
  };

  const login = async (email, password) => {
    setLoading(true);
    clearError();
    const result = await loginUser(email, password);
    setLoading(false);
    if (!result.success) setError(result.error);
    return result;
  };

  const logout = async () => {
    await logoutUser();
    clearAuth();
  };

  return { user, userProfile, loading, error, clearError, register, login, logout, isAuthenticated: !!user };
};

export default useAuth;
