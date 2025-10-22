import { toast } from 'react-toastify';

// Configurações padrão para toasts
export const toastConfig = {
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  newestOnTop: true,
  enableMultiContainer: false,
  closeButton: true,
  transition: undefined,
};

// Função para limpar todos os toasts
export const clearAllToasts = () => {
  toast.dismiss();
};

// Função para mostrar toast de sucesso
export const showSuccessToast = (message: string) => {
  toast.success(message, toastConfig);
};

// Função para mostrar toast de erro
export const showErrorToast = (message: string) => {
  toast.error(message, toastConfig);
};

// Função para mostrar toast de aviso
export const showWarningToast = (message: string) => {
  toast.warning(message, toastConfig);
};

// Função para mostrar toast de informação
export const showInfoToast = (message: string) => {
  toast.info(message, toastConfig);
};

// Função para forçar fechamento de toasts após tempo específico
export const forceCloseToasts = (delay: number = 5000) => {
  setTimeout(() => {
    toast.dismiss();
  }, delay);
};

// Função para mostrar toast com fechamento forçado
export const showToastWithAutoClose = (type: 'success' | 'error' | 'warning' | 'info', message: string, autoCloseTime: number = 4000) => {
  const toastId = toast[type](message, {
    ...toastConfig,
    autoClose: autoCloseTime,
  });

  // Forçar fechamento após o tempo especificado
  setTimeout(() => {
    toast.dismiss(toastId);
  }, autoCloseTime + 100); // +100ms para garantir que feche

  return toastId;
};
