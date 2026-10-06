const STORAGE_PREFIX = 'appsfly_announcement_'
const DISMISS_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10

export type AnnouncementStorageScope = {
  userId?: string | null
}

const memoryDismissed = new Set<string>()
const serverDismissedByUser = new Map<string, Set<string>>()

function normalizeUserId(userId?: string | null) {
  const normalized = userId?.trim()
  return normalized ? normalized : null
}

function memoryKey(announcementId: string, scope?: AnnouncementStorageScope) {
  const userId = normalizeUserId(scope?.userId)
  return userId ? `${userId}:${announcementId}` : announcementId
}

function legacyStorageKey(announcementId: string) {
  return `${STORAGE_PREFIX}${announcementId}_forever`
}

function scopedStorageKey(announcementId: string, scope?: AnnouncementStorageScope) {
  const userId = normalizeUserId(scope?.userId)
  if (userId) {
    return `${STORAGE_PREFIX}user_${userId}_${announcementId}_forever`
  }
  return legacyStorageKey(announcementId)
}

function cookieName(announcementId: string, scope?: AnnouncementStorageScope) {
  const userId = normalizeUserId(scope?.userId)
  if (userId) {
    return `${STORAGE_PREFIX}user_${userId}_${announcementId}_forever`
  }
  return `${STORAGE_PREFIX}${announcementId}_forever`
}

function versionStorageKey(announcementId: string, scope?: AnnouncementStorageScope) {
  const userId = normalizeUserId(scope?.userId)
  if (userId) {
    return `${STORAGE_PREFIX}user_${userId}_${announcementId}_version`
  }
  return `${STORAGE_PREFIX}${announcementId}_version`
}

function readLocalDismissal(announcementId: string, scope?: AnnouncementStorageScope) {
  const keys = [scopedStorageKey(announcementId, scope)]
  if (scope?.userId) {
    keys.push(legacyStorageKey(announcementId))
  }

  try {
    return keys.some((key) => localStorage.getItem(key) === '1')
  } catch {
    return false
  }
}

function writeLocalDismissal(announcementId: string, scope?: AnnouncementStorageScope) {
  try {
    localStorage.setItem(scopedStorageKey(announcementId, scope), '1')
    return readLocalDismissal(announcementId, scope)
  } catch {
    return false
  }
}

function readCookieDismissal(announcementId: string, scope?: AnnouncementStorageScope) {
  if (typeof document === 'undefined') return false

  const targets = [cookieName(announcementId, scope)]
  if (scope?.userId) {
    targets.push(cookieName(announcementId))
  }

  return targets.some((target) =>
    document.cookie.split(';').some((part) => part.trim() === `${target}=1`),
  )
}

function writeCookieDismissal(announcementId: string, scope?: AnnouncementStorageScope) {
  if (typeof document === 'undefined') return false

  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  const cookieValue = `${cookieName(announcementId, scope)}=1; Max-Age=${DISMISS_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
  document.cookie = cookieValue

  if (scope?.userId) {
    const legacyCookie = `${cookieName(announcementId)}=1; Max-Age=${DISMISS_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
    document.cookie = legacyCookie
  }

  return readCookieDismissal(announcementId, scope)
}

function isServerDismissed(announcementId: string, scope?: AnnouncementStorageScope) {
  const userId = normalizeUserId(scope?.userId)
  if (!userId) return false
  return serverDismissedByUser.get(userId)?.has(announcementId) ?? false
}

/** Sincroniza descartes guardados en el servidor para este usuario. */
export function hydrateServerDismissals(userId: string, announcementIds: string[]) {
  const normalizedUserId = normalizeUserId(userId)
  if (!normalizedUserId) return

  const next = new Set(
    announcementIds.map((id) => id?.trim()).filter((id): id is string => Boolean(id)),
  )
  serverDismissedByUser.set(normalizedUserId, next)

  next.forEach((announcementId) => {
    memoryDismissed.add(memoryKey(announcementId, { userId: normalizedUserId }))
  })
}

export function addServerDismissal(userId: string, announcementId: string) {
  const normalizedUserId = normalizeUserId(userId)
  const normalizedAnnouncementId = announcementId?.trim()
  if (!normalizedUserId || !normalizedAnnouncementId) return

  const current = serverDismissedByUser.get(normalizedUserId) ?? new Set<string>()
  current.add(normalizedAnnouncementId)
  serverDismissedByUser.set(normalizedUserId, current)
  memoryDismissed.add(memoryKey(normalizedAnnouncementId, { userId: normalizedUserId }))
}

/** El usuario eligió no volver a ver este anuncio. */
export function isAnnouncementDismissedForever(
  announcementId: string,
  scope?: AnnouncementStorageScope,
) {
  if (!announcementId) return false

  const key = memoryKey(announcementId, scope)
  if (memoryDismissed.has(key)) return true
  if (isServerDismissed(announcementId, scope)) {
    memoryDismissed.add(key)
    return true
  }
  if (readLocalDismissal(announcementId, scope) || readCookieDismissal(announcementId, scope)) {
    memoryDismissed.add(key)
    return true
  }
  return false
}

export function dismissAnnouncementForever(
  announcementId: string,
  scope?: AnnouncementStorageScope,
) {
  if (!announcementId) return false

  memoryDismissed.add(memoryKey(announcementId, scope))

  const durable =
    writeLocalDismissal(announcementId, scope) || writeCookieDismissal(announcementId, scope)

  if (scope?.userId) {
    addServerDismissal(scope.userId, announcementId)
  }

  return durable || isAnnouncementDismissedForever(announcementId, scope)
}

/** Útil para futuros anuncios con versión (mostrar de nuevo solo si el equipo lo publica así). */
export function getAnnouncementSeenVersion(
  announcementId: string,
  scope?: AnnouncementStorageScope,
) {
  try {
    return localStorage.getItem(versionStorageKey(announcementId, scope)) || null
  } catch {
    return null
  }
}

export function markAnnouncementSeenVersion(
  announcementId: string,
  version: string,
  scope?: AnnouncementStorageScope,
) {
  try {
    localStorage.setItem(versionStorageKey(announcementId, scope), String(version))
  } catch {
    // ignore
  }
}

export function resetAnnouncementStorageForTests() {
  memoryDismissed.clear()
  serverDismissedByUser.clear()
}
