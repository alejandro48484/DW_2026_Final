import axios from 'axios'
import { API_URL } from '../config'
import { authService } from './authService'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// TODO 1.3a: interceptor de petición — agrega el token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// TODO 1.3b: interceptor de respuesta — renueva token ante 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { refreshToken } = useAuthStore.getState()
        const tokens = await authService.refresh(refreshToken!)
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
        original.headers.Authorization = `Bearer ${tokens.accessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// TODO 1.3 (Autenticación): agregue dos interceptores a 'api'.
// a) De petición: si hay accessToken en el store, enviarlo en Authorization: Bearer <token>.
// b) De respuesta: ante un 401 (token vencido) intente UNA sola vez renovar con authService.refresh,
//    guarde los tokens nuevos con setTokens y repita la petición original. Si la renovación falla,
//    llame a logout() y lleve al usuario a /login.
