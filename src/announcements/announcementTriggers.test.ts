import { describe, expect, it } from 'vitest'
import { getLoginAnnouncementKey } from './announcementTriggers'

describe('getLoginAnnouncementKey', () => {
  it('uses the login session when the user just signed in', () => {
    expect(getLoginAnnouncementKey(2, '1710000000000')).toBe(2)
  })

  it('reuses the pending stamp after a reload, instead of minting a new key', () => {
    expect(getLoginAnnouncementKey(0, '1710000000000')).toBe(1710000000000)
  })

  it('does not schedule an announcement without a login or a pending stamp', () => {
    expect(getLoginAnnouncementKey(0, null)).toBeNull()
    expect(getLoginAnnouncementKey(0, 'nope')).toBeNull()
  })
})
