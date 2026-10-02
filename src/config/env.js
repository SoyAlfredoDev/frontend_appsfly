const appEnv = import.meta.env.PROD ? 'production' : 'development'
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

const PRODUCTION_API_DEFAULT = 'https://api.appsfly.cl/api'
const PRODUCTION_FRONTEND_DEFAULT = 'https://appsfly.cl'

function resolveProductionApiUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (!configured) return PRODUCTION_API_DEFAULT

  try {
    const url = new URL(configured)
    if (url.protocol !== 'https:') {
      throw new Error('VITE_API_URL debe usar HTTPS en producción.')
    }

    url.pathname = url.pathname.replace(/\/$/, '')
    return url.toString().replace(/\/$/, '')
  } catch {
    console.error('[AppsFly] VITE_API_URL inválida para producción; usando la API canónica.')
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
  apiUrl: isDevelopment ? '/api' : resolveProductionApiUrl(),
  frontendUrl: resolveFrontendUrl(),
}

if (import.meta.env.VITE_APP_ENV && import.meta.env.VITE_APP_ENV !== appEnv) {
  console.warn(
    `[AppsFly] VITE_APP_ENV=${import.meta.env.VITE_APP_ENV} no coincide con el modo de Vite (${appEnv}); se usará el modo de Vite.`,
  )
}

export default config
