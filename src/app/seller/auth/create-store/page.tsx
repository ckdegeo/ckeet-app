'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Globe, Palette, Image as ImageIcon, Mail, RefreshCw } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import ColorPicker from '@/app/components/inputs/colorPicker';
import ImageUpload from '@/app/components/images/imageUpload';
import Button from '@/app/components/buttons/button';
import { saveAuthData, getAccessToken } from '@/lib/utils/authUtils';
import { saveAuthCookies } from '@/lib/utils/cookieUtils';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import LoadingSpinner from '@/app/components/ui/loadingSpinner';
import { type SellerRegisterData } from '@/lib/validations/authSchemas';
import { ImageService } from '@/lib/services/imageService';

interface StoreData {
  subdomain: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  homeBannerUrl: string;
  storeBannerUrl: string;
}

// Função para verificar dados de registro de forma síncrona e completa
// Retorna null se os dados não forem válidos (sem fazer redirecionamento)
function checkRegisterData(): SellerRegisterData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedData = sessionStorage.getItem('sellerRegisterData');
    if (!storedData || storedData.trim() === '') {
      // Se não há dados, limpar e retornar null
      clearInvalidData();
      return null;
    }
    
    const parsedData = JSON.parse(storedData) as SellerRegisterData;
    
    // Validação completa e rigorosa de todos os campos obrigatórios
    if (!parsedData || 
        typeof parsedData !== 'object' ||
        !parsedData.email || 
        typeof parsedData.email !== 'string' ||
        parsedData.email.trim() === '' ||
        !parsedData.password || 
        typeof parsedData.password !== 'string' ||
        parsedData.password.trim() === '' ||
        !parsedData.name || 
        typeof parsedData.name !== 'string' ||
        parsedData.name.trim() === '' ||
        !parsedData.cpf || 
        typeof parsedData.cpf !== 'string' ||
        parsedData.cpf.trim() === '' ||
        !parsedData.phone || 
        typeof parsedData.phone !== 'string' ||
        parsedData.phone.trim() === '') {
      // Dados incompletos ou inválidos, limpar e retornar null
      clearInvalidData();
      return null;
    }
    
    // Validar formato básico do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parsedData.email.trim())) {
      clearInvalidData();
      return null;
    }
    
    // Validar que a senha tem pelo menos 6 caracteres
    if (parsedData.password.length < 6) {
      clearInvalidData();
      return null;
    }
    
    return parsedData;
  } catch (error) {
    // Se houver erro ao parsear, limpar dados inválidos e retornar null
    clearInvalidData();
    return null;
  }
}

// Função auxiliar para limpar dados inválidos
function clearInvalidData() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('sellerRegisterData');
    } catch (e) {
      // Ignorar erros ao limpar
    }
  }
}

// Função auxiliar para redirecionar para registro
function redirectToRegister() {
  if (typeof window !== 'undefined') {
    // Usar replace para não adicionar ao histórico e forçar redirecionamento imediato
    window.location.replace('/seller/auth/register');
  }
}

