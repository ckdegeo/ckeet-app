import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';
import { AuthService } from '@/lib/services/authService';
import { getAccessToken } from '@/lib/utils/authUtils';

export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    // Verificar token usando AuthService
    const user = await AuthService.verifyToken(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const sellerId = user.id;
    // Derivar um namespace opaco a partir do sellerId (não reversível)
    const secret = process.env.IMAGE_NAMESPACE_SECRET || 'ns-default-secret';
    const namespace = crypto
      .createHmac('sha256', secret)
      .update(sellerId)
      .digest('hex')
      .slice(0, 16); // curto e não identificável

    const supabase = createServerSupabaseClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const imageType = formData.get('imageType') as string || 'image1'; // image1, image2, image3

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de imagem
    const validImageTypes = ['image1', 'image2', 'image3'];
    if (!validImageTypes.includes(imageType)) {
      return NextResponse.json(
        { error: 'Tipo de imagem inválido' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = productId 
      ? `${productId}-${imageType}.${fileExtension}` 
      : `temp-${timestamp}-${imageType}.${fileExtension}`;
    
    const filePath = `tenants/${namespace}/products/${fileName}`;

    // Upload da imagem
    const { error } = await supabase.storage
      .from('store-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('Erro no upload:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('store-images')
      .getPublicUrl(filePath);

    // Adicionar timestamp para cache-busting
    const urlWithCacheBust = `${urlData.publicUrl}?t=${timestamp}`;

    return NextResponse.json({
      success: true,
      url: urlWithCacheBust,
      // não retornamos o caminho físico
    });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Remover imagem do produto
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    // Verificar token usando AuthService
    const user = await AuthService.verifyToken(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const sellerId = user.id;
    const secret = process.env.IMAGE_NAMESPACE_SECRET || 'ns-default-secret';
    const namespace = crypto
      .createHmac('sha256', secret)
      .update(sellerId)
      .digest('hex')
      .slice(0, 16);

    const supabase = createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Caminho da imagem não fornecido' },
        { status: 400 }
      );
    }

    // Verificar se o caminho pertence ao namespace do seller
    if (!imagePath.startsWith(`tenants/${namespace}/`)) {
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      );
    }

    // Remover imagem
    const { error } = await supabase.storage
      .from('store-images')
      .remove([imagePath]);

    if (error) {
      console.error('Erro ao remover imagem:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Imagem removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

