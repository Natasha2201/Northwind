import api from './api'
import type { LoginResponse } from '../interfaces'

/**
 * Decodifica el payload de un token JWT para extraer claims (FullName, name, etc.)
 */
export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export async function login(user: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/user/Login', {
    email: user,
    password: password,
    user: user,
  })

  const data = response.data
  const token = data?.token || data?.accessToken || (typeof data === 'string' ? data : '')

  if (token) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', typeof data.user === 'string' ? data.user : user)

    // Extraer Nombre y Apellido
    let fullName = ''

    if (data.fullName) {
      fullName = data.fullName
    } else if (data.firstName || data.lastName) {
      fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
    } else if (typeof data.user === 'object' && data.user) {
      fullName = data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
    }

    if (!fullName) {
      const decoded = decodeJwt(token)
      if (decoded) {
        fullName = decoded.FullName || decoded.fullName || decoded.name || ''
      }
    }

    // Si aún no se encontró, revisar si ya se había guardado previamente (por ejemplo en el registro)
    if (!fullName) {
      const existingName = localStorage.getItem('userName')
      if (existingName) {
        fullName = existingName
      }
    }

    if (fullName) {
      localStorage.setItem('userName', fullName)
    }
  }

  return data
}

export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userName')
}