// Componente wrapper que verifica os dados antes de renderizar
function CreateStorePageContent() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // Verificação inicial síncrona - só chega aqui se houver dados válidos
  const [registerData] = useState<SellerRegisterData | null>(() => {
    if (typeof window === 'undefined') return null;
    return checkRegisterData();
  });
  
  const [storeData, setStoreData] = useState<StoreData>({
    subdomain: '',
    name: '',
    primaryColor: '#bd253c',
    secondaryColor: '#970b27',
    logoUrl: '',
    homeBannerUrl: '',
    storeBannerUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StoreData, string>>>({});
  const [nameWasEdited, setNameWasEdited] = useState(false);
  
  // Armazenar arquivos temporariamente antes do upload
  const [imageFiles, setImageFiles] = useState<{
    logo: File | null;
    homeBanner: File | null;
    storeBanner: File | null;
  }>({
    logo: null,
    homeBanner: null,
    storeBanner: null,
  });

  // Estados para confirmação de email (OTP)
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Memoizar funções onChange para evitar loops infinitos
  const handlePrimaryColorChange = useCallback((color: string) => {
    setStoreData(prev => {
      if (prev.primaryColor !== color) {
        return { ...prev, primaryColor: color };
      }
      return prev;
    });
  }, []);

  const handleSecondaryColorChange = useCallback((color: string) => {
    setStoreData(prev => {
      if (prev.secondaryColor !== color) {
        return { ...prev, secondaryColor: color };
      }
      return prev;
    });
  }, []);

  // Verificação adicional em runtime (caso os dados sejam removidos durante a sessão)
  useEffect(() => {
    // Verificar novamente se os dados ainda estão válidos
    const currentData = checkRegisterData();
    
    if (!currentData) {
      // Se os dados foram removidos ou invalidados, redirecionar imediatamente
      redirectToRegister();
      return;
    }
    
    // Não precisamos atualizar registerData aqui, pois já foi inicializado corretamente
    // Apenas verificamos se ainda está válido
  }, []); // Array vazio - executa apenas uma vez após o mount

  // Sugerir nome da loja baseado no subdomínio
  useEffect(() => {
    if (storeData.subdomain) {
      // Capitalizar primeira letra e substituir hífens por espaços
      const suggestedName = storeData.subdomain
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Se o nome não foi editado manualmente, sempre sugerir baseado no subdomínio
      if (!nameWasEdited) {
        setStoreData(prev => ({ ...prev, name: suggestedName }));
      }
    }
  }, [storeData.subdomain, nameWasEdited]);

  const steps = [
    { number: 1, title: 'Domínio', icon: Globe },
    { number: 2, title: 'Identidade', icon: Palette },
    { number: 3, title: 'Imagens', icon: ImageIcon },
    { number: 4, title: 'Confirmação', icon: Mail },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof StoreData, string>> = {};

    if (step === 1) {
      if (!storeData.subdomain.trim()) {
        newErrors.subdomain = 'Subdomínio é obrigatório';
      } else if (!/^[a-z0-9-]+$/.test(storeData.subdomain)) {
        newErrors.subdomain = 'Use apenas letras minúsculas, números e hífen';
      }
    }

    if (step === 2) {
      if (!storeData.name.trim()) {
        newErrors.name = 'Nome da loja é obrigatório';
      }
    }

    if (step === 3) {
      // Verificar se há arquivo ou URL para cada imagem
      const hasLogo = imageFiles.logo instanceof File || (storeData.logoUrl && storeData.logoUrl.trim() !== '');
      const hasHomeBanner = imageFiles.homeBanner instanceof File || (storeData.homeBannerUrl && storeData.homeBannerUrl.trim() !== '');
      const hasStoreBanner = imageFiles.storeBanner instanceof File || (storeData.storeBannerUrl && storeData.storeBannerUrl.trim() !== '');
      
      if (!hasLogo) {
        newErrors.logoUrl = 'Logotipo é obrigatório';
      }
      if (!hasHomeBanner) {
        newErrors.homeBannerUrl = 'Banner da tela inicial é obrigatório';
      }
      if (!hasStoreBanner) {
        newErrors.storeBannerUrl = 'Banner da loja é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 3) {
      // Ao finalizar step 3, enviar OTP e ir para step 4
      handleSendOtp();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Se voltar para o step 1, resetar a flag para permitir nova sugestão
      if (currentStep === 2) {
        setNameWasEdited(false);
      }
    }
  };

  // Função para enviar OTP
  const handleSendOtp = async () => {
    if (!registerData || isSendingOtp) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/seller/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registerData.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar código');
      }

      setOtpSent(true);
      showSuccessToast('Código de verificação enviado! Verifique seu email.');
      // Ir para step 4
      setCurrentStep(4);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao enviar código de verificação');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Função para reenviar OTP
  const handleResendOtp = async () => {
    if (!registerData || isSendingOtp) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/seller/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registerData.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao reenviar código');
      }

      setOtpCode(''); // Limpar código anterior
      showSuccessToast('Código reenviado! Verifique seu email.');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao reenviar código');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Função para verificar OTP e finalizar registro
  const handleVerifyOtpAndFinish = async () => {
    if (!registerData || !otpCode || otpCode.trim().length !== 6 || isVerifyingOtp) {
      if (!otpCode || otpCode.trim().length !== 6) {
        showErrorToast('Por favor, insira o código de 6 dígitos');
      }
      return;
    }

    setIsVerifyingOtp(true);
    try {
      // Chamar handleFinish que agora inclui o OTP
      await handleFinish();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao verificar código');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFinish = async () => {
    // Validar step 3 antes de finalizar
    if (!validateStep(3)) {
      // Mostrar mensagem de erro mais específica
      const missingFields = [];
      if (!(imageFiles.logo instanceof File) && !(storeData.logoUrl && storeData.logoUrl.trim() !== '')) {
        missingFields.push('Logotipo');
      }
      if (!(imageFiles.homeBanner instanceof File) && !(storeData.homeBannerUrl && storeData.homeBannerUrl.trim() !== '')) {
        missingFields.push('Banner da tela inicial');
      }
      if (!(imageFiles.storeBanner instanceof File) && !(storeData.storeBannerUrl && storeData.storeBannerUrl.trim() !== '')) {
        missingFields.push('Banner da loja');
      }
      
      if (missingFields.length > 0) {
        showErrorToast(`Por favor, adicione: ${missingFields.join(', ')}`);
      }
      return;
    }

    if (!registerData) {
      showErrorToast('Dados de registro não encontrados. Por favor, faça o registro novamente.');
      router.push('/seller/auth/register');
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para envio
      const requestData = {
        // Dados do seller
        name: registerData.name,
        email: registerData.email,
        cpf: registerData.cpf,
        phone: registerData.phone,
        password: registerData.password,
        // Dados da loja (sem URLs ainda, vamos fazer upload depois)
        subdomain: storeData.subdomain,
        storeName: storeData.name,
        primaryColor: storeData.primaryColor,
        secondaryColor: storeData.secondaryColor,
        logoUrl: storeData.logoUrl || '', // URLs existentes se houver
        homeBannerUrl: storeData.homeBannerUrl || '',
        storeBannerUrl: storeData.storeBannerUrl || '',
        // OTP de verificação
        otpCode: otpCode.toUpperCase().trim().replace(/\s/g, ''),
      };

      // Primeiro, criar a conta e obter o token
      const response = await fetch('/api/seller/auth/register-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta e loja');
      }

      // OTP já foi validado no servidor, então não precisamos mais verificar requiresEmailConfirmation

      // Se temos tokens, fazer login automático
      // Declarar accessToken uma única vez no escopo do try
      let accessToken: string | null = null;
      
      if (result.tokens && result.user) {
        saveAuthData(result.user, result.tokens);
        saveAuthCookies(result.user, result.tokens);
        // Usar o token diretamente do resultado para evitar problemas de timing
        accessToken = result.tokens.access_token || result.tokens.accessToken || null;
      }

      // Se não temos token ainda, tentar obter do storage
      if (!accessToken) {
        accessToken = getAccessToken();
      }

      // Se ainda não temos token, não podemos fazer upload
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado. Não é possível fazer upload das imagens.');
      }

      // Agora fazer upload das imagens se houver arquivos pendentes
      let logoUrl = storeData.logoUrl;
      let homeBannerUrl = storeData.homeBannerUrl;
      let storeBannerUrl = storeData.storeBannerUrl;

      if (imageFiles.logo) {
        const uploadResult = await ImageService.uploadImage(imageFiles.logo, 'logo', accessToken);
        if (uploadResult.success && uploadResult.url) {
          logoUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Erro ao fazer upload do logotipo');
        }
      }

      if (imageFiles.homeBanner) {
        const uploadResult = await ImageService.uploadImage(imageFiles.homeBanner, 'homeBanner', accessToken);
        if (uploadResult.success && uploadResult.url) {
          homeBannerUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Erro ao fazer upload do banner da tela inicial');
        }
      }

      if (imageFiles.storeBanner) {
        const uploadResult = await ImageService.uploadImage(imageFiles.storeBanner, 'storeBanner', accessToken);
        if (uploadResult.success && uploadResult.url) {
          storeBannerUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Erro ao fazer upload do banner da loja');
        }
      }

      // Atualizar a loja com as URLs das imagens
      // Garantir que temos o token (já declarado acima)
      if (!accessToken) {
        accessToken = getAccessToken();
      }
      
      if (accessToken && (logoUrl !== storeData.logoUrl || homeBannerUrl !== storeData.homeBannerUrl || storeBannerUrl !== storeData.storeBannerUrl)) {
        const updateResponse = await fetch('/api/seller/store/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: storeData.name,
            contactEmail: registerData.email,
            logoUrl,
            homeBannerUrl,
            storeBannerUrl,
            primaryColor: storeData.primaryColor,
            secondaryColor: storeData.secondaryColor,
          }),
        });
      }

      // Limpar dados do sessionStorage
      sessionStorage.removeItem('sellerRegisterData');

      showSuccessToast('Conta e loja criadas com sucesso!');
      
      // Redirecionar para dashboard
      router.push('/seller/dashboard');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao criar conta e loja');
    } finally {
      setIsLoading(false);
    }
  };

  // Proteção final: se não há dados válidos, não renderizar nada
  // Isso impede acesso direto à rota sem dados de registro
  if (!registerData) {
    // Se chegou aqui sem dados, verificar novamente e redirecionar imediatamente
    if (typeof window !== 'undefined') {
      // Verificação final antes de renderizar
      const finalCheck = checkRegisterData();
      if (!finalCheck) {
        redirectToRegister();
        return null; // Não renderizar nada enquanto redireciona
      }
    }
    return null; // Não renderizar nada se não houver dados
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Banner */}
      <div className="hidden md:flex md:w-1/2 relative border-r border-gray-200">
        <Image
          src="/init_banner.png"
          alt="Ckeet - Sua lojinha virtual em minutos"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Lado Direito - Conteúdo */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo e Título */}
          <div className="flex items-center justify-between mb-8">
            <Image
              src="/logo.png"
              alt="Ckeet Logo"
              width={100}
              height={100}
              priority
              className="h-auto"
            />
            <h2 className="text-md font-semibold text-[var(--foreground)]">
              Criar sua loja
            </h2>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Stepper */}
          <div className="mb-8 relative">
            {/* Linha de conexão */}
            <div className="absolute top-6 left-0 right-0 h-0.5 flex">
              <div 
                className={`
                  flex-1 h-full transition-all duration-200
                  ${currentStep >= 2 ? 'bg-[var(--primary)]' : 'bg-[var(--on-background)]/20'}
                `}
                style={{
                  '--primary': '#bd253c',
                  '--on-background': '#6b7280',
                } as React.CSSProperties}
              />
              <div 
                className={`
                  flex-1 h-full transition-all duration-200
                  ${currentStep >= 3 ? 'bg-[var(--primary)]' : 'bg-[var(--on-background)]/20'}
                `}
                style={{
                  '--primary': '#bd253c',
                  '--on-background': '#6b7280',
                } as React.CSSProperties}
              />
              <div 
                className={`
                  flex-1 h-full transition-all duration-200
                  ${currentStep >= 4 ? 'bg-[var(--primary)]' : 'bg-[var(--on-background)]/20'}
                `}
                style={{
                  '--primary': '#bd253c',
                  '--on-background': '#6b7280',
                } as React.CSSProperties}
              />
            </div>

            {/* Grid de steps */}
            <div className="grid grid-cols-4 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

  return (
                  <div key={step.number} className="flex flex-col items-center">
                    {/* Step Circle */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        transition-all duration-200
                        ${isCompleted
                          ? 'bg-[var(--primary)] text-white'
                          : isActive
                          ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20'
                          : 'bg-[var(--on-background)]/10 text-[var(--on-background)]'
                        }
                      `}
                      style={{
                        '--primary': '#bd253c',
                        '--on-background': '#6b7280',
                      } as React.CSSProperties}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <span
                      className={`
                        mt-2 text-sm font-medium text-center
                        ${isActive || isCompleted
                          ? 'text-[var(--foreground)]'
                          : 'text-[var(--on-background)]'
                        }
                      `}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-[var(--background)] rounded-2xl p-8 shadow-lg">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-fade-in">
                {/* Logo animado com anel de progresso */}
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Ckeet Logo"
                        width={56}
                        height={56}
                        className="opacity-90"
                      />
                    </div>
                  </div>
                  {/* Anel de progresso animado */}
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin"
                    style={{
                      '--primary': '#bd253c',
                    } as React.CSSProperties}
                  />
                </div>

                {/* Texto principal */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-[var(--foreground)]">
                    Criando sua loja...
                  </h3>
                  <p className="text-sm text-[var(--on-background)]/70">
                    Isso pode levar alguns instantes
                  </p>
                </div>

                {/* Barra de progresso animada */}
                <div className="w-full max-w-md space-y-3">
                  <div className="h-2 bg-[var(--on-background)]/10 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent rounded-full animate-progress"
                      style={{
                        width: '60%',
                        '--primary': '#bd253c',
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--on-background)]/60">
                    <span className="animate-pulse">Configurando...</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>Aplicando...</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>Finalizando...</span>
                  </div>
                </div>

                {/* Skeleton cards para mostrar o que está sendo criado */}
                <div className="w-full max-w-md grid grid-cols-3 gap-4 mt-6">
                  <div className="space-y-2">
                    <div className="h-20 bg-gradient-to-br from-[var(--on-background)]/5 to-[var(--on-background)]/10 rounded-lg animate-pulse" />
                    <div className="h-2.5 bg-[var(--on-background)]/5 rounded animate-pulse w-3/4 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="h-20 bg-gradient-to-br from-[var(--on-background)]/5 to-[var(--on-background)]/10 rounded-lg animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div 
                      className="h-2.5 bg-[var(--on-background)]/5 rounded animate-pulse w-3/4 mx-auto"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="h-20 bg-gradient-to-br from-[var(--on-background)]/5 to-[var(--on-background)]/10 rounded-lg animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    />
                    <div 
                      className="h-2.5 bg-[var(--on-background)]/5 rounded animate-pulse w-3/4 mx-auto"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Step 1: Domínio */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        Escolha o domínio da sua loja
                      </h2>
                      <p className="text-sm text-[var(--on-background)]">
                        Escolha um subdomínio único para sua loja
                      </p>
                    </div>

                    <Input
                      label="Subdomínio"
                      placeholder="minhaloja"
                      value={storeData.subdomain}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setStoreData(prev => ({ ...prev, subdomain: value }));
                        // Resetar flag para permitir nova sugestão quando subdomínio mudar
                        setNameWasEdited(false);
                        if (errors.subdomain) {
                          setErrors(prev => ({ ...prev, subdomain: undefined }));
                        }
                      }}
                      error={errors.subdomain}
                      disabled={isLoading}
                    />

                    <div className="bg-[var(--background)] border border-[var(--on-background)] rounded-2xl p-4">
                      <p className="text-sm text-[var(--on-background)]">
                        Sua loja ficará disponível em:
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)] mt-1">
                        {storeData.subdomain || 'minhaloja'}.ckeet.store
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Identidade */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        Identidade da sua loja
                      </h2>
                      <p className="text-sm text-[var(--on-background)]">
                        Defina o nome e as cores da sua loja
                      </p>
                    </div>

                    <Input
                      label="Nome da loja"
                      placeholder="Minha Loja"
                      value={storeData.name}
                      onChange={(e) => {
                        setStoreData(prev => ({ ...prev, name: e.target.value }));
                        setNameWasEdited(true); // Marcar que o usuário editou manualmente
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: undefined }));
                        }
                      }}
                      error={errors.name}
                      disabled={isLoading}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ColorPicker
                        label="Cor primária"
                        value={storeData.primaryColor}
                        onChange={handlePrimaryColorChange}
                      />
                      <ColorPicker
                        label="Cor secundária"
                        value={storeData.secondaryColor}
                        onChange={handleSecondaryColorChange}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Imagens */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
    <div>
                      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        Imagens da sua loja
                      </h2>
                      <p className="text-sm text-[var(--on-background)]">
                        Adicione as imagens obrigatórias da sua loja
                      </p>
                    </div>

                    <div className="space-y-4">
                      <ImageUpload
                        label="Logotipo da loja"
                        value={imageFiles.logo || (storeData.logoUrl ? { url: storeData.logoUrl } : null)}
                        onChange={(file, url) => {
                          // Quando deferUpload é true, onChange pode ser chamado apenas com file (sem url)
                          if (file instanceof File) {
                            // Arquivo selecionado mas ainda não foi feito upload (deferUpload)
                            setImageFiles(prev => ({ ...prev, logo: file }));
                            // Limpar URL se houver
                            setStoreData(prev => ({ ...prev, logoUrl: '' }));
                          } else if (url) {
                            // Upload já foi feito (caso de URL existente)
                            setStoreData(prev => ({ ...prev, logoUrl: url }));
                            setImageFiles(prev => ({ ...prev, logo: null }));
                          } else {
                            // Remover imagem (file é null/undefined e url também)
                            setImageFiles(prev => ({ ...prev, logo: null }));
                            setStoreData(prev => ({ ...prev, logoUrl: '' }));
                          }
                          if (errors.logoUrl) {
                            setErrors(prev => ({ ...prev, logoUrl: undefined }));
                          }
                        }}
                        folder="store"
                        uploadType="store"
                        error={errors.logoUrl}
                        disabled={isLoading}
                        placeholder="Clique para fazer upload do logotipo"
                        deferUpload={true}
                      />

                      <ImageUpload
                        label="Banner da tela inicial"
                        value={imageFiles.homeBanner || (storeData.homeBannerUrl ? { url: storeData.homeBannerUrl } : null)}
                        onChange={(file, url) => {
                          // Quando deferUpload é true, onChange pode ser chamado apenas com file (sem url)
                          if (file instanceof File) {
                            // Arquivo selecionado mas ainda não foi feito upload (deferUpload)
                            setImageFiles(prev => ({ ...prev, homeBanner: file }));
                            // Limpar URL se houver
                            setStoreData(prev => ({ ...prev, homeBannerUrl: '' }));
                          } else if (url) {
                            // Upload já foi feito (caso de URL existente)
                            setStoreData(prev => ({ ...prev, homeBannerUrl: url }));
                            setImageFiles(prev => ({ ...prev, homeBanner: null }));
                          } else {
                            // Remover imagem (file é null/undefined e url também)
                            setImageFiles(prev => ({ ...prev, homeBanner: null }));
                            setStoreData(prev => ({ ...prev, homeBannerUrl: '' }));
                          }
                          if (errors.homeBannerUrl) {
                            setErrors(prev => ({ ...prev, homeBannerUrl: undefined }));
                          }
                        }}
                        folder="store"
                        uploadType="store"
                        error={errors.homeBannerUrl}
                        disabled={isLoading}
                        placeholder="Clique para fazer upload do banner da tela inicial"
                        deferUpload={true}
                      />

                      <ImageUpload
                        label="Banner da loja"
                        value={imageFiles.storeBanner || (storeData.storeBannerUrl ? { url: storeData.storeBannerUrl } : null)}
                        onChange={(file, url) => {
                          // Quando deferUpload é true, onChange pode ser chamado apenas com file (sem url)
                          if (file instanceof File) {
                            // Arquivo selecionado mas ainda não foi feito upload (deferUpload)
                            setImageFiles(prev => ({ ...prev, storeBanner: file }));
                            // Limpar URL se houver
                            setStoreData(prev => ({ ...prev, storeBannerUrl: '' }));
                          } else if (url) {
                            // Upload já foi feito (caso de URL existente)
                            setStoreData(prev => ({ ...prev, storeBannerUrl: url }));
                            setImageFiles(prev => ({ ...prev, storeBanner: null }));
                          } else {
                            // Remover imagem (file é null/undefined e url também)
                            setImageFiles(prev => ({ ...prev, storeBanner: null }));
                            setStoreData(prev => ({ ...prev, storeBannerUrl: '' }));
                          }
                          if (errors.storeBannerUrl) {
                            setErrors(prev => ({ ...prev, storeBannerUrl: undefined }));
                          }
                        }}
                        folder="store"
                        uploadType="store"
                        error={errors.storeBannerUrl}
                        disabled={isLoading}
                        placeholder="Clique para fazer upload do banner da loja"
                        deferUpload={true}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmação de Email (OTP) */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary)]/10 mb-4">
                        <Mail className="w-8 h-8 text-[var(--primary)]" />
                      </div>
                      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        Confirme seu email
                      </h2>
                      <p className="text-sm text-[var(--on-background)] mb-4">
                        Enviamos um código de 5 caracteres para:
                      </p>
                      <p className="text-base font-medium text-[var(--foreground)] mb-6">
                        {registerData?.email}
                      </p>
                    </div>

                    <div className="bg-[var(--background)] border border-[var(--on-background)]/20 rounded-2xl p-6 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[var(--foreground)] mb-4">
                          Digite o código de verificação:
                        </p>
                        <Input
                          label="Código de verificação"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => {
                            // Aceitar apenas números, máximo 6 dígitos
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setOtpCode(value);
                          }}
                          maxLength={6}
                          disabled={isVerifyingOtp || isSendingOtp}
                          className="text-center text-2xl font-mono tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp || isVerifyingOtp}
                        className="flex-1"
                      >
                        {isSendingOtp ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Reenviando...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Reenviar código
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleVerifyOtpAndFinish}
                        disabled={isVerifyingOtp || isSendingOtp || otpCode.length !== 6}
                        className="flex-1"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Verificar e finalizar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--on-background)]/20">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1 || isLoading || isVerifyingOtp || isSendingOtp}
                  >
                    Voltar
                  </Button>
                  {currentStep < 4 && (
                    <Button
                      onClick={handleNext}
                      disabled={isLoading || isSendingOtp}
                    >
                      {currentStep === 3 ? 'Finalizar' : 'Próximo'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que verifica os dados antes de renderizar
export default function CreateStorePage() {
  const [isClient, setIsClient] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Verificar apenas no cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
    
    // Verificar dados de registro
    const initialData = checkRegisterData();
    if (!initialData) {
      // Marcar para redirecionar
      setShouldRedirect(true);
      // Redirecionar imediatamente
      window.location.replace('/seller/auth/register');
      return;
    }
  }, []);
  
  // Se ainda não está no cliente, mostrar loading (evita mismatch de hidratação)
  if (!isClient) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Se deve redirecionar, não renderizar nada
  if (shouldRedirect) {
    return null;
  }
  
  // Se chegou aqui, há dados válidos - renderizar o conteúdo
  return <CreateStorePageContent />;
}
