import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/providers/ToastProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Ckeet - Crie sua loja virtual em minutos | Venda produtos digitais sem mensalidade",
    template: "%s | Ckeet - Sua loja virtual"
  },
  description: "Crie sua loja virtual em minutos com Ckeet. Venda produtos digitais sem mensalidade, apenas 3.49% + R$ 0,50 por venda. Integração com PIX via Mercado Pago. Setup em 5 minutos, sem conhecimento técnico.",
  keywords: [
    "loja virtual",
    "e-commerce",
    "produtos digitais",
    "vender online",
    "pix",
    "mercado pago",
    "loja online grátis",
    "criar loja virtual",
    "dropshipping digital",
    "infoprodutos",
    "vendas digitais",
    "plataforma de vendas",
    "sem mensalidade",
    "lojinha virtual",
    "empreendedorismo digital"
  ],
  authors: [{ name: "Ckeet" }],
  creator: "Ckeet",
  publisher: "Ckeet",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://ckeet.store",
    siteName: "Ckeet",
    title: "Ckeet - Crie sua loja virtual em minutos | Venda produtos digitais",
    description: "Crie sua loja virtual em minutos sem mensalidade. Venda produtos digitais com PIX integrado. Setup em 5 minutos, apenas 3.49% + R$ 0,50 por venda.",
    images: [
      {
        url: "https://ckeet.store/img_lp.png",
        width: 1200,
        height: 630,
        alt: "Ckeet - Plataforma de vendas digitais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ckeet - Crie sua loja virtual em minutos",
    description: "Venda produtos digitais sem mensalidade. Setup em 5 minutos, PIX integrado via Mercado Pago.",
    images: ["https://ckeet.store/img_lp.png"],
    creator: "@ckeet",
  },
  alternates: {
    canonical: "https://ckeet.store",
  },
  category: "technology",
  verification: {
    google: "seu-codigo-google-search-console",
  },
  metadataBase: new URL('https://ckeet.store'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${manrope.variable} antialiased font-sans`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}