import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URLS } from '@/config/auth';

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
  login: (username?: string, password?: string) => Promise<boolean>;
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

  const login = async (username?: string, password?: string): Promise<boolean> => {
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

      // Fazer login através do proxy para evitar CORS
      const response = await fetch('/api/hb/v3/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginPayload)
      });

      console.log('📡 Response status:', response.status);
      
      let responseText;
      try {
        // Primeiro, vamos obter o texto da resposta
        responseText = await response.text();
        
        // Tentar fazer o parse do JSON apenas se houver conteúdo
        if (responseText) {
          try {
            const data = JSON.parse(responseText);
            console.log('📡 Response data:', {
              ...data,
              access_token: data.access_token ? '****' : null,
              refresh_token: data.refresh_token ? '****' : null
            });

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
            }
          } catch (parseError) {
            console.error('❌ Failed to parse response:', parseError);
            console.log('📡 Raw response:', responseText);
          }
        }
      } catch (error) {
        console.error('❌ Failed to read response:', error);
      }

      if (response.status === 504) {
        console.error('❌ Login failed: Gateway Timeout');
      } else {
        console.error('❌ Login failed:', response.status, responseText || 'No response body');
      }
      return false;
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
      const response = await fetch('/api/hb-wallet/balance/', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
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

  // Initialize auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('ux_trading_user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify token validity
          const response = await fetch('/api/hb-user/users/read-user', {
            headers: {
              'Authorization': `Bearer ${parsedUser.access_token}`
            }
          });
          
          if (!response.ok) {
            console.log('🔄 Token expired, attempting re-auth...');
            await login();
          } else {
            await checkDepositStatus();
          }
        } else {
          // No stored user, try auto-login
          await login();
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        await login();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isInitialized,
      login,
      logout,
      updateBalance,
      checkDepositStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};