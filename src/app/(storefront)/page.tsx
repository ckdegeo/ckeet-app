import { redirect } from 'next/navigation';

// Página raiz da loja - redireciona para /shop
export default function StorefrontRoot() {
  redirect('/shop');
}

