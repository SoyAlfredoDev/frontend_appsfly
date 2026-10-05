import { describe, expect, it } from 'vitest'
import { resolveProductionApiUrl } from './env.js'

describe('resolveProductionApiUrl', () => {
  it('uses the canonical API when production has no override', () => {
    expect(resolveProductionApiUrl(undefined)).toBe('https://api.appsfly.cl/api')
    expect(resolveProductionApiUrl('   ')).toBe('https://api.appsfly.cl/api')
  })

  it('ignores the retired Vercel hostname that does not expose expense categories', () => {
    expect(resolveProductionApiUrl('https://backend-appsfly.vercel.app/api')).toBe(
      'https://api.appsfly.cl/api',
    )
  })

  it('keeps another valid HTTPS API URL', () => {
    expect(resolveProductionApiUrl('https://api.appsfly.cl/api/')).toBe(
      'https://api.appsfly.cl/api',
    )
  })

  it('rejects a non-HTTPS override', () => {
    expect(resolveProductionApiUrl('http://api.appsfly.cl/api')).toBe('https://api.appsfly.cl/api')
  })
})
