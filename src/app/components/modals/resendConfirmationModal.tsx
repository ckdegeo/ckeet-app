'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useState } from 'react';
import { X, Mail, KeyRound, Check } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import { supabase } from '@/lib/supabase';

// @ts-ignore - sem tipagem aqui para evitar falhas de build
export default function ResendConfirmationModal(props) {
  const { isOpen, onClose, onResend, initialEmail = '' } = props;
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'done'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Passo 1: enviar código OTP por email (sem redirect)
  const handleSendCode = async () => {
    if (!email.trim() || isLoading) return;
    try {
      setErrorMsg(null);
      setIsLoading(true);
      // legado: se forneceram um handler externo, usa ele
      if (onResend) {
        await onResend(email.trim());
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false },
        });
        if (error) throw error;
      }
      setStep('verify');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao enviar código.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Passo 2: verificar OTP para criar sessão
  const handleVerifyCode = async () => {
    if (!otp.trim() || isLoading) return;
    try {
      setErrorMsg(null);
      setIsLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      });
      if (error) throw error;
      setStep('reset');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Código inválido ou expirado.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Passo 3: definir nova senha (já autenticado por OTP)
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
      setErrorMsg('Senha inválida. Verifique os campos.');
      return;
    }
    try {
      setErrorMsg(null);
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStep('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar a senha.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail(initialEmail);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setStep('request');
    onClose();
  };

  // @ts-ignore - sem tipagem do evento para evitar falhas de build
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            {step === 'request' && (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="text-blue-600" size={20} />
              </div>
            )}
            {step === 'verify' && (
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <KeyRound className="text-amber-600" size={20} />
              </div>
            )}
            {step === 'reset' && (
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <KeyRound className="text-emerald-600" size={20} />
              </div>
            )}
            {step === 'done' && (
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="text-green-600" size={20} />
              </div>
            )}
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {step === 'request' && 'Recuperar senha'}
              {step === 'verify' && 'Digite o código de 6 dígitos'}
              {step === 'reset' && 'Definir nova senha'}
              {step === 'done' && 'Senha alterada'}
            </h2>
          </div>
          <IconOnlyButton
            icon={X}
            onClick={handleClose}
            variant="surface"
            className="w-10 h-10"
            aria-label="Fechar modal"
          />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {step === 'request' && (
            <>
              <p className="text-[var(--on-background)] text-sm mb-4">
                Informe seu email. Vamos enviar um código de 6 dígitos para você redefinir a senha.
              </p>
              <Input
                label="Email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendCode();
                }}
                autoFocus
              />
            </>
          )}

          {step === 'verify' && (
            <>
              <p className="text-[var(--on-background)] text-sm mb-4">
                Digite o código que enviamos para <b>{email}</b>.
              </p>
              <Input
                label="Código"
                placeholder="Ex.: 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyCode();
                }}
                autoFocus
              />
            </>
          )}

          {step === 'reset' && (
            <>
              <p className="text-[var(--on-background)] text-sm mb-4">
                Agora defina sua nova senha.
              </p>
              <div className="flex flex-col gap-3">
                <Input
                  label="Nova senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleChangePassword();
                  }}
                />
              </div>
            </>
          )}

          {step === 'done' && (
            <p className="text-[var(--on-background)] text-sm">
              Pronto! Sua senha foi alterada, você já está autenticado e pode acessar sua conta.
            </p>
          )}

          {errorMsg && (
            <p className="text-sm text-red-600 mt-3">{errorMsg}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            {step === 'request' && (
              <Button variant="primary" onClick={handleSendCode} disabled={!email.trim() || isLoading} className="flex-1">
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </Button>
            )}
            {step === 'verify' && (
              <Button variant="primary" onClick={handleVerifyCode} disabled={!otp.trim() || isLoading} className="flex-1">
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </Button>
            )}
            {step === 'reset' && (
              <Button variant="primary" onClick={handleChangePassword} disabled={isLoading} className="flex-1">
                {isLoading ? 'Salvando...' : 'Salvar senha'}
              </Button>
            )}
            {step === 'done' && (
              <Button variant="primary" onClick={handleClose} className="flex-1">
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
