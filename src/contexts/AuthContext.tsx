import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/hb/v3/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: import.meta.env.VITE_HB_ROLE || 'hbb'
        })
      });

      if (response.ok) {
        const data = await response.json();
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
        return true;
      } else {
        try {
          const err = await response.json();
          console.error('Login failed', err);
        } catch (_) {
          // ignore json parse
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
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
          'Authorization': `Bearer ${user.access_token}`,
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

  // Check for stored user on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('ux_trading_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
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