import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import heroImage from '@/assets/hero-trading.jpg';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 text-center text-white px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">UX Trading</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Plataforma oficial de trading da HomeBroker. Copy trading, sinais em tempo real e bots automáticos para maximizar seus lucros.
          </p>
        </div>

        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Acesse sua conta</CardTitle>
            <CardDescription>
              Comece a operar agora mesmo
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/login')}
              variant="cta"
              size="lg"
              className="w-full"
            >
              Acessar Plataforma
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>• Copy Trading 1-Click • Sinais VIP • Bots Automáticos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
