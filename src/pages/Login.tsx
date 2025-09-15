import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import SignupModal from '@/components/SignupModal';
import { TrendingUp, Lock, User, ExternalLink } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Usuário ou senha inválidos. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">UX Trading</h1>
          <p className="text-white/80">Sua plataforma de trading oficial</p>
        </div>

        {/* Login Card */}
        <Card className="trading-card border-0 shadow-glow backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Acessar Plataforma</CardTitle>
            <CardDescription>
              Entre com suas credenciais da HomeBroker
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-danger/20 bg-danger/5">
                  <AlertDescription className="text-danger">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-primary">
                  Usuário ou E-mail
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário ou e-mail"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="cta"
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? 'Entrando...' : 'Acessar Trading'}
              </Button>
            </form>

            {/* Signup CTA */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ainda não tem conta na HomeBroker?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowSignupModal(true)}
                  className="w-full border-success text-success hover:bg-success hover:text-success-foreground"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Criar Conta Gratuita
                </Button>
                <p className="text-xs text-muted-foreground">
                  Cadastro rápido • Sem taxas • Suporte 24h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm mb-3">Recursos exclusivos da plataforma:</p>
          <div className="flex justify-center space-x-6 text-white/70 text-xs">
            <span>• Copy Trading</span>
            <span>• Sinais em Tempo Real</span>
            <span>• Bots Automáticos</span>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </div>
  );
};

export default Login;