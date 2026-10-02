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
import { markLoginAnnouncementsPending } from '../announcements/announcementTriggers.js'

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
  const [subscriptionLoadError, setSubscriptionLoadError] = useState(false)
  const [businessSelected, setBusinessSelected] = useState(null)
  const [businessMemberships, setBusinessMemberships] = useState([])
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [tenantAccessReady, setTenantAccessReady] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [business, setBusiness] = useState(null)
  /** Incrementa en cada signin exitoso (no en restauración de sesión). Dispara anuncios post-login. */
  const [loginSessionKey, setLoginSessionKey] = useState(0)

  useEffect(() => {
    if (!tenantAccessReady) return
    const businessId = resolveTenantBusinessId({ businessSelected, business })
    if (businessId) {
      sessionStorage.setItem('appsfly_business_id', businessId)
    } else {
      sessionStorage.removeItem('appsfly_business_id')
    }
  }, [businessSelected, business, tenantAccessReady])

  const activeBusinessId = useMemo(
    () => resolveTenantBusinessId({ businessSelected, business }),
    [businessSelected, business],
  )

  const subscriptionAccess = useMemo(
    () => subscriptionLoadError ? 'error' : getSubscriptionAccessState(subscriptions),
    [subscriptions, subscriptionLoadError],
  )

  const hasActiveSubscription = useMemo(
    () => checkActiveSubscription(subscriptions),
    [subscriptions],
  )

  const hasSubscriptionHistory = useMemo(
    () => checkSubscriptionHistory(subscriptions),
    [subscriptions],
  )

  const canClaimFreeTrial = useMemo(() => !subscriptionLoadError && checkCanClaimFreeTrial(subscriptions), [subscriptions, subscriptionLoadError])

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
        setSubscriptionLoadError(false)
        return []
      }
      try {
        const res = await getSubscriptionsByBusinessIdRequest(businessId)
        const list = Array.isArray(res.data) ? res.data : []
        setSubscriptions(list)
        setSubscriptionLoadError(false)
        return list
      } catch (error) {
        console.error('Error fetching subscriptions:', error)
        setSubscriptions([])
        setSubscriptionLoadError(true)
        return null
      }
    },
    [businessSelected, business],
  )

  /** Recarga negocio, suscripciones y datos del tenant tras crear negocio o cambiar contexto. */
  const reloadTenantContext = useCallback(async (userId, preferredBusinessId) => {
    if (!userId) return null
    try {
      const userBusiness = await getUserBusinessById(userId)
      const list = userBusiness.data ?? []
      const exists = list.length > 0
      setBusinessMemberships(list)
      const storedBusinessId = sessionStorage.getItem('appsfly_business_id')
      const selected =
        list.find((membership) =>
          membership.userBusinessBusinessId === preferredBusinessId &&
          membership.Business?.businessStatus === 'ACTIVE',
        ) ??
        list.find((membership) =>
          membership.userBusinessBusinessId === storedBusinessId &&
          membership.Business?.businessStatus === 'ACTIVE',
        ) ??
        list.find((membership) => membership.Business?.businessStatus === 'ACTIVE') ??
        list[0] ??
        null

      setHasBusiness(exists)
      setBusinessSelected(selected)

      if (selected?.userBusinessBusinessId) {
        await getSubscriptionsByBusinessId(selected.userBusinessBusinessId)
        await searchBusinessByBusinessId(selected.userBusinessBusinessId)
      } else {
        setSubscriptions([])
        setSubscriptionLoadError(false)
        setBusiness(null)
      }

      return selected
    } catch (error) {
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
      console.log('Error in checkIfUserIsSuperAdmin:', error)
    }
  }

  // Check businesses associated with this user
  const searchBusinessByUserId = async (userId) => {
    try {
      const userBusiness = await getUserBusinessById(userId)
      const list = Array.isArray(userBusiness.data) ? userBusiness.data : []
      const exists = list.length > 0
      setBusinessMemberships(list)

      setHasBusiness(exists)

      if (exists) {
        const storedBusinessId = sessionStorage.getItem('appsfly_business_id')
        const selected =
          list.find((membership) =>
            membership.userBusinessBusinessId === storedBusinessId &&
            membership.Business?.businessStatus === 'ACTIVE',
          ) ??
          list.find((membership) => membership.Business?.businessStatus === 'ACTIVE') ??
          list[0]
        setBusinessSelected(selected)
        return selected
      }

      setBusinessSelected(null)
      setBusiness(null)
      setSubscriptions([])
      setSubscriptionLoadError(false)
      return null
    } catch (error) {
      console.error('Error fetching user business:', error)
    }
  }

  const switchBusiness = useCallback(async (businessId) => {
    const selected = businessMemberships.find(
      (membership) => membership.userBusinessBusinessId === businessId,
    )
    if (!selected || selected.Business?.businessStatus !== 'ACTIVE') return false

    setBusinessSelected(selected)
    setBusiness(null)
    sessionStorage.setItem('appsfly_business_id', businessId)
    await Promise.all([
      getSubscriptionsByBusinessId(businessId),
      searchBusinessByBusinessId(businessId),
    ])
    return true
  }, [businessMemberships])

  const searchBusinessByBusinessId = async (businessId) => {
    try {
      const businessFound = await getBusinessByIdRequest(businessId)
      setBusiness(businessFound.data)
    } catch (error) {
      console.error('Error fetching user business:', error)
    }
  }

  // Fetch subscriptions by businessId
  const getSubscriptionsByBusinessId = async (businessId) => {
    try {
      const res = await getSubscriptionsByBusinessIdRequest(businessId)
      const list = Array.isArray(res.data) ? res.data : []
      setSubscriptions(list)
      setSubscriptionLoadError(false)
      return list
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setSubscriptions([])
      setSubscriptionLoadError(true)
      return null
    }
  }

  // Signup process
  const signup = async (userForm) => {
    try {
      const res = await registerRequest(userForm)
      console.log(res)
      if (res.status == 400) {
        return { error: res.data.error }
      }
      const data = res.data.user
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
    await logoutRequest()
    localStorage.removeItem('token')
    sessionStorage.removeItem('appsfly_business_id')
    setUser(null)
    setIsAuthenticated(false)
    setUserGuestExists(false)
    setHasBusiness(false)
    setSubscriptions([])
    setBusinessSelected(null)
    setBusinessMemberships([])
    setBusiness(null)
    setTenantAccessReady(false)
    setIsSuperAdmin(false)
  }

  // Restore session automatically using Bearer Token
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token')

      // ❌ No hay token → no hay sesión
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setTenantAccessReady(true)
        setLoadingAuth(false)
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
        // ❌ Token expiró o inválido → limpiar
        console.log('Auth restore error:', error)

        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setTenantAccessReady(true)
        setLoadingAuth(false)
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
        businessMemberships,
        switchBusiness,
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
