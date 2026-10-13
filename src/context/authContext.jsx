import { clearTenantSelection, isSessionChangedError } from '../utils/sessionIsolation.ts'
import { useContext, useState, createContext, useEffect, useMemo, useCallback } from 'react'
import { registerRequest, loginRequest, logoutRequest, authVerifyRequest } from '../api/auth.js'
import { getMyPendingInvitesRequest } from '../api/userGuest.js'
import { getUserBusinessById } from '../api/userBusiness.js'
import { getUserByIdRequest, userIsSuperAdminRequest } from '../api/user.js'
import { getSubscriptionsByBusinessIdRequest } from '../api/subscription.js'
import { getBusinessByIdRequest } from '../api/business.js'
import {
  getSubscriptionAccessState,
  hasActiveSubscription as checkActiveSubscription,
  hasSubscriptionHistory as checkSubscriptionHistory,
  canClaimFreeTrial as checkCanClaimFreeTrial,
  isFirstTimeSubscriber as checkFirstTimeSubscriber,
  isExpiredSubscriber as checkExpiredSubscriber,
} from '../utils/subscriptionAccess.js'
import { resolveTenantBusinessId } from '../utils/resolveTenantBusinessId.js'
import { markLoginAnnouncementsPending } from '../announcements/announcementTriggers.ts'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userGuestExists, setUserGuestExists] = useState(false)
  const [hasBusiness, setHasBusiness] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const [businessSelected, setBusinessSelected] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [tenantAccessReady, setTenantAccessReady] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [business, setBusiness] = useState(null)
  /** Incrementa en cada signin exitoso (no en restauración de sesión). Dispara anuncios post-login. */
  const [loginSessionKey, setLoginSessionKey] = useState(0)

  useEffect(() => {
    const businessId = businessSelected?.userBusinessBusinessId ?? business?.businessId ?? null
    if (businessId) {
      sessionStorage.setItem('appsfly_business_id', businessId)
    } else {
      sessionStorage.removeItem('appsfly_business_id')
    }
  }, [businessSelected, business])

  const activeBusinessId = useMemo(
    () => businessSelected?.userBusinessBusinessId ?? business?.businessId ?? null,
    [businessSelected, business],
  )

  const subscriptionAccess = useMemo(
    () => getSubscriptionAccessState(subscriptions),
    [subscriptions],
  )

  const hasActiveSubscription = useMemo(
    () => checkActiveSubscription(subscriptions),
    [subscriptions],
  )

  const hasSubscriptionHistory = useMemo(
    () => checkSubscriptionHistory(subscriptions),
    [subscriptions],
  )

  const canClaimFreeTrial = useMemo(() => checkCanClaimFreeTrial(subscriptions), [subscriptions])

  const isFirstTimeSubscriber = useMemo(
    () => checkFirstTimeSubscriber(subscriptions),
    [subscriptions],
  )

  const isExpiredSubscriber = useMemo(() => checkExpiredSubscriber(subscriptions), [subscriptions])

  const refreshSubscriptions = useCallback(
    async (overrideBusinessId) => {
      const businessId =
        overrideBusinessId ?? resolveTenantBusinessId({ businessSelected, business })
      if (!businessId) {
        setSubscriptions([])
        return []
      }
      try {
        const res = await getSubscriptionsByBusinessIdRequest(businessId)
        const list = Array.isArray(res.data) ? res.data : []
        setSubscriptions(list)
        return list
      } catch (error) {
        if (isSessionChangedError(error)) return
        console.error('Error fetching subscriptions:', error)
        setSubscriptions([])
        return []
      }
    },
    [businessSelected, business],
  )

  /** Recarga negocio, suscripciones y datos del tenant tras crear negocio o cambiar contexto. */
  const reloadTenantContext = useCallback(async (userId) => {
    if (!userId) return null
    try {
      const userBusiness = await getUserBusinessById(userId)
      const list = userBusiness.data ?? []
      const exists = list.length > 0
      const selected = list[0] ?? null

      setHasBusiness(exists)
      setBusinessSelected(selected)
      clearTenantSelection()
      if (selected) sessionStorage.setItem('appsfly_business_id', selected.userBusinessBusinessId)

      if (selected?.userBusinessBusinessId) {
        await getSubscriptionsByBusinessId(selected.userBusinessBusinessId)
        await searchBusinessByBusinessId(selected.userBusinessBusinessId)
      } else {
        setSubscriptions([])
        setBusiness(null)
      }

      return selected
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.error('Error reloading tenant context:', error)
      return null
    }
  }, [])

  // Check if the user has pending guest invitations
  const searchUserGuestExists = async () => {
    try {
      const res = await getMyPendingInvitesRequest()
      const list = Array.isArray(res.data) ? res.data : []
      if (list.length > 0) {
        setUserGuestExists(list)
      } else {
        setUserGuestExists(false)
      }
      return list
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.log('Error in searchUserGuestExists:', error)
      setUserGuestExists(false)
      return []
    }
  }

  const checkIfUserIsSuperAdmin = async () => {
    try {
      const res = await userIsSuperAdminRequest()
      setIsSuperAdmin(res.data.isSuperAdmin)
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.log('Error in checkIfUserIsSuperAdmin:', error)
    }
  }

  // Check businesses associated with this user
  const searchBusinessByUserId = async (userId) => {
    try {
      const userBusiness = await getUserBusinessById(userId)
      const exists = userBusiness.data.length > 0

      setHasBusiness(exists)

      const selected = userBusiness.data[0] ?? null
      setBusinessSelected(selected)
      clearTenantSelection()
      if (selected) sessionStorage.setItem('appsfly_business_id', selected.userBusinessBusinessId)
      if (!exists) {
        setBusiness(null)
        setSubscriptions([])
      }

      // Always return the actual response so we can use it immediately
      return userBusiness.data[0] ?? null
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.error('Error fetching user business:', error)
    }
  }

  const searchBusinessByBusinessId = async (businessId) => {
    try {
      const businessFound = await getBusinessByIdRequest(businessId)
      setBusiness(businessFound.data)
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.error('Error fetching user business:', error)
    }
  }

  // Fetch subscriptions by businessId
  const getSubscriptionsByBusinessId = async (businessId) => {
    try {
      const res = await getSubscriptionsByBusinessIdRequest(businessId)
      const list = Array.isArray(res.data) ? res.data : []
      setSubscriptions(list)
      return list
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.error('Error fetching subscriptions:', error)
      setSubscriptions([])
      return []
    }
  }

  const resetTenantContext = () => {
    clearTenantSelection()
    setBusinessSelected(null)
    setBusiness(null)
    setSubscriptions([])
    setHasBusiness(false)
    setUserGuestExists(false)
    setIsSuperAdmin(false)
    setTenantAccessReady(false)
  }

  // A token change in another tab invalidates all mounted tenant data here.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'token' || event.key === null) {
        clearTenantSelection()
        window.location.reload()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Signup process
  const signup = async (userForm) => {
    try {
      const res = await registerRequest(userForm)
      if (res.status == 400) {
        return { error: res.data.error }
      }
      const data = res.data.user
      resetTenantContext()
      localStorage.setItem('token', res.data.token)
      setUser(data)
      setIsAuthenticated(true)
      await searchUserGuestExists()
      // Get the business linked to the new user
      const business = await searchBusinessByUserId(data.userId)
      // Use the business directly (not businessSelected)
      if (business) {
        await getSubscriptionsByBusinessId(business.userBusinessBusinessId)
      }
      setTenantAccessReady(true)
      return { ...data, emailSent: res.data.emailSent !== false }
    } catch (error) {
      if (isSessionChangedError(error)) return
      return {
        error: error.response?.data?.error,
        message: error.response?.data?.message,
        status: error.response?.status,
      }
    }
  }

  // Signin process
  const signin = async (userForm) => {
    let res
    try {
      res = await loginRequest(userForm)
    } catch (error) {
      if (isSessionChangedError(error)) return
      console.log('Error in signin', error)
      throw error
    }

    const data = res.data?.user
    if (!data?.userId) {
      const invalidResponseError = new Error('Invalid login response')
      invalidResponseError.response = { status: 500 }
      throw invalidResponseError
    }

    localStorage.setItem('token', res.data.token)
    setUser(data)
    setIsAuthenticated(true)

    try {
      await checkIfUserIsSuperAdmin()
      await searchUserGuestExists()

      const business = await searchBusinessByUserId(data.userId)
      if (business) {
        await getSubscriptionsByBusinessId(business.userBusinessBusinessId)
        await searchBusinessByBusinessId(business.userBusinessBusinessId)
      }
    } catch (postLoginError) {
      console.error('Error loading post-login data:', postLoginError)
    } finally {
      setTenantAccessReady(true)
    }

    markLoginAnnouncementsPending()
    setLoginSessionKey((key) => key + 1)
    return data
  }

  // Logout process
  const logout = async () => {
    // Invalidate local identity immediately, even when the network logout fails.
    const pendingLogout = logoutRequest().catch(() => undefined)
    localStorage.removeItem('token')
    sessionStorage.removeItem('appsfly_business_id')
    setUser(null)
    setIsAuthenticated(false)
    setUserGuestExists(false)
    setHasBusiness(false)
    setSubscriptions([])
    setBusinessSelected(null)
    setBusiness(null)
    setTenantAccessReady(false)
    setIsSuperAdmin(false)
    await pendingLogout
  }

  // Restore session automatically using Bearer Token
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token')

      // ❌ No hay token → no hay sesión
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        if (localStorage.getItem('token') === token || !localStorage.getItem('token')) {
          setTenantAccessReady(true)
          setLoadingAuth(false)
        }
        return
      }

      try {
        // 1) Validar token en backend
        const res = await authVerifyRequest() // Este ya envía el Bearer por el interceptor

        const userId = res?.data.id

        // 2) Obtener datos completos del usuario
        const userFound = await getUserByIdRequest(userId)
        const userData = userFound.data

        setUser(userData)
        setIsAuthenticated(true)

        // 3) Verificar invitado (guest)
        await searchUserGuestExists()

        // 4) Buscar negocio asociado
        const business = await searchBusinessByUserId(userData.userId)

        if (business) {
          await getSubscriptionsByBusinessId(business.userBusinessBusinessId)
          await searchBusinessByBusinessId(business.userBusinessBusinessId)
        }
        await checkIfUserIsSuperAdmin()
      } catch (error) {
        if (isSessionChangedError(error)) return
        // ❌ Token expiró o inválido → limpiar
        console.log('Auth restore error:', error)

        resetTenantContext()
        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        if (localStorage.getItem('token') === token || !localStorage.getItem('token')) {
          setTenantAccessReady(true)
          setLoadingAuth(false)
        }
      }
    }

    checkLogin()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        logout,
        user,
        setUser,
        isAuthenticated,
        loadingAuth,
        tenantAccessReady,
        userGuestExists,
        setUserGuestExists,
        hasBusiness,
        setHasBusiness,
        businessSelected,
        setBusinessSelected,
        subscriptions,
        setSubscriptions,
        subscriptionAccess,
        hasActiveSubscription,
        hasSubscriptionHistory,
        canClaimFreeTrial,
        isFirstTimeSubscriber,
        isExpiredSubscriber,
        refreshSubscriptions,
        reloadTenantContext,
        searchUserGuestExists,
        isSuperAdmin,
        business,
        activeBusinessId,
        loginSessionKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
