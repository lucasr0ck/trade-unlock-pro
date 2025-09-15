import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import DepositCTA from '@/components/DepositCTA';
import TradingSignal from '@/components/TradingSignal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Zap, 
  Bot, 
  Users, 
  Signal, 
  Crown,
  Clock,
  Target,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [signalsUsedToday, setSignalsUsedToday] = useState(0);
  const maxFreeSignals = 3;

  // Mock trading signals
  const mockSignals = [
    {
      asset: 'EUR/USD',
      direction: 'CALL' as const,
      expiry: '15:30',
      confidence: 85,
      payout: 82,
      isVip: false
    },
    {
      asset: 'GBP/JPY',
      direction: 'PUT' as const,
      expiry: '16:00',
      confidence: 78,
      payout: 85,
      isVip: true
    },
    {
      asset: 'USD/CAD',
      direction: 'CALL' as const,
      expiry: '16:15',
      confidence: 92,
      payout: 80,
      isVip: true
    }
  ];

  const handleCopyTrade = () => {
    if (!user?.hasDeposit) {
      alert('Função disponível apenas para usuários VIP. Faça um depósito para ativar!');
      return;
    }
    alert('Trade copiado com sucesso!');
  };

  const handleUseSignal = () => {
    if (!user?.hasDeposit && signalsUsedToday >= maxFreeSignals) {
      alert('Limite de sinais gratuitos atingido. Faça um depósito para sinais ilimitados!');
      return;
    }
    if (!user?.hasDeposit) {
      setSignalsUsedToday(prev => prev + 1);
    }
    alert('Sinal aplicado!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Bem-vindo de volta, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            {user?.hasDeposit 
              ? 'Seu status VIP está ativo. Aproveite todos os recursos!'
              : 'Você está no modo demo. Faça um depósito para desbloquear recursos VIP.'
            }
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="trading-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="gradient-success p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-bold text-primary">
                    {user?.hasDeposit ? 'VIP Ativo' : 'Demo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Signal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sinais Hoje</p>
                  <p className="font-bold text-primary">
                    {user?.hasDeposit ? 'Ilimitados' : `${signalsUsedToday}/${maxFreeSignals}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-success/10 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="font-bold text-success">84.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-warning/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próximo Sinal</p>
                  <p className="font-bold text-primary">2 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upgrade CTA for Demo Users */}
            {!user?.hasDeposit && (
              <DepositCTA 
                variant="banner"
                message="Desbloqueie copy trading, sinais ilimitados e acesso VIP"
              />
            )}

            {/* Trading Signals */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Signal className="h-5 w-5 text-primary" />
                  <span>Sinais de Trading</span>
                  <Badge className="trading-badge-success ml-auto">
                    Ao Vivo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockSignals.map((signal, index) => {
                    const canUseSignal = user?.hasDeposit || signalsUsedToday < maxFreeSignals;
                    const showSignal = user?.hasDeposit || !signal.isVip;
                    
                    if (!showSignal) {
                      return (
                        <div key={index} className="relative">
                          <TradingSignal {...signal} />
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
                            <div className="text-center">
                              <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                              <p className="font-bold text-primary">Sinal VIP</p>
                              <p className="text-sm text-muted-foreground">Depósito necessário</p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <TradingSignal
                        key={index}
                        {...signal}
                        onCopyTrade={canUseSignal ? handleCopyTrade : undefined}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Ações Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={user?.hasDeposit ? handleCopyTrade : undefined}
                    disabled={!user?.hasDeposit}
                    className={user?.hasDeposit ? "" : ""}
                    variant={user?.hasDeposit ? "cta" : "outline"}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Copy Trading
                  </Button>
                  
                  <Button
                    onClick={handleUseSignal}
                    disabled={!user?.hasDeposit && signalsUsedToday >= maxFreeSignals}
                    variant="outline"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Executar Bot
                  </Button>
                  
                  <Button
                    onClick={() => !user?.hasDeposit && alert('Recurso VIP - Faça um depósito!')}
                    disabled={!user?.hasDeposit}
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Sala VIP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deposit CTA */}
            {!user?.hasDeposit && (
              <DepositCTA message="Ative recursos ilimitados agora!" />
            )}

            {/* Recent Activity */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">EUR/USD - WIN</span>
                  <span className="text-success ml-auto">+R$ 82</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-danger rounded-full"></div>
                  <span className="text-muted-foreground">GBP/JPY - LOSS</span>
                  <span className="text-danger ml-auto">-R$ 50</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">USD/CAD - WIN</span>
                  <span className="text-success ml-auto">+R$ 95</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trades Hoje</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lucro/Prejuízo</span>
                  <span className="font-bold text-success">+R$ 247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Melhor Série</span>
                  <span className="font-bold text-success">7 wins</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;