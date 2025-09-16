import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URLS, BASIC_AUTH } from '@/config/auth';

// Default login credentials
const DEFAULT_CREDENTIALS = {
  username: 'mindsltda@gmail.com',
  password: '54][Dco%Dx0{',
  role: 'hbb'
};

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
      
      // Preparar o payload conforme a documentação
      const loginPayload = {
        username: username || DEFAULT_CREDENTIALS.username,
        password: password || DEFAULT_CREDENTIALS.password,
        role: DEFAULT_CREDENTIALS.role
      };

      console.log('📦 Login payload:', {
        ...loginPayload,
        password: '****'
      });

      // Tentar autenticação direta primeiro
      let response = await fetch(`${API_URLS.auth}/v3/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${BASIC_AUTH}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginPayload)
      });

      console.log('📡 API response status:', response.status);
      console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      
      if (response.ok && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📡 API response data:', {
          ...data,
          access_token: data.access_token ? '****' : null,
          refresh_token: data.refresh_token ? '****' : null
        });
      } else {
        // Se a resposta não for JSON, tentar ler como texto para debug
        const textResponse = await response.text();
        console.log('📡 API response text:', textResponse.substring(0, 200));

        // Fallback para proxy local se a API direta falhar
        console.log('🔄 Falling back to proxy...');
        response = await fetch('/api/hb/v3/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(loginPayload)
        });
        
        console.log('📡 Proxy response status:', response.status);
        console.log('📡 Proxy response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          try {
            data = await response.json();
            console.log('📡 Proxy response data:', {
              ...data,
              access_token: data.access_token ? '****' : null,
              refresh_token: data.refresh_token ? '****' : null
            });
          } catch (e) {
            console.error('❌ Failed to parse proxy response:', e);
            const textResponse = await response.text();
            console.log('📡 Proxy response text:', textResponse.substring(0, 200));
          }
        }
      }

      if (response.ok && data?.access_token) {
        console.log('✅ Login successful!');
        const newUser: User = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          cognito_id: data.cognito_id,
          username: loginPayload.username,
          hasDeposit: false,
          balance: { real: 0, demo: 10000 }
        };
        
        setUser(newUser);
        localStorage.setItem('ux_trading_user', JSON.stringify(newUser));
        
        // Check deposit status after login
        await checkDepositStatus();
        return true;
      } else {
        console.log('❌ Login failed - Status:', response.status);
        if (data) {
          console.error('❌ Error response:', data);
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
      const response = await fetch(`${API_URLS.wallet}/balance/`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateBalance(data);
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
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            // Token inválido, tentar fazer login novamente
            console.log('🔄 Token expirado, tentando re-autenticar...');
            await login(DEFAULT_CREDENTIALS.username, DEFAULT_CREDENTIALS.password);
          } else {
            await checkDepositStatus();
          }
        } catch (error) {
          console.error('❌ Erro ao verificar token:', error);
          await login(DEFAULT_CREDENTIALS.username, DEFAULT_CREDENTIALS.password);
        }
      } else {
        // Sem usuário armazenado, tentar login automático
        await login(DEFAULT_CREDENTIALS.username, DEFAULT_CREDENTIALS.password);
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