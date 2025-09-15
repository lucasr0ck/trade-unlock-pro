import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, Crown, Users } from 'lucide-react';

interface DepositCTAProps {
  variant?: 'banner' | 'card';
  message?: string;
}

const DepositCTA: React.FC<DepositCTAProps> = ({ 
  variant = 'card', 
  message = "Desbloqueie o potencial completo da plataforma" 
}) => {
  const openDepositLink = () => {
    window.open('https://www.homebroker.com/ref/n6DbyU85/', '_blank');
  };

  if (variant === 'banner') {
    return (
      <div className="gradient-hero text-white p-4 rounded-lg shadow-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6" />
            <div>
              <p className="font-bold">Upgrade para VIP</p>
              <p className="text-sm opacity-90">{message}</p>
            </div>
          </div>
          <Button 
            onClick={openDepositLink}
            className="bg-white text-primary hover:bg-white/90"
          >
            Depositar Agora
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="trading-card border-success/20 bg-gradient-to-br from-success/5 to-primary/5">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-hero rounded-full">
            <Crown className="h-8 w-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">
              Libere o Modo VIP
            </h3>
            <p className="text-muted-foreground mb-4">
              {message}
            </p>
          </div>

          {/* VIP Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4 text-success" />
              <span>Copy Trading 1-Click</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Crown className="h-4 w-4 text-success" />
              <span>Sinais Ilimitados</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-success" />
              <span>Sala VIP</span>
            </div>
          </div>

          {/* Urgency Badges */}
          <div className="flex justify-center space-x-2 mb-4">
            <Badge className="trading-badge-success">
              <Wallet className="h-3 w-3 mr-1" />
              Depósito Mínimo R$ 50
            </Badge>
          </div>

          <Button 
            onClick={openDepositLink}
            variant="cta"
            className="w-full"
            size="lg"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Depositar e Ativar VIP
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Seguro • Rápido • Suporte 24h
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepositCTA;