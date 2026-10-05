import { COMPANY } from '../constants/company'
import { LANDING_SOCIAL_LINKS } from '../constants/landingNavigation.js'
import { OPTICS_PROMO_SITE_URL } from '../utils/opticsPromoHost.js'
import { classifyRequestPath, normalizePath } from './hostRouting'

const trimTrailingSlash = (url: string) => url.replace(/\/$/, '')

const CANONICAL_SITE = 'https://appsfly.cl'

function resolveSiteUrl() {
  const env = import.meta.env ?? {}
  const configured = env.VITE_FRONTEND_URL?.trim()
  if (env.DEV) {
    return trimTrailingSlash(configured || 'http://127.0.0.1:5173')
  }

  // El dominio canónico de producción es fijo, incluso si una variable de
  // despliegue antigua todavía apunta a un alias.
  return CANONICAL_SITE
}

/** Host canónico. En desarrollo sigue la URL de Vite; en el build solo acepta HTTPS. */
export const SITE_URL = resolveSiteUrl()

export const OG_IMAGE_PATH = '/assets/seo/og-conversion.jpg'
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`

export const START_NET_MONTHLY_CLP = 24990
export const PRO_NET_MONTHLY_CLP = 39990
export const BASIC_NET_MONTHLY_CLP = START_NET_MONTHLY_CLP

export function formatClp(amount: number) {
  const body = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `$${body}`
}

export const PRICE_SUMMARY = `La prueba de 2 meses incluye Pro y no inicia un cobro. Start cuesta ${formatClp(START_NET_MONTHLY_CLP)} neto/mes y Pro ${formatClp(PRO_NET_MONTHLY_CLP)}, más IVA.`

export const HOME_H1 = 'AppsFly: sistema para registrar ventas en Chile'
export const HOME_LEAD =
  'AppsFly es un sistema para registrar ventas en Chile. Cada venta queda guardada con el producto o servicio, el monto y el medio de pago. Sirve para ópticas, minimarkets, restaurantes y comercios, y se usa desde computador, tablet o teléfono.'
export const HOME_SUPPORT =
  'No necesitas ser experto en tecnología. Si vendes todos los días —en una óptica, un mini market, un restaurante o tu propio emprendimiento— AppsFly te ayuda a llevar el registro de tus ventas sin complicaciones.'

export const OPTICS_H1 = 'El sistema pensado para tu óptica'
export const OPTICS_LEAD =
  'Recetas, ventas, órdenes de trabajo, laboratorios e inventario en un solo lugar. Prueba gratis o pide información sin compromiso.'

export const OPTICS_ARTICLE_H1 = 'Software para ópticas en Chile'
export const OPTICS_ARTICLE_LEAD =
  'AppsFly es un software para ópticas en Chile: registra la receta OD/OI, la venta, la orden de trabajo y el envío al laboratorio en el mismo sistema, con inventario de armazones, lentes y accesorios.'

export const PRICES_H1 = 'Precios de AppsFly'
export const PRICES_LEAD = `La prueba dura 2 meses, incluye las funciones de Pro y no inicia un cobro. Start cuesta ${formatClp(START_NET_MONTHLY_CLP)} neto al mes y Pro ${formatClp(PRO_NET_MONTHLY_CLP)}, más IVA.`

export const ABOUT_H1 = 'Sobre Nosotros'
export const ABOUT_LEAD =
  'Profesionales apasionados por la innovación y la creación de soluciones digitales que transforman negocios.'

export const TERMS_H1 = 'Términos y Condiciones'
export const TERMS_LEAD =
  'Por favor, lee detenidamente estos términos antes de utilizar nuestros servicios. Tu confianza y seguridad son nuestra prioridad.'

export const PRIVACY_H1 = 'Política de Privacidad'
export const PRIVACY_LEAD =
  'Transparencia total sobre cómo protegemos, aislamos y gestionamos tus datos.'

export const REGISTER_H1 = 'Crear cuenta nueva'
export const REGISTER_LEAD =
  'Prueba AppsFly 2 meses gratis, sin tarjeta de crédito. Al terminar no se inicia un cobro: hay que elegir un plan de pago.'

export type FaqEntry = {
  question: string
  answer: string
}

export type Highlight = {
  title: string
  text: string
}

export type PublicPage = {
  path: string
  title: string
  description: string
  h1: string
  lead: string
  paragraphs: string[]
  highlights: Highlight[]
  faqs: FaqEntry[]
  /** Canonical absoluto. */
  canonicalUrl: string
  index: boolean
}

const HOME_FAQS: FaqEntry[] = [
  {
    question: '¿Qué es AppsFly?',
    answer: HOME_LEAD,
  },
  {
    question: '¿Cuánto cuesta AppsFly?',
    answer: PRICE_SUMMARY,
  },
  {
    question: '¿AppsFly sirve para una óptica?',
    answer:
      'Sí. Además del registro de ventas, una óptica puede llevar recetas OD/OI, órdenes de trabajo, laboratorios e inventario de lentes y armazones. El detalle está en la página de software para ópticas.',
  },
  {
    question: '¿Hay prueba gratis?',
    answer:
      'Sí. La prueba Pro dura 2 meses, incluye las funciones de Pro y no pide tarjeta de crédito para crear la cuenta.',
  },
  {
    question: '¿Quién opera AppsFly y desde dónde?',
    answer: `${COMPANY.legalName}, RUT ${COMPANY.rut}, en ${COMPANY.address}. El contacto público es ${COMPANY.email} y ${COMPANY.phoneDisplay}.`,
  },
]

const OPTICS_FAQS: FaqEntry[] = [
  {
    question: '¿Qué es un software para ópticas?',
    answer: OPTICS_ARTICLE_LEAD,
  },
  {
    question: '¿AppsFly reemplaza la planilla de la óptica?',
    answer:
      'Reemplaza el registro diario de recetas, ventas, órdenes de trabajo, despachos a laboratorio y stock. No es un ERP contable completo: está pensado para la operación de la óptica.',
  },
  {
    question: '¿Puedo probar AppsFly en mi óptica antes de pagar?',
    answer:
      'Sí. La prueba Pro dura 2 meses, incluye las funciones de Pro y no pide tarjeta de crédito. También puedes pedir información por WhatsApp.',
  },
  {
    question: '¿El precio incluye boleta electrónica?',
    answer: `La boleta y la factura electrónica están en la prueba y en Pro. Start, a ${formatClp(START_NET_MONTHLY_CLP)} neto/mes más IVA, cubre la operación de la óptica sin esas funciones.`,
  },
]

const PRICE_FAQS: FaqEntry[] = [
  {
    question: '¿Cuál es el precio de Start?',
    answer: `Start cuesta ${formatClp(START_NET_MONTHLY_CLP)} neto al mes, más IVA, e incluye 1 usuario. La prueba de 2 meses cuesta $0, trae las funciones de Pro y no inicia un cobro al terminar.`,
  },
  {
    question: '¿Qué incluye Pro?',
    answer: `Pro cuesta ${formatClp(PRO_NET_MONTHLY_CLP)} neto al mes, más IVA, hasta 5 usuarios. Suma citas, boleta, factura electrónica y el asistente.`,
  },
  {
    question: '¿Los precios de AppsFly incluyen IVA?',
    answer: 'No. Los precios publicados son netos. Hay que sumar el IVA de Chile.',
  },
  {
    question: '¿Puedo cambiar de plan después de la prueba?',
    answer:
      'Sí. La prueba no se convierte sola en un cobro. Cuando termina, hay que contratar un plan de pago.',
  },
]

export const PUBLIC_PAGES: PublicPage[] = [
  {
    path: '/',
    title: 'AppsFly | Sistema para registrar ventas en Chile',
    description:
      'Sistema para registrar ventas, inventario y clientes en Chile. Prueba 2 meses sin cobro. Start desde $24.990 neto/mes + IVA.',
    h1: HOME_H1,
    lead: HOME_LEAD,
    paragraphs: [HOME_SUPPORT],
    highlights: [],
    faqs: HOME_FAQS,
    canonicalUrl: `${SITE_URL}/`,
    index: true,
  },
  {
    path: '/software-para-opticas',
    title: 'AppsFly | Software para ópticas en Chile',
    description:
      'Software para ópticas en Chile: recetas OD/OI, órdenes de trabajo, laboratorios, inventario y ventas. Prueba 2 meses gratis.',
    h1: OPTICS_ARTICLE_H1,
    lead: OPTICS_ARTICLE_LEAD,
    paragraphs: [
      'Está pensado para ópticas independientes que hoy juntan la receta, la venta y el laboratorio en planillas, papeles o chats. El recorrido queda en un solo lugar: cliente, receta, venta, orden de trabajo, laboratorio y entrega.',
      `${PRICE_SUMMARY} La landing de la óptica sigue disponible si quieres ver el flujo en pantalla.`,
    ],
    highlights: [
      {
        title: 'Recetas OD/OI',
        text: 'La graduación queda en la ficha del cliente y se puede consultar cuando vuelve.',
      },
      {
        title: 'Ventas ligadas a la receta',
        text: 'La venta guarda qué se cobró, cómo se pagó y a qué receta corresponde.',
      },
      {
        title: 'Órdenes de trabajo',
        text: 'La OT sale de la venta y se sigue hasta la entrega, sin un estado perdido en otra planilla.',
      },
      {
        title: 'Laboratorios',
        text: 'Despacho, recepción y lo que sigue en proceso quedan registrados con el trabajo.',
      },
      {
        title: 'Inventario de óptica',
        text: 'Armazones, lentes y accesorios con stock, precios y movimientos.',
      },
      {
        title: 'Reportes del local',
        text: 'Ventas, recaudación y movimiento del día para ver el negocio sin armar un Excel.',
      },
    ],
    faqs: OPTICS_FAQS,
    canonicalUrl: `${SITE_URL}/software-para-opticas`,
    index: true,
  },
  {
    path: '/precios',
    title: 'AppsFly | Precios de los planes',
    description: PRICE_SUMMARY,
    h1: PRICES_H1,
    lead: PRICES_LEAD,
    paragraphs: [
      'Start y Pro se contratan con el link de Mercado Pago. La prueba de 2 meses trae las funciones de Pro y no pide tarjeta.',
    ],
    highlights: [
      {
        title: 'Start',
        text: `${formatClp(START_NET_MONTHLY_CLP)} neto/mes + IVA. Un usuario y la operación diaria de la óptica.`,
      },
      {
        title: 'Pro',
        text: `${formatClp(PRO_NET_MONTHLY_CLP)} neto/mes + IVA. Hasta 5 usuarios, citas, boleta, factura y asistente.`,
      },
    ],
    faqs: PRICE_FAQS,
    canonicalUrl: `${SITE_URL}/precios`,
    index: true,
  },
  {
    path: '/optica',
    title: 'AppsFly Óptica | Sistema de gestión para ópticas en Chile',
    description: OPTICS_LEAD,
    h1: OPTICS_H1,
    lead: OPTICS_LEAD,
    paragraphs: [
      'De la receta a la entrega: cliente, venta, orden de trabajo y laboratorio en el mismo recorrido.',
    ],
    highlights: [],
    faqs: OPTICS_FAQS,
    canonicalUrl: `${OPTICS_PROMO_SITE_URL}/`,
    index: true,
  },
  {
    path: '/about-us',
    title: 'AppsFly | Plataforma de gestión para negocios',
    description: `Conoce ${COMPANY.tradeName}: ${COMPANY.legalName}, software chileno para registrar ventas y operar ópticas y comercios.`,
    h1: ABOUT_H1,
    lead: ABOUT_LEAD,
    paragraphs: [`${COMPANY.legalName}, RUT ${COMPANY.rut}, con domicilio en ${COMPANY.address}.`],
    highlights: [],
    faqs: [],
    canonicalUrl: `${SITE_URL}/about-us`,
    index: true,
  },
  {
    path: '/terminos',
    title: 'AppsFly | Términos y Condiciones',
    description: 'Términos y condiciones de uso del servicio AppsFly.',
    h1: TERMS_H1,
    lead: TERMS_LEAD,
    paragraphs: [],
    highlights: [],
    faqs: [],
    canonicalUrl: `${SITE_URL}/terminos`,
    index: true,
  },
  {
    path: '/politicas',
    title: 'AppsFly | Política de Privacidad',
    description: 'Política de privacidad y tratamiento de datos en AppsFly.',
    h1: PRIVACY_H1,
    lead: PRIVACY_LEAD,
    paragraphs: [],
    highlights: [],
    faqs: [],
    canonicalUrl: `${SITE_URL}/politicas`,
    index: true,
  },
  {
    path: '/register',
    title: 'AppsFly | Regístrate — Prueba gratis 2 meses',
    description: REGISTER_LEAD,
    h1: REGISTER_H1,
    lead: REGISTER_LEAD,
    paragraphs: [],
    highlights: [],
    faqs: [],
    canonicalUrl: `${SITE_URL}/register`,
    index: true,
  },
]

export const INDEXABLE_PATHS = new Set(PUBLIC_PAGES.map((page) => page.path))

const AI_AGENTS = [
  '*',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
] as const

const ROBOTS_DISALLOW = [
  '/admin',
  '/dashboard',
  '/login',
  '/logout',
  '/forgot-password',
  '/reset-password',
  '/appointments',
  '/customers',
  '/campaigns-asmr',
  '/products_services',
  '/products',
  '/inventory',
  '/sales',
  '/quotations',
  '/purchase',
  '/purchase-certificates',
  '/providers',
  '/laboratories',
  '/work-orders',
  '/lab-dispatches',
  '/daily-sales',
  '/users',
  '/profile',
  '/transactions',
  '/expenses',
  '/reports',
  '/billing',
  '/configuration',
  '/finance',
  '/support',
  '/business',
  '/subscription',
  '/prospect-unsubscribe',
  '/public',
  '/registarcita',
  '/app.html',
]

export function requirePublicPage(path: string) {
  const page = PUBLIC_PAGES.find((item) => item.path === path)
  if (!page) throw new Error(`Missing public page ${path}`)
  return page
}

export function pageForPath(pathname: string, hostname = '') {
  const host = hostname.toLowerCase().split(':')[0]
  const opticsHost =
    host === 'optica.appsfly.app' || host === 'optica.localhost' || host === 'optica.127.0.0.1'
  if (opticsHost && (pathname === '/' || pathname === '/optica')) {
    return PUBLIC_PAGES.find((page) => page.path === '/optica') ?? null
  }
  return PUBLIC_PAGES.find((page) => page.path === pathname) ?? null
}

export function isPublicIndexedRoute(pathname: string, hostname = '') {
  return pageForPath(pathname, hostname)?.index === true
}

type SeoMeta = {
  title: string
  description: string
  keywords: string
  robots: string
  twitterCard: string
  ogType: string
  ogUrl: string
  ogImage: string
  siteName: string
  locale: string
  canonicalUrl: string
}

/** Rutas más específicas primero para que el prefijo coincida correctamente. */
const APP_ROUTE_TITLES: ReadonlyArray<{ prefix: string; title: string }> = [
  { prefix: '/configuration/subscription', title: 'Suscripción' },
  { prefix: '/subscription/payment/return', title: 'Pago de suscripción' },
  { prefix: '/sales/dailySales', title: 'Cierres diarios' },
  { prefix: '/sales/quick', title: 'Caja rápida' },
  { prefix: '/sales/register', title: 'Registrar venta' },
  { prefix: '/sales/view', title: 'Ver venta' },
  { prefix: '/quotations/register', title: 'Nueva cotización' },
  { prefix: '/quotations/view', title: 'Ver cotización' },
  { prefix: '/purchase/register', title: 'Registrar compra' },
  { prefix: '/purchase/view', title: 'Ver compra' },
  { prefix: '/purchase-certificates', title: 'Certificados de compra' },
  { prefix: '/lab-dispatches', title: 'Despachos lab' },
  { prefix: '/work-orders', title: 'Órdenes de trabajo' },
  { prefix: '/daily-sales/view', title: 'Ver cierre diario' },
  { prefix: '/products_services', title: 'Productos' },
  { prefix: '/campaigns-asmr', title: 'Campaña ASMR' },
  { prefix: '/forgot-password', title: 'Recuperar contraseña' },
  { prefix: '/reset-password', title: 'Restablecer contraseña' },
  { prefix: '/prospect-unsubscribe', title: 'Cancelar suscripción' },
  { prefix: '/public/receipt', title: 'Comprobante' },
  { prefix: '/business/register', title: 'Registrar negocio' },
  { prefix: '/users/userGuest', title: 'Invitar usuario' },
  { prefix: '/admin/dashboard', title: 'Admin — Dashboard' },
  { prefix: '/admin/users', title: 'Admin — Usuarios' },
  { prefix: '/admin/subscriptions', title: 'Admin — Suscripciones' },
  { prefix: '/admin/payments', title: 'Admin — Pagos' },
  { prefix: '/admin/businesses', title: 'Admin — Empresas' },
  { prefix: '/admin/plans', title: 'Admin — Planes' },
  { prefix: '/admin/tickets', title: 'Admin — Tickets' },
  { prefix: '/admin/email-campaigns', title: 'Admin — Campañas' },
  { prefix: '/admin/email-prospects', title: 'Admin — Prospectos' },
  { prefix: '/admin/notifications', title: 'Admin — Notificaciones' },
  { prefix: '/admin/agent-tasks', title: 'Admin — Tareas' },
  { prefix: '/profile', title: 'Mi perfil' },
  { prefix: '/dashboard', title: 'Dashboard' },
  { prefix: '/appointments', title: 'Citas' },
  { prefix: '/customers', title: 'Clientes' },
  { prefix: '/inventory', title: 'Inventario' },
  { prefix: '/sales', title: 'Ventas' },
  { prefix: '/quotations', title: 'Cotizaciones' },
  { prefix: '/purchase', title: 'Compras' },
  { prefix: '/providers', title: 'Proveedores' },
  { prefix: '/laboratories', title: 'Laboratorios' },
  { prefix: '/daily-sales', title: 'Cierres diarios' },
  { prefix: '/users', title: 'Usuarios' },
  { prefix: '/transactions', title: 'Transacciones' },
  { prefix: '/expenses', title: 'Gastos' },
  { prefix: '/reports', title: 'Reportes' },
  { prefix: '/billing', title: 'Facturación' },
  { prefix: '/configuration', title: 'Configuración' },
  { prefix: '/finance', title: 'Finanzas' },
  { prefix: '/support', title: 'Soporte' },
  { prefix: '/login', title: 'Iniciar sesión' },
  { prefix: '/logout', title: 'Cerrar sesión' },
  { prefix: '/subscription', title: 'Suscripción' },
  { prefix: '/products', title: 'Productos' },
  { prefix: '/admin', title: 'Administración' },
  { prefix: '/public', title: 'AppsFly' },
]

function matchesAppRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function resolveAppRouteTitle(pathname: string) {
  const path = normalizePath(pathname)
  for (const route of APP_ROUTE_TITLES) {
    if (matchesAppRoutePrefix(path, route.prefix)) {
      return `${route.title} | AppsFly`
    }
  }
  return 'AppsFly'
}

function buildNoindexSeo(pathname: string, title: string, description: string): SeoMeta {
  const path = normalizePath(pathname)
  const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`
  return {
    title,
    description,
    keywords: 'appsfly',
    robots: 'noindex, nofollow',
    twitterCard: 'summary_large_image',
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogImage: OG_IMAGE_URL,
    siteName: 'AppsFly',
    locale: 'es_CL',
    canonicalUrl,
  }
}

