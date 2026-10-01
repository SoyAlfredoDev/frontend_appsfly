/**
 * Configuración centralizada de SEO y Open Graph — AppsFly Frontend (Vite SPA).
 * URLs absolutas requeridas por WhatsApp / Facebook / LinkedIn para og:image.
 */

import { isOpticsPromoHost, OPTICS_PROMO_SITE_URL } from '../utils/opticsPromoHost.js'

const trimTrailingSlash = (url) => String(url || '').replace(/\/$/, '')

/** URL pública canónica del sitio (producción: VITE_FRONTEND_URL). */
export const SITE_URL = trimTrailingSlash(
  import.meta.env.VITE_FRONTEND_URL || 'https://appsfly.app',
)

export const OG_IMAGE_PATH = '/assets/seo/og-conversion.jpg'
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`

export const DEFAULT_SEO = {
  title: 'AppsFly | El Sistema de Gestión definitivo para tu Óptica y Negocio',
  description:
    'Controla tu inventario de óptica, registra tus ventas, gestiona tus recetas y optimiza tus reportes en tiempo real con AppsFly. Automatización y control B2B en una sola plataforma.',
  keywords:
    'sistema para ópticas, software inventario chile, saas gestión business, gestión óptica, control inventario lentes, software ventas chile, appsfly, erp óptica, recetas ópticas digital',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  locale: 'es_CL',
  siteName: 'AppsFly',
}

export const OPTICS_LANDING_SEO = {
  title: 'AppsFly Óptica | Sistema de gestión para ópticas en Chile',
  description:
    'Software para ópticas: recetas OD/OI, órdenes de trabajo, laboratorios, inventario de lentes y ventas. Prueba AppsFly gratis 2 meses o solicita información.',
  keywords:
    'sistema para ópticas chile, software óptica, gestión recetas ópticas, órdenes de trabajo óptica, laboratorio óptico software, inventario lentes armazones, appsfly óptica, erp óptica',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  locale: 'es_CL',
  siteName: 'AppsFly Óptica',
}

/** Rutas públicas indexables (whitelist). El resto recibe noindex,nofollow. */
export const PUBLIC_INDEXED_ROUTES = new Set([
  '/',
  '/optica',
  '/about-us',
  '/terminos',
  '/politicas',
  '/register',
])

/** Meta específica por ruta pública (opcional). */
export const ROUTE_SEO_OVERRIDES = {
  '/': DEFAULT_SEO,
  '/optica': OPTICS_LANDING_SEO,
  '/about-us': {
    ...DEFAULT_SEO,
    title: 'AppsFly | Plataforma de gestión para negocios',
    description:
      'Conoce AppsFly: software chileno para ópticas y negocios B2B. Inventario, ventas, reportes y automatización en una sola plataforma.',
  },
  '/terminos': {
    ...DEFAULT_SEO,
    title: 'AppsFly | Términos y Condiciones',
    description: 'Términos y condiciones de uso del servicio AppsFly.',
  },
  '/politicas': {
    ...DEFAULT_SEO,
    title: 'AppsFly | Política de Privacidad',
    description: 'Política de privacidad y tratamiento de datos en AppsFly.',
  },
  '/register': {
    ...DEFAULT_SEO,
    title: 'AppsFly | Regístrate — Prueba gratis 2 meses',
    description:
      'Crea tu cuenta en AppsFly y prueba el sistema gratis por 2 meses. Sin tarjeta de crédito. Gestión integral para tu óptica.',
  },
}

export function isPublicIndexedRoute(pathname) {
  return PUBLIC_INDEXED_ROUTES.has(pathname)
}

/**
 * @param {string} pathname
 * @param {{ hostname?: string }} [options]
 */
export function resolveSeoForPath(pathname, options = {}) {
  const hostname =
    options.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  const opticsHost = isOpticsPromoHost(hostname)

  if (opticsHost && (pathname === '/' || pathname === '/optica')) {
    return {
      ...OPTICS_LANDING_SEO,
      canonicalUrl: `${OPTICS_PROMO_SITE_URL}/`,
      robots: 'index, follow',
      ogImage: `${OPTICS_PROMO_SITE_URL}${OG_IMAGE_PATH}`,
      ogUrl: `${OPTICS_PROMO_SITE_URL}/`,
    }
  }

  const override = ROUTE_SEO_OVERRIDES[pathname]
  const base = override ?? DEFAULT_SEO
  const canonicalPath = pathname === '/' ? '' : pathname
  const siteUrl = pathname === '/optica' ? OPTICS_PROMO_SITE_URL : SITE_URL
  const canonicalUrl =
    pathname === '/optica' ? `${OPTICS_PROMO_SITE_URL}/` : `${SITE_URL}${canonicalPath}`

  return {
    ...base,
    canonicalUrl,
    robots: isPublicIndexedRoute(pathname) ? 'index, follow' : 'noindex, nofollow',
    ogImage: pathname === '/optica' ? `${siteUrl}${OG_IMAGE_PATH}` : OG_IMAGE_URL,
    ogUrl: canonicalUrl,
  }
}
