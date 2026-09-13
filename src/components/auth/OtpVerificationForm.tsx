/**
 * OtpVerificationForm.tsx
 *
 * Composant réutilisable pour saisir un code de vérification à 6 chiffres,
 * utilisé sur la connexion, l'inscription, le mot de passe oublié et le
 * changement de mot de passe (double authentification).
 */
import React, { useEffect, useState, useCallback } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

interface OtpVerificationFormProps {
  /** Email ou téléphone masqué à afficher, ex: "j***@example.com" */
  maskedDestination: string;
  method: 'email' | 'sms';
  /** Appelé avec le code saisi une fois complet (6 chiffres) */
  onVerify: (code: string) => Promise<void> | void;
  /** Appelé quand l'utilisateur demande le renvoi du code */
  onResend: () => Promise<void> | void;
  /** Message d'erreur à afficher (ex: code incorrect) */
  error?: string | null;
  isVerifying?: boolean;
  isResending?: boolean;
  /** Délai (secondes) avant de pouvoir redemander un code. Par défaut 45s. */
  resendCooldownSeconds?: number;
  title?: string;
  description?: string;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  maskedDestination,
  method,
  onVerify,
  onResend,
  error,
  isVerifying = false,
  isResending = false,
  resendCooldownSeconds = 45,
  title = 'Vérification en 2 étapes',
  description = 'Saisissez le code à 6 chiffres que nous venons de vous envoyer.',
}) => {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleComplete = useCallback(
    (value: string) => {
      if (value.length === 6 && !isVerifying) {
        onVerify(value);
      }
    },
    [isVerifying, onVerify]
  );

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    await onResend();
    setCooldown(resendCooldownSeconds);
    setCode('');
  };

  const handleManualSubmit = () => {
    if (code.length === 6 && !isVerifying) onVerify(code);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-app-purple/10 p-3">
          <ShieldCheck className="h-6 w-6 text-app-purple" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {description}
        </p>
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
          {method === 'sms' ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          <span>{maskedDestination}</span>
        </div>
      </div>

      <InputOTP
        maxLength={6}
        value={code}
        onChange={(value) => setCode(value.replace(/\D/g, ''))}
        onComplete={handleComplete}
        disabled={isVerifying}
      >
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button
        type="button"
        className="w-full bg-app-purple hover:bg-app-dark-purple"
        disabled={code.length !== 6 || isVerifying}
        onClick={handleManualSubmit}
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification...
          </>
        ) : (
          'Valider le code'
        )}
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || isResending}
        className="text-sm text-app-purple hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
      >
        {isResending
          ? 'Envoi en cours...'
          : cooldown > 0
          ? `Renvoyer le code (${cooldown}s)`
          : 'Renvoyer le code'}
      </button>
    </div>
  );
};

export default OtpVerificationForm;
