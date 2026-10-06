import { afterEach, describe, expect, it } from 'vitest'
import { dismissAnnouncementForever, resetAnnouncementStorageForTests } from './announcementStorage'
import { resolveLoginAnnouncement } from './loginAnnouncements'

function clearCookies() {
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; Max-Age=0; Path=/`
    }
  })
}

describe('resolveLoginAnnouncement', () => {
  afterEach(() => {
    localStorage.clear()
    resetAnnouncementStorageForTests()
    clearCookies()
  })

  it('offers the install announcement when the app is not installed', () => {
    expect(resolveLoginAnnouncement({ isPwaInstalled: false })?.id).toBe('pwa-install-v2')
  })

  it('skips the install announcement when AppsFly already runs as an app', () => {
    expect(resolveLoginAnnouncement({ isPwaInstalled: true })).toBeNull()
  })

  it('does not show the publication again after the client dismisses it', () => {
    dismissAnnouncementForever('pwa-install-v2', { userId: 'user-a' })

    expect(resolveLoginAnnouncement({ isPwaInstalled: false }, { userId: 'user-a' })).toBeNull()
  })

  it('honors a dismissal saved under an older id of the same publication', () => {
    localStorage.setItem('appsfly_announcement_pwa-install_forever', '1')

    expect(resolveLoginAnnouncement({ isPwaInstalled: false })).toBeNull()
  })
})
