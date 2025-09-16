import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URLS, BASIC_AUTH } from '@/config/auth';

// Default login credentials
const DEFAULT_CREDENTIALS = {
  username: 'mindsltda@gmail.com',
  password: '54][Dco%Dx0{'
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
      
      // Preparar o payload exatamente como a documentação da HB
      const loginPayload = {
        username: username || DEFAULT_CREDENTIALS.username,
        password: password || DEFAULT_CREDENTIALS.password,
        role: "hbb"  // Valor fixo conforme documentação
      };

      console.log('📦 Login payload:', {
        ...loginPayload,
        password: '****'
      });

      // Login simples e direto como no Insomnia
      const response = await fetch('https://bot-account-manager-api.homebroker.com/v3/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${BASIC_AUTH}`
        },
        body: JSON.stringify(loginPayload)  // Usa o mesmo payload criado acima
      });

      console.log('📡 Response status:', response.status);
      
      // Tratamento simples da resposta
      if (!response.ok) {
        console.error('❌ Login failed:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (!data?.access_token) {
        console.error('❌ Login failed: No access token received');
        return false;
      }

      console.log('✅ Login successful!');
      
      const newUser: User = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        cognito_id: data.cognito_id,
        username: username || DEFAULT_CREDENTIALS.username,
        hasDeposit: false,
        balance: { real: 0, demo: 10000 }
      };
      
      setUser(newUser);
      localStorage.setItem('ux_trading_user', JSON.stringify(newUser));
      
      // Check deposit status after login
      await checkDepositStatus();
      return true;
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
            console.log('🔄 Token expirado, faça login novamente');
            setUser(null);
            localStorage.removeItem('ux_trading_user');
          } else {
            await checkDepositStatus();
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
        localStorage.removeItem('ux_trading_user');
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