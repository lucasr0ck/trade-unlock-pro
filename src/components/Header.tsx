import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, TrendingUp, Wallet } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const openDepositLink = () => {
    window.open('https://www.homebroker.com/ref/n6DbyU85/', '_blank');
  };

  return (
    <header className="border-b bg-card shadow-trading">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="gradient-hero p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">UX Trading</h1>
            <p className="text-xs text-muted-foreground">HomeBroker Official</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Saldo Real</p>
                <p className="font-bold text-primary">
                  R$ {user.balance.real.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Saldo Demo</p>
                <p className="font-bold text-muted-foreground">
                  R$ {user.balance.demo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Deposit Status Badge */}
            {user.hasDeposit ? (
              <Badge className="trading-badge-success">
                <Wallet className="h-3 w-3 mr-1" />
                VIP Ativo
              </Badge>
            ) : (
              <Badge className="trading-badge-danger">
                <Wallet className="h-3 w-3 mr-1" />
                Demo
              </Badge>
            )}

            {/* Deposit CTA */}
            {!user.hasDeposit && (
              <Button 
                onClick={openDepositLink}
            variant="cta"
                size="sm"
              >
                Depositar Agora
              </Button>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-primary">{user.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="hover:bg-danger hover:text-danger-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;