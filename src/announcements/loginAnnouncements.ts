import type { ComponentType } from 'react'
import PwaInstallAnnouncementContent from '../components/announcements/content/PwaInstallAnnouncementContent'
import {
  type AnnouncementStorageScope,
  isAnnouncementDismissedForever,
} from './announcementStorage'

export type AnnouncementContentProps = {
  canNativeInstall: boolean
  showIosHint: boolean
  onInstall: () => void
}

export type LoginAnnouncementContext = {
  isPwaInstalled: boolean
}

export type LoginAnnouncement = {
  id: string
  /** Cualquiera de estas claves oculta el anuncio. Incluye ids viejos ya descartados. */
  dismissalKeys: string[]
  version: string
  priority: number
  trigger: 'login'
  imageSrc: string
  imageAlt: string
  shouldShow: (context: LoginAnnouncementContext) => boolean
  Content: ComponentType<AnnouncementContentProps>
}

/**
 * Anuncios que se evalúan tras cada inicio de sesión exitoso.
 * Orden: menor priority = se muestra primero.
 */
export const LOGIN_ANNOUNCEMENTS: LoginAnnouncement[] = [
  {
    id: 'pwa-install-v2',
    dismissalKeys: ['pwa-install', 'pwa-install-v1', 'pwa-install-v2'],
    version: '2',
    priority: 10,
    trigger: 'login',
    imageSrc: '/announcements/pwa-install-hero.jpg',
    imageAlt: 'Teléfono con el icono de AppsFly en la pantalla de inicio',
    shouldShow: ({ isPwaInstalled }) => !isPwaInstalled,
    Content: PwaInstallAnnouncementContent,
  },
]

function isDismissed(announcement: LoginAnnouncement, scope?: AnnouncementStorageScope) {
  const keys =
    announcement.dismissalKeys.length > 0 ? announcement.dismissalKeys : [announcement.id]
  return keys.some((key) => isAnnouncementDismissedForever(key, scope))
}

export function resolveLoginAnnouncement(
  context: LoginAnnouncementContext = { isPwaInstalled: false },
  scope?: AnnouncementStorageScope,
) {
  const eligible = LOGIN_ANNOUNCEMENTS.filter((item) => item.trigger === 'login')
    .filter((item) => !isDismissed(item, scope))
    .filter((item) => {
      try {
        return item.shouldShow(context) !== false
      } catch {
        return false
      }
    })
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))

  return eligible[0] ?? null
}
