import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold text-primary">
            Criar Conta na HomeBroker
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Complete seu cadastro em nossa plataforma oficial para ter acesso a todos os recursos do UX Trading.
          </p>
        </DialogHeader>
        
        <div className="w-full h-[70vh]">
          <iframe
            src="https://www.homebroker.com/ref/n6DbyU85/"
            className="w-full h-full border-0"
            title="Cadastro HomeBroker"
            loading="lazy"
          />
        </div>
        
        <div className="px-6 py-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Após completar o cadastro, retorne ao UX Trading e faça login com suas credenciais
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;