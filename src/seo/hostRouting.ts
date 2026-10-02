import { INDEXABLE_PATHS } from './publicSeo'

/** Prefijos de la aplicación autenticada. Una ruta nueva en App.jsx tiene que entrar aquí. */
export const APP_PATH_PREFIXES = [
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
] as const

export const CANONICAL_ORIGIN = 'https://appsfly.app'
export const ALIAS_HOSTS = ['www.appsfly.app', 'appsfly.cl', 'www.appsfly.cl'] as const
export const OPTICS_HOST = 'optica.appsfly.app'

export type RequestClass = 'static' | 'app' | 'unknown'

export function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') return '/'
  const withoutQuery = pathname.split('?')[0] ?? '/'
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1)
  }
  return withoutQuery
}

export function classifyRequestPath(pathname: string): RequestClass {
  const path = normalizePath(pathname)
  if (path === '/') return 'static'
  if (/\.[a-z0-9]+$/i.test(path)) return 'static'
  if (INDEXABLE_PATHS.has(path)) return 'static'
  if (APP_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return 'app'
  }
  return 'unknown'
}

export function aliasRedirectTarget(hostname: string, pathname: string, search = '') {
  const host = hostname.toLowerCase().split(':')[0]
  if (!ALIAS_HOSTS.includes(host as (typeof ALIAS_HOSTS)[number])) return null
  return `${CANONICAL_ORIGIN}${normalizePath(pathname)}${search}`
}

export function opticsHomeRewritePath(hostname: string, pathname: string) {
  const host = hostname.toLowerCase().split(':')[0]
  if (host === OPTICS_HOST && normalizePath(pathname) === '/') return '/optica/index.html'
  return null
}

export function unknownPathHtml() {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Página no encontrada | AppsFly</title>
</head>
<body>
  <main>
    <h1>No encontramos esta página</h1>
    <p>La dirección no existe en AppsFly.</p>
    <p><a href="${CANONICAL_ORIGIN}/">Ir al inicio</a></p>
  </main>
</body>
</html>
`
}
