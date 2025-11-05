import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ckeet.store';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/seller/auth/login',
          '/seller/auth/register',
        ],
        disallow: [
          '/seller/',
          '/master/',
          '/api/',
          '/shop/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/seller/auth/login',
          '/seller/auth/register',
        ],
        disallow: [
          '/seller/',
          '/master/',
          '/api/',
          '/shop/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

