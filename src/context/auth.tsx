'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type AuthUserRole = 'Manager' | 'FarmManager' | 'Worker';

export interface AuthUser {
  username: string;
  role: AuthUserRole;
}

interface AuthApiResponse {
  data?: AuthUser;
  error?: string;
}

interface AuthActionResult {
  error?: string;
  success: boolean;
}

interface LoginInput {
  username: string;
  password: string;
}

interface RegisterInput {
  username: string;
  password: string;
  role: 'Manager' | 'Worker';
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthActionResult>;
  logout: () => Promise<AuthActionResult>;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (payload: AuthApiResponse | null, fallback: string): string => {
  if (payload?.error && payload.error.trim().length > 0) {
    return payload.error;
  }

  return fallback;
};

const readAuthResponse = async (response: Response): Promise<AuthApiResponse | null> => {
  try {
    return (await response.json()) as AuthApiResponse;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hydrateUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const payload = await readAuthResponse(response);

      if (!response.ok || !payload?.data) {
        setUser(null);
        return;
      }

      setUser(payload.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async (input: LoginInput): Promise<AuthActionResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });

      const payload = await readAuthResponse(response);

      if (!response.ok || !payload?.data) {
        return {
          success: false,
          error: getErrorMessage(payload, 'Unable to sign in. Please try again.'),
        };
      }

      setUser(payload.data);

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to sign in. Please try again.',
      };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthActionResult> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const payload = await readAuthResponse(response);

      if (!response.ok) {
        return {
          success: false,
          error: getErrorMessage(payload, 'Unable to register user. Please try again.'),
        };
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to register user. Please try again.',
      };
    }
  }, []);

  const logout = useCallback(async (): Promise<AuthActionResult> => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Unable to sign out. Please try again.',
        };
      }

      setUser(null);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to sign out. Please try again.',
      };
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      register,
    }),
    [isLoading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
