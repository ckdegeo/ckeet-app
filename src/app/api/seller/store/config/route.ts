import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

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

    // Buscar loja do seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { 
        store: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            logoUrl: true,
            homeBannerUrl: true,
            storeBannerUrl: true,
            primaryColor: true,
            secondaryColor: true,
            subdomain: true,
            isActive: true,
            // Social Media
            discordUrl: true,
            discordEnabled: true,
            youtubeUrl: true,
            youtubeEnabled: true,
            instagramUrl: true,
            instagramEnabled: true,
            twitterUrl: true,
            twitterEnabled: true,
            telegramUrl: true,
            telegramEnabled: true,
            threadsUrl: true,
            threadsEnabled: true,
            showStoreName: true,
            appearanceConfig: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    if (!seller || !seller.store) {
      return NextResponse.json({
        store: {
          id: null,
          name: '',
          contactEmail: seller?.email || '',
          logoUrl: '',
          homeBannerUrl: '',
          storeBannerUrl: '',
          primaryColor: '#bd253c',
          secondaryColor: '#970b27',
          subdomain: '',
        }
      });
    }

    const storeData = {
      id: seller.store.id,
      name: seller.store.name,
      contactEmail: seller.store.contactEmail,
      logoUrl: seller.store.logoUrl,
      homeBannerUrl: seller.store.homeBannerUrl,
      storeBannerUrl: seller.store.storeBannerUrl,
      primaryColor: seller.store.primaryColor,
      secondaryColor: seller.store.secondaryColor,
      subdomain: seller.store.subdomain,
      // Social Media
      discordUrl: seller.store.discordUrl,
      discordEnabled: seller.store.discordEnabled,
      youtubeUrl: seller.store.youtubeUrl,
      youtubeEnabled: seller.store.youtubeEnabled,
      instagramUrl: seller.store.instagramUrl,
      instagramEnabled: seller.store.instagramEnabled,
      twitterUrl: seller.store.twitterUrl,
      twitterEnabled: seller.store.twitterEnabled,
      telegramUrl: seller.store.telegramUrl,
      telegramEnabled: seller.store.telegramEnabled,
      threadsUrl: seller.store.threadsUrl,
      threadsEnabled: seller.store.threadsEnabled,
      showStoreName: seller.store.showStoreName ?? true,
      appearanceConfig: seller.store.appearanceConfig,
    };

            return NextResponse.json({
              store: storeData
            });

  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json(
        { error: 'Dados inválidos no request' },
        { status: 400 }
      );
    }

    const { 
      name, 
      contactEmail, 
      logoUrl, 
      homeBannerUrl, 
      storeBannerUrl, 
      primaryColor, 
      secondaryColor,
      showStoreName,
      appearanceConfig,
      // Social Media (opcional)
      discordUrl,
      discordEnabled,
      youtubeUrl,
      youtubeEnabled,
      instagramUrl,
      instagramEnabled,
      twitterUrl,
      twitterEnabled,
      telegramUrl,
      telegramEnabled,
      threadsUrl,
      threadsEnabled
    } = body;

    // Validar dados obrigatórios
    if (!name || !contactEmail || !logoUrl || !homeBannerUrl || !storeBannerUrl) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios para completar a configuração da loja' },
        { status: 400 }
      );
    }

    // Buscar seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { 
        store: true
      }
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar ou criar loja
            let store;
            if (seller.store) {
              store = await prisma.store.update({
                where: { id: seller.store.id },
                data: {
                  name,
                  contactEmail,
                  logoUrl,
                  homeBannerUrl,
                  storeBannerUrl,
                  primaryColor,
                  secondaryColor,
                  // Social Media (opcional)
                  discordUrl: discordUrl || null,
                  discordEnabled: discordEnabled || false,
                  youtubeUrl: youtubeUrl || null,
                  youtubeEnabled: youtubeEnabled || false,
                  instagramUrl: instagramUrl || null,
                  instagramEnabled: instagramEnabled || false,
                  twitterUrl: twitterUrl || null,
                  twitterEnabled: twitterEnabled || false,
                  telegramUrl: telegramUrl || null,
                  telegramEnabled: telegramEnabled || false,
                  threadsUrl: threadsUrl || null,
                  threadsEnabled: threadsEnabled || false,
                  showStoreName: showStoreName !== undefined ? showStoreName : true,
                  appearanceConfig: appearanceConfig || null,
                }
              });
            } else {
      store = await prisma.store.create({
        data: {
          name,
          contactEmail,
          logoUrl,
          homeBannerUrl,
          storeBannerUrl,
          primaryColor,
          secondaryColor,
          subdomain: `loja-${Date.now()}`, // Subdomínio temporário
          sellerId: user.id,
          // Social Media (opcional)
          discordUrl: discordUrl || null,
          discordEnabled: discordEnabled || false,
          youtubeUrl: youtubeUrl || null,
          youtubeEnabled: youtubeEnabled || false,
          instagramUrl: instagramUrl || null,
          instagramEnabled: instagramEnabled || false,
          twitterUrl: twitterUrl || null,
          twitterEnabled: twitterEnabled || false,
          telegramUrl: telegramUrl || null,
          telegramEnabled: telegramEnabled || false,
          threadsUrl: threadsUrl || null,
          threadsEnabled: threadsEnabled || false,
          showStoreName: showStoreName !== undefined ? showStoreName : true,
          appearanceConfig: appearanceConfig || null,
        }
      });
    }

    return NextResponse.json({
      message: 'Configurações salvas com sucesso!',
      store: {
        id: store.id,
        name: store.name,
        contactEmail: store.contactEmail,
        logoUrl: store.logoUrl,
        homeBannerUrl: store.homeBannerUrl,
        storeBannerUrl: store.storeBannerUrl,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        subdomain: store.subdomain,
      }
    });

  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request); // Usar a mesma lógica do POST
}
