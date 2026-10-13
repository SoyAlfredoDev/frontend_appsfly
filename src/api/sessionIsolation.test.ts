import { beforeEach, describe, expect, it } from 'vitest'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import api from './axios.js'

describe('HTTP session isolation', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  it.each(['token', 'tenant'])('rejects a late response after a %s change', async (kind) => {
    localStorage.setItem('token', 'user-a')
    sessionStorage.setItem('appsfly_business_id', 'tenant-a')
    let finish!: (response: AxiosResponse) => void
    let config!: InternalAxiosRequestConfig
    const adapter: AxiosAdapter = (input) => {
      config = input
      return new Promise((resolve) => {
        finish = resolve
      })
    }
    const pending = api.get('/customers', { adapter })
    const assertion = expect(pending).rejects.toMatchObject({ code: 'SESSION_CONTEXT_CHANGED' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (kind === 'token') localStorage.setItem('token', 'user-b')
    else sessionStorage.setItem('appsfly_business_id', 'tenant-b')
    finish({ data: ['private-a'], status: 200, statusText: 'OK', headers: {}, config })
    await assertion
  })
  it('sends the current identity and tenant together', async () => {
    localStorage.setItem('token', 'user-b')
    sessionStorage.setItem('appsfly_business_id', 'tenant-b')
    const response = await api.get('/customers', {
      adapter: async (config) => ({
        data: config.headers,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    })
    expect(response.data.Authorization).toBe('Bearer user-b')
    expect(response.data['X-AppsFly-Business-Id']).toBe('tenant-b')
  })
})