export function resolveSeoForPath(pathname: string, options: { hostname?: string } = {}) {
  const hostname = options.hostname ?? ''
  if (pathname === '/registarcita' || pathname.startsWith('/registarcita/')) {
    return {
      title: 'Agendar cita | AppsFly',
      description: 'Elige un día y una hora para solicitar una cita.',
      keywords: 'appsfly, agendar cita',
      robots: 'noindex, nofollow',
      twitterCard: 'summary_large_image',
      ogType: 'website',
      ogUrl: `${SITE_URL}${pathname}`,
      ogImage: OG_IMAGE_URL,
      siteName: 'AppsFly',
      locale: 'es_CL',
      canonicalUrl: `${SITE_URL}${pathname}`,
    }
  }
  const page = pageForPath(pathname, hostname)
  if (!page) {
    if (classifyRequestPath(pathname) === 'app') {
      return buildNoindexSeo(pathname, resolveAppRouteTitle(pathname), 'Panel privado de AppsFly.')
    }

    return buildNoindexSeo(
      pathname,
      'Página no encontrada | AppsFly',
      'Esta dirección no existe en AppsFly.',
    )
  }

  return {
    title: page.title,
    description: page.description,
    keywords: 'appsfly, sistema para registrar ventas, software para ópticas chile',
    robots: 'index, follow',
    twitterCard: 'summary_large_image',
    ogType: 'website',
    ogUrl: page.canonicalUrl,
    ogImage: page.path === '/optica' ? `${OPTICS_PROMO_SITE_URL}${OG_IMAGE_PATH}` : OG_IMAGE_URL,
    siteName: page.path === '/optica' ? 'AppsFly Óptica' : 'AppsFly',
    locale: 'es_CL',
    canonicalUrl: page.canonicalUrl,
  }
}

