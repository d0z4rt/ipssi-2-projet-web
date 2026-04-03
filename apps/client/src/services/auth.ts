import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '../types/auth'
import { api, getApiErrorMessage, safeParseJson } from './api'

const AUTH_USER_KEY = 'gamecritiq_user'
const AUTH_TOKEN_KEY = 'gamecritiq_token'

type Role = 'user' | 'curator' | 'admin'

export type AuthUser = {
  id: string
  username: string
  email: string
  role: Role
  isCurator: boolean
  isAdmin: boolean
}

export type AuthSession = {
  token: string
  expiresAt: string
  user: AuthUser
}

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

const normalizeAuthUser = (user: LoginResponse['user']): AuthUser => ({
  id: user.id,
  username: user.username,
  email: user.mail,
  role: user.is_admin ? 'admin' : user.is_curator ? 'curator' : 'user',
  isCurator: user.is_curator,
  isAdmin: user.is_admin
})

const normalizeAuthResponse = (payload: LoginResponse): AuthSession => ({
  token: payload.token,
  expiresAt: payload.expires_at,
  user: normalizeAuthUser(payload.user)
})

export const authService = {
  login: async (payload: LoginRequest) => {
    try {
      const response = await api.post<LoginResponse>('/v1/auth/login', payload)
      return normalizeAuthResponse(response.data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'))
    }
  },

  register: async (payload: RegisterRequest) => {
    try {
      const response = await api.post<RegisterResponse>(
        '/v1/auth/register',
        payload
      )
      return normalizeAuthResponse(response.data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'))
    }
  },

  getStoredToken: () => localStorage.getItem(AUTH_TOKEN_KEY),

  setAuthToken: (token: string | null) => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  },

  saveSession: (session: AuthSession) => {
    setAuthToken(session.token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user))
  },

  clearSession: () => {
    setAuthToken(null)
    localStorage.removeItem(AUTH_USER_KEY)
  },

  getSession: () => ({
    token: authService.getStoredToken(),
    user: authService.getStoredUser()
  }),

  getStoredUser: () =>
    safeParseJson<AuthUser>(localStorage.getItem(AUTH_USER_KEY)),

  getAuthHeaders: () => {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    return {
      Authorization: `Bearer ${token}`
    }
  }
}
