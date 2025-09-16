import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASIC_AUTH, AUTH_CREDENTIALS, API_URLS } from '@/config/auth';

interface User {
  access_token: string;
  refresh_token: string;
  cognito_id: string;
  username: string;
  hasDeposit: boolean;
  balance: {
    real: number;
    demo: number;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (balance: { real: number; demo: number }) => void;
  checkDepositStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Starting login process...');
      
      // Enviar as credenciais corretas para a API
      const credentials = {
        username: username || AUTH_CREDENTIALS.username,
        password: password || AUTH_CREDENTIALS.password,
        role: AUTH_CREDENTIALS.role
      };

      // Tentar autenticação direta primeiro
      let response = await fetch(`${API_URLS.auth}/v3/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${BASIC_AUTH}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      console.log('📡 API response status:', response.status);
      
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      
      if (response.ok && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📡 API response data:', data);
      } else {
        // Fallback para proxy local se a API direta falhar
        console.log('🔄 Falling back to proxy...');
        response = await fetch('/api/hb/v3/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        });
        
        console.log('📡 Direct API response status:', response.status);
        console.log('📡 Direct API response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            data = await response.json();
            console.log('📡 Direct API response data:', data);
          } else {
            console.log('📡 Direct API response not JSON, content-type:', ct);
          }
        }
      }

      if (response.ok && data?.access_token) {
        console.log('✅ Login successful! Creating user...');
        const newUser: User = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          cognito_id: data.cognito_id,
          username,
          hasDeposit: false,
          balance: { real: 0, demo: 10000 }
        };
        
        setUser(newUser);
        localStorage.setItem('ux_trading_user', JSON.stringify(newUser));
        
        // Check deposit status after login
        await checkDepositStatus();
        console.log('✅ User created and logged in successfully');
        return true;
      } else {
        console.log('❌ Login failed - Status:', response.status, 'Data:', data);
        try { 
          const err = await response.json(); 
          console.error('❌ Login error response:', err); 
        } catch (e) {
          console.error('❌ Could not parse error response');
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ux_trading_user');
  };

  const updateBalance = (balance: { real: number; demo: number }) => {
    if (user) {
      const updatedUser = { ...user, balance, hasDeposit: balance.real > 0 };
      setUser(updatedUser);
      localStorage.setItem('ux_trading_user', JSON.stringify(updatedUser));
    }
  };

  const checkDepositStatus = async () => {
    if (!user?.access_token) return;

    try {
      // Try proxy first
      let response = await fetch('/api/hb-wallet/balance/', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        }
      });

      let didUpdate = false;
      if (response.ok) {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await response.json();
          updateBalance(data as any);
          didUpdate = true;
        }
      }

      // Fallback to direct API if proxy served HTML or failed
      if (!didUpdate) {
        response = await fetch('https://bot-wallet-api.homebroker.com/balance/', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
          }
        });
        if (response.ok) {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await response.json();
            updateBalance(data as any);
          }
        }
      }
    } catch (error) {
      console.error('Error checking balance:', error);
    }
  };

  // Check for stored user on app start and try auto-login if needed
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('ux_trading_user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Verificar se o token ainda é válido
        try {
          const response = await fetch(`${API_URLS.user}/users/read-user`, {
            headers: {
              'Authorization': `Bearer ${parsedUser.access_token}`,
            }
          });
          
          if (!response.ok) {
            // Token inválido, tentar fazer login novamente
            console.log('🔄 Token expirado, tentando re-autenticar...');
            await login(AUTH_CREDENTIALS.username, AUTH_CREDENTIALS.password);
          } else {
            await checkDepositStatus();
          }
        } catch (error) {
          console.error('❌ Erro ao verificar token:', error);
          await login(AUTH_CREDENTIALS.username, AUTH_CREDENTIALS.password);
        }
      } else {
        // Sem usuário armazenado, tentar login automático
        await login(AUTH_CREDENTIALS.username, AUTH_CREDENTIALS.password);
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    login,
    logout,
    updateBalance,
    checkDepositStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};