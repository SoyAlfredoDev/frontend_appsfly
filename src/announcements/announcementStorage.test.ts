import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  dismissAnnouncementForever,
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

  it('keeps a dismissal that was saved before this version', () => {
    localStorage.setItem('appsfly_announcement_pwa-install-v2_forever', '1')

    expect(isAnnouncementDismissedForever('pwa-install-v2')).toBe(true)
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
