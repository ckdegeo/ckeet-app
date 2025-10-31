import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { ProductService } from '@/lib/services/productService';

// GET /api/seller/catalog/products?catalogCategoryId=...
export async function GET(request: NextRequest) {
  return withSellerAuth(request, async (req) => {
    const { searchParams } = new URL(req.url);
    const catalogCategoryId = searchParams.get('catalogCategoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const products = await ProductService.getCatalogProducts({ catalogCategoryId, search, isActive: true });
    return AuthMiddleware.createSuccessResponse({ products });
  });
}


