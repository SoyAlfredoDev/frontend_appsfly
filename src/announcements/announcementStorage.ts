const STORAGE_PREFIX = 'appsfly_announcement_'
const DISMISS_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10

const memoryDismissed = new Set<string>()

function storageKey(announcementId: string, suffix: string) {
  return `${STORAGE_PREFIX}${announcementId}_${suffix}`
}

function cookieName(announcementId: string) {
  return `${STORAGE_PREFIX}${announcementId}_forever`
}

function readLocalDismissal(announcementId: string) {
  try {
    return localStorage.getItem(storageKey(announcementId, 'forever')) === '1'
  } catch {
    return false
  }
}

function readCookieDismissal(announcementId: string) {
  if (typeof document === 'undefined') return false
  const target = `${cookieName(announcementId)}=1`
  return document.cookie.split(';').some((part) => part.trim() === target)
}

function writeCookieDismissal(announcementId: string) {
  if (typeof document === 'undefined') return false
  document.cookie = `${cookieName(announcementId)}=1; Max-Age=${DISMISS_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
  return readCookieDismissal(announcementId)
}

/** El usuario eligió no volver a ver este anuncio. */
export function isAnnouncementDismissedForever(announcementId: string) {
  if (!announcementId) return false
  if (memoryDismissed.has(announcementId)) return true
  if (readLocalDismissal(announcementId) || readCookieDismissal(announcementId)) {
    memoryDismissed.add(announcementId)
    return true
  }
  return false
}

export function dismissAnnouncementForever(announcementId: string) {
  if (!announcementId) return false
  memoryDismissed.add(announcementId)

  try {
    localStorage.setItem(storageKey(announcementId, 'forever'), '1')
  } catch {
    // localStorage can be blocked. The cookie and the in-memory set still hide it.
  }

  writeCookieDismissal(announcementId)
  return isAnnouncementDismissedForever(announcementId)
}

/** Útil para futuros anuncios con versión (mostrar de nuevo solo si el equipo lo publica así). */
export function getAnnouncementSeenVersion(announcementId: string) {
  try {
    return localStorage.getItem(storageKey(announcementId, 'version')) || null
  } catch {
    return null
  }
}

export function markAnnouncementSeenVersion(announcementId: string, version: string) {
  try {
    localStorage.setItem(storageKey(announcementId, 'version'), String(version))
  } catch {
    // ignore
  }
}

export function resetAnnouncementStorageForTests() {
  memoryDismissed.clear()
}
