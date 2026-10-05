const appEnv = import.meta.env.PROD ? 'production' : 'development'
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

const PRODUCTION_API_DEFAULT = 'https://api.appsfly.cl/api'
const PRODUCTION_FRONTEND_DEFAULT = 'https://appsfly.cl'
const STALE_API_HOSTS = new Set(['backend-appsfly.vercel.app'])

export function resolveProductionApiUrl(configured) {
  const value = configured?.trim()
  if (!value) return PRODUCTION_API_DEFAULT

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || STALE_API_HOSTS.has(url.hostname)) {
      return PRODUCTION_API_DEFAULT
    }

    url.pathname = url.pathname.replace(/\/$/, '')
    return url.toString().replace(/\/$/, '')
  } catch {
    return PRODUCTION_API_DEFAULT
  }
}

function resolveFrontendUrl() {
  const configured = import.meta.env.VITE_FRONTEND_URL?.trim()

  if (isDevelopment) {
    return configured || 'http://127.0.0.1:5173'
  }

  try {
    const url = new URL(configured || PRODUCTION_FRONTEND_DEFAULT)
    if (url.protocol !== 'https:') {
      throw new Error('VITE_FRONTEND_URL debe usar HTTPS en producción.')
    }
    return url.toString().replace(/\/$/, '')
  } catch {
    console.error(
      '[AppsFly] VITE_FRONTEND_URL inválida para producción; usando el dominio canónico.',
    )
    return PRODUCTION_FRONTEND_DEFAULT
  }
}

const config = {
  appEnv,
  isDevelopment,
  isProduction,
  // En desarrollo, Vite enruta /api al backend IPv4 configurado.
  apiUrl: isDevelopment ? '/api' : resolveProductionApiUrl(import.meta.env.VITE_API_URL),
  frontendUrl: resolveFrontendUrl(),
}

if (import.meta.env.VITE_APP_ENV && import.meta.env.VITE_APP_ENV !== appEnv) {
  console.warn(
    `[AppsFly] VITE_APP_ENV=${import.meta.env.VITE_APP_ENV} no coincide con el modo de Vite (${appEnv}); se usará el modo de Vite.`,
  )
}

export default config
