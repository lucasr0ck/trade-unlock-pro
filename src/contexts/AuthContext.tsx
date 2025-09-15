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
  const HB_BASIC = (import.meta as any).env?.VITE_HB_BASIC_AUTH || '';
  const HB_ROLE = (import.meta as any).env?.VITE_HB_ROLE || 'hbb';

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Starting login process...');
      
      // First try via proxy
      let response = await fetch('/api/hb/v3/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: HB_ROLE
        })
      });

      console.log('📡 Proxy response status:', response.status);
      console.log('📡 Proxy response headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      
      if (response.ok && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📡 Proxy response data:', data);
      } else {
        console.log('📡 Proxy response not JSON, content-type:', contentType);
        // Try to read as text to see what we got
        const textResponse = await response.text();
        console.log('📡 Proxy response text:', textResponse.substring(0, 200));
      }

      // If proxy failed (e.g., HTML page returned or missing tokens), fallback to direct API with Basic
      if (!data?.access_token && HB_BASIC) {
        console.log('🔄 Falling back to direct API...');
        response = await fetch('https://bot-account-manager-api.homebroker.com/v3/login', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${HB_BASIC}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, role: HB_ROLE })
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