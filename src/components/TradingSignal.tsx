import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Clock, Target, TrendingUp } from 'lucide-react';

interface TradingSignalProps {
  asset: string;
  direction: 'CALL' | 'PUT';
  expiry: string;
  confidence: number;
  payout: number;
  isVip?: boolean;
  onCopyTrade?: () => void;
}

const TradingSignal: React.FC<TradingSignalProps> = ({
  asset,
  direction,
  expiry,
  confidence,
  payout,
  isVip = false,
  onCopyTrade
}) => {
  const isCall = direction === 'CALL';
  
  return (
    <Card className={`trading-card ${isVip ? 'border-success/30 bg-success/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-primary">{asset}</CardTitle>
          {isVip && (
            <Badge className="trading-badge-success text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              VIP
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Direction Indicator */}
        <div className="flex items-center justify-center">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isCall ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {isCall ? (
              <ArrowUp className="h-5 w-5" />
            ) : (
              <ArrowDown className="h-5 w-5" />
            )}
            <span className="font-bold text-lg">{direction}</span>
          </div>
        </div>

        {/* Signal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Expiração</p>
              <p className="font-semibold">{expiry}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Payout</p>
              <p className="font-semibold text-success">{payout}%</p>
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Confiança</span>
            <span className="font-semibold text-primary">{confidence}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                confidence >= 80 ? 'bg-success' : 
                confidence >= 60 ? 'bg-warning' : 'bg-danger'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Copy Trade Button */}
        {onCopyTrade && (
          <Button 
            onClick={onCopyTrade}
            variant="cta"
            className="w-full"
            size="sm"
          >
            Copy Trade - 1 Clique
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingSignal;