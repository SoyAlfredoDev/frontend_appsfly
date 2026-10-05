const PENDING_LOGIN_KEY = 'appsfly_login_announcement_pending'

/** Marca que tras este signin se deben evaluar anuncios (sobrevive al navigate). */
export function markLoginAnnouncementsPending() {
  try {
    sessionStorage.setItem(PENDING_LOGIN_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function getPendingLoginStamp() {
  try {
    return sessionStorage.getItem(PENDING_LOGIN_KEY)
  } catch {
    return null
  }
}

export function consumeLoginAnnouncementsPending() {
  try {
    const value = sessionStorage.getItem(PENDING_LOGIN_KEY)
    if (!value) return false
    sessionStorage.removeItem(PENDING_LOGIN_KEY)
    return true
  } catch {
    return false
  }
}

export function hasLoginAnnouncementsPending() {
  return Boolean(getPendingLoginStamp())
}

/**
 * Clave estable para un inicio de sesión.
 * Un cambio de ruta no debe generar otra clave: si lo hace, el anuncio vuelve a abrirse.
 */
export function getLoginAnnouncementKey(loginSessionKey: number, pendingStamp: string | null) {
  if (loginSessionKey > 0) return loginSessionKey
  if (!pendingStamp) return null
  const parsed = Number(pendingStamp)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}
