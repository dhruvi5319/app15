import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const navigate = useNavigate();
  const { access_token, user, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await apiClient.post('/api/v1/auth/login', { email, password });
      const { access_token: token } = response.data;
      // Decode user info from JWT payload (base64 decode middle segment)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAuth(token, { id: payload.sub, email: payload.email });
    },
    [setAuth]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  return { login, logout, isAuthenticated: isAuthenticated(), user, access_token };
}