export function sitemapLocs() {
  const locs = new Set<string>()
  for (const page of PUBLIC_PAGES) {
    if (page.index) locs.add(page.canonicalUrl)
  }
  return [...locs]
}

export function buildRobotsTxt() {
  const rules = ['Allow: /', ...ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`)]
  const groups = AI_AGENTS.map((agent) => [`User-agent: ${agent}`, ...rules].join('\n'))
  return `${groups.join('\n\n')}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
}

export function buildSitemapXml() {
  const urls = sitemapLocs()
    .map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function buildLlmsTxt() {
  const lines = [
    '# AppsFly',
    '',
    `> ${HOME_LEAD} Lo opera ${COMPANY.legalName} (RUT ${COMPANY.rut}), en ${COMPANY.address}.`,
    '',
    '## Páginas para citar',
    ...PUBLIC_PAGES.filter((page) => page.path !== '/optica').map(
      (page) => `- [${page.h1}](${page.canonicalUrl}): ${page.description}`,
    ),
    `- [Óptica](${OPTICS_PROMO_SITE_URL}/): ${OPTICS_LEAD}`,
    '',
    '## Precios',
    `- Prueba: 2 meses a $0 con las funciones de Pro, sin tarjeta y sin cobro automático.`,
    `- Start: ${formatClp(START_NET_MONTHLY_CLP)} CLP netos al mes, más IVA. 1 usuario.`,
    `- Pro: ${formatClp(PRO_NET_MONTHLY_CLP)} CLP netos al mes, más IVA. Hasta 5 usuarios, citas, boleta, factura y asistente.`,
    '',
    '## Contacto',
    `- Razón social: ${COMPANY.legalName}`,
    `- RUT: ${COMPANY.rut}`,
    `- Dirección: ${COMPANY.address}`,
    `- Email: ${COMPANY.email}`,
    `- Teléfono: ${COMPANY.phoneDisplay}`,
    '',
    '## Perfiles',
    ...LANDING_SOCIAL_LINKS.map((social) => `- ${social.label}: ${social.href}`),
    '',
  ]
  return lines.join('\n')
}

export function buildJsonLd(page: PublicPage) {
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: COMPANY.tradeName,
    legalName: COMPANY.legalName,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/iconoAppsfly.png`,
    email: COMPANY.email,
    telephone: COMPANY.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address,
      addressCountry: 'CL',
    },
    sameAs: LANDING_SOCIAL_LINKS.map((social) => social.href),
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'AppsFly',
    url: `${SITE_URL}/`,
    inLanguage: 'es-CL',
    publisher: { '@id': `${SITE_URL}/#organization` },
  }

  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: `${SITE_URL}/`,
      },
      ...(page.path === '/'
        ? []
        : [
            {
              '@type': 'ListItem',
              position: 2,
              name: page.h1,
              item: page.canonicalUrl,
            },
          ]),
    ],
  }

  const graph: Record<string, unknown>[] = [organization, website, breadcrumbs]

  if (page.path === '/' || page.path === '/precios' || page.path === '/software-para-opticas') {
    graph.push({
      '@type': 'SoftwareApplication',
      name: 'AppsFly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: page.canonicalUrl,
      inLanguage: 'es-CL',
      offers: [
        {
          '@type': 'Offer',
          name: 'Prueba',
          price: '0',
          priceCurrency: 'CLP',
          description: '2 meses sin tarjeta y sin cobro automático.',
          url: `${SITE_URL}/precios`,
        },
        {
          '@type': 'Offer',
          name: 'Start',
          price: String(START_NET_MONTHLY_CLP),
          priceCurrency: 'CLP',
          description: 'Precio neto mensual, más IVA. 1 usuario.',
          url: `${SITE_URL}/precios`,
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: String(PRO_NET_MONTHLY_CLP),
          priceCurrency: 'CLP',
          description: 'Precio neto mensual, más IVA. Hasta 5 usuarios.',
          url: `${SITE_URL}/precios`,
        },
      ],
      provider: { '@id': `${SITE_URL}/#organization` },
    })
  }

  if (page.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function escapeHtml(value: string) {
  return escapeXml(value)
}
