/**
 * Utilitários de validação para email e CPF
 */

// Domínios de email permitidos
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com'
];

/**
 * Valida se o domínio do email está na lista de permitidos
 */
export function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? ALLOWED_EMAIL_DOMAINS.includes(domain) : false;
}

/**
 * Valida CPF usando algoritmo oficial brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF.charAt(10)) !== secondDigit) return false;
  
  return true;
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Validação completa de email
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Validação básica de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  // Validação de domínio
  if (!isValidEmailDomain(email)) {
    return { 
      isValid: false, 
      error: 'Domínio de email não permitido. Use apenas: Gmail, Outlook, Hotmail, Live, Yahoo ou iCloud' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validação completa de CPF
 */
export function validateCPF(cpf: string): { isValid: boolean; error?: string } {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length === 0) {
    return { isValid: false, error: 'CPF é obrigatório' };
  }
  
  if (cleanCPF.length < 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }
  
  if (!isValidCPF(cleanCPF)) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  return { isValid: true };
}
