import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Usuário não é seller' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'store';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop();
    const filePath = `sellers/${user.id}/${folder}.${fileExtension}`;

    // Upload com upsert: true para substituir arquivo existente
    const { data, error } = await supabase.storage
      .from('store-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Obter URL pública da imagem com cache-busting
    const { data: urlData } = supabase.storage
      .from('store-images')
      .getPublicUrl(filePath);

    // Adicionar timestamp para cache-busting
    const timestamp = Date.now();
    const urlWithCacheBust = `${urlData.publicUrl}?t=${timestamp}`;

    return NextResponse.json({
      success: true,
      url: urlWithCacheBust
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Usuário não é seller' },
        { status: 403 }
      );
    }

    // Listar arquivos do seller
    const { data: files, error } = await supabase.storage
      .from('store-images')
      .list(`sellers/${user.id}`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: files || []
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar se é um seller
    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Usuário não é seller' },
        { status: 403 }
      );
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem não fornecida' },
        { status: 400 }
      );
    }

    // Para deleção, vamos deletar por tipo de imagem (caminho fixo)
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'store-images');
    
    if (bucketIndex === -1) {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    const fullPath = pathParts.slice(bucketIndex + 1).join('/');
    
    // Verificar se o arquivo pertence ao seller atual
    if (!fullPath.startsWith(`sellers/${user.id}/`)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para deletar este arquivo' },
        { status: 403 }
      );
    }

    const filePath = fullPath;

    // Deletar o arquivo usando o cliente Supabase do servidor
    const { error } = await supabase.storage
      .from('store-images')
      .remove([filePath]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Imagem deletada com sucesso'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
