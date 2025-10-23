import { supabase } from '@/lib/supabase';
import { getAccessToken } from '@/lib/utils/authUtils';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Serviço para gerenciar upload de imagens no Supabase Storage
 */
export class ImageService {
  private static readonly BUCKET_NAME = 'store-images';

  /**
   * Upload de uma imagem para o Supabase Storage via API do servidor
   */
  static async uploadImage(
    file: File, 
    folder: string = 'store',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      console.log('[ImageService] Iniciando upload via API do servidor...');
      
      // Obter token de acesso
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log('[ImageService] Token de acesso não encontrado');
        return {
          success: false,
          error: 'Token de acesso não encontrado'
        };
      }

      // Usar caminho fixo baseado no tipo de imagem
      const fileExtension = file.name.split('.').pop();
      
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      // Não enviar fileName - será gerado com caminho fixo na API

      // Fazer upload via API do servidor
      console.log('[ImageService] Enviando requisição para API do servidor...');
      const response = await fetch('/api/seller/store/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro no upload'
        };
      }

      return {
        success: true,
        url: result.url
      };

    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      };
    }
  }

  /**
   * Upload de uma imagem de produto para o Supabase Storage via API do servidor
   */
  static async uploadProductImage(
    file: File,
    productId?: string,
    imageType: 'image1' | 'image2' | 'image3' = 'image1'
  ): Promise<UploadResult> {
    try {
      console.log('[ImageService] Iniciando upload de imagem de produto...');
      
      // Obter token de acesso
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log('[ImageService] Token de acesso não encontrado');
        return {
          success: false,
          error: 'Token de acesso não encontrado'
        };
      }

      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageType', imageType);
      if (productId) {
        formData.append('productId', productId);
      }

      // Fazer upload via API do servidor
      console.log('[ImageService] Enviando requisição para API de produtos...');
      const response = await fetch('/api/seller/products/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro no upload'
        };
      }

      return {
        success: true,
        url: result.url
      };

    } catch (error) {
      console.error('Erro no upload da imagem do produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      };
    }
  }

  /**
   * Deletar uma imagem do Supabase Storage via API do servidor
   */
  static async deleteImage(imageUrl: string): Promise<DeleteResult> {
    try {
      // Obter token de acesso
      const accessToken = getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Token de acesso não encontrado'
        };
      }

      // Fazer deleção via API do servidor
      const response = await fetch('/api/seller/store/images', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro ao deletar imagem'
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar'
      };
    }
  }

  /**
   * Verificar se uma URL é do Supabase Storage
   */
  static isSupabaseUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('supabase');
    } catch {
      return false;
    }
  }

  /**
   * Extrair o caminho do arquivo de uma URL do Supabase
   */
  static extractFilePath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === this.BUCKET_NAME);
      
      if (bucketIndex === -1) return null;
      
      return pathParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Verificar se um arquivo pertence ao seller atual
   */
  static isFileOwnedBySeller(filePath: string, sellerId: string): boolean {
    return filePath.startsWith(`sellers/${sellerId}/`);
  }

  /**
   * Gerar URL fixa para um tipo de imagem
   */
  static generateFixedImageUrl(sellerId: string, imageType: string, extension: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada');
    }
    return `${supabaseUrl}/storage/v1/object/public/${this.BUCKET_NAME}/sellers/${sellerId}/${imageType}.${extension}`;
  }

  /**
   * Extrair tipo de imagem de uma URL
   */
  static extractImageTypeFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'store-images');
      
      if (bucketIndex === -1) return null;
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      const fileName = filePath.split('/').pop();
      
      if (!fileName) return null;
      
      // Extrair tipo (remove extensão)
      return fileName.split('.')[0];
    } catch {
      return null;
    }
  }
}
