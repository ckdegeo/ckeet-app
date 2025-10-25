import toast from 'react-hot-toast';

// Função para limpar todos os toasts
export const clearAllToasts = () => {
  toast.dismiss();
};

// Função para mostrar toast de sucesso
export const showSuccessToast = (message: string) => {
  toast.success(message);
};

// Função para mostrar toast de erro
export const showErrorToast = (message: string) => {
  toast.error(message);
};

// Função para mostrar toast de aviso
export const showWarningToast = (message: string) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
  });
};

// Função para mostrar toast de informação
export const showInfoToast = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
  });
};

// Função para mostrar toast com fechamento forçado
export const showToastWithAutoClose = (type: 'success' | 'error' | 'warning' | 'info', message: string, autoCloseTime: number = 4000) => {
  const toastOptions = {
    duration: autoCloseTime,
  };

  switch (type) {
    case 'success':
      return toast.success(message, toastOptions);
    case 'error':
      return toast.error(message, toastOptions);
    case 'warning':
      return toast(message, {
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
        ...toastOptions,
      });
    case 'info':
      return toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
        ...toastOptions,
      });
    default:
      return toast(message, toastOptions);
  }
};
