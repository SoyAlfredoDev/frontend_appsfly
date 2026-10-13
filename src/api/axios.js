import { sessionChangedError } from '../utils/sessionIsolation.ts'
import axios from 'axios'
import config from '../config/env.js'

const BUSINESS_ID_STORAGE_KEY = 'appsfly_business_id'

const api = axios.create({
  baseURL: config.apiUrl,
})

// 👇 Interceptor: se ejecuta ANTES de cualquier request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  config.sessionToken = token
  config.sessionBusinessId = sessionStorage.getItem(BUSINESS_ID_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  const url = config.url ?? ''
  const isAuthRoute = /^\/(login|register|logout|verify|forgot-password|reset-password)/.test(url)

  if (!isAuthRoute) {
    const businessId = sessionStorage.getItem(BUSINESS_ID_STORAGE_KEY)
    if (businessId) {
      config.headers['X-AppsFly-Business-Id'] = businessId
    }
  }

  return config
})

function assertCurrentSession(config) {
  if (
    config &&
    (config.sessionToken !== localStorage.getItem('token') ||
      config.sessionBusinessId !== sessionStorage.getItem(BUSINESS_ID_STORAGE_KEY))
  ) {
    throw sessionChangedError()
  }
}

api.interceptors.response.use(
  (response) => {
    assertCurrentSession(response.config)
    return response
  },
  (error) => {
    assertCurrentSession(error.config)
    return Promise.reject(error)
  },
)

export default api
