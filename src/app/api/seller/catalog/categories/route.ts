import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { CatalogService } from '@/lib/services/catalogService';

// GET /api/seller/catalog/categories
export async function GET(request: NextRequest) {
  return withSellerAuth(request, async () => {
    const categories = await CatalogService.listCategories();
    return AuthMiddleware.createSuccessResponse({ categories });
  });
}


