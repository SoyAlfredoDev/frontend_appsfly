import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  dismissAnnouncementForever,
  hydrateServerDismissals,
  isAnnouncementDismissedForever,
  resetAnnouncementStorageForTests,
} from './announcementStorage'

function clearCookies() {
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; Max-Age=0; Path=/`
    }
  })
}

describe('announcementStorage', () => {
  afterEach(() => {
    localStorage.clear()
    resetAnnouncementStorageForTests()
    clearCookies()
    vi.restoreAllMocks()
  })

  it('hides an announcement after it is dismissed forever', () => {
    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(false)

    expect(dismissAnnouncementForever('pwa-install-v2')).toBe(true)

    resetAnnouncementStorageForTests()
    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(true)
    expect(localStorage.getItem('appsfly_announcement_pwa-install-v2_forever')).toBe('1')
  })

  it('stores dismissals per user account', () => {
    dismissAnnouncementForever('pwa-install-v2', { userId: 'user-a' })

    resetAnnouncementStorageForTests()
    expect(isAnnouncementDismissedForever('pwa-install-v2', { userId: 'user-a' })).toBe(true)
    expect(isAnnouncementDismissedForever('pwa-install-v2', { userId: 'user-b' })).toBe(false)
    expect(
      localStorage.getItem('appsfly_announcement_user_user-a_pwa-install-v2_forever'),
    ).toBe('1')
  })

  it('keeps a dismissal that was saved before this version', () => {
    localStorage.setItem('appsfly_announcement_pwa-install-v2_forever', '1')

    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(true)
  })

  it('honors dismissals synced from the server', () => {
    hydrateServerDismissals('user-a', ['pwa-install-v2'])
    expect(isAnnouncementDismissedForever('pwa-install-v2', { userId: 'user-a' })).toBe(true)
  })

  it('keeps the dismissal when localStorage rejects the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(dismissAnnouncementForever('pwa-install-v2')).toBe(true)

    resetAnnouncementStorageForTests()
    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(true)
  })
})
