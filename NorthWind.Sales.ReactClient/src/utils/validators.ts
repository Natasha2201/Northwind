/**
 * Filtro de caracteres en tiempo real para correo:
 * Bloquea cualquier carácter que no sea letra, número, arroba (@) o punto (.)
 */
export const filterEmailInput = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9@.]/g, '')
}

/**
 * Filtro de caracteres en tiempo real para Nombre y Apellido:
 * Solo permite letras (incluyendo acentos y ñ) y espacios.
 */
export const filterNameInput = (value: string): string => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
}

/**
 * Expresión regular estricta para correos:
 * - Solo dominios válidos: gmail.com, googlemail.com, hotmail.com, outlook.com, yahoo.com
 * - No permite texto adicional después del dominio ($)
 * - No permite puntos consecutivos en el nombre de usuario (?!.*\.\.)
 * - El nombre de usuario no puede empezar ni terminar con punto
 */
export const EMAIL_STRICT_REGEX =
  /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9.]{0,28}[a-zA-Z0-9])?@(gmail\.com|googlemail\.com|hotmail\.com|outlook\.com|yahoo\.com)$/i

export const STRICT_EMAIL_ERROR_MESSAGE =
  'El correo no es válido. Debe ser un correo de Gmail, Hotmail, Outlook o Yahoo y no debe contener texto adicional después del dominio.'

/**
 * Validador estricto de correo electrónico
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim()
  if (!trimmed) {
    return 'El correo electrónico es requerido.'
  }

  // Rechazar doble arroba
  if ((trimmed.match(/@/g) || []).length > 1) {
    return 'El correo no puede tener doble arroba.'
  }

  const atIndex = trimmed.indexOf('@')
  if (atIndex < 0) {
    return 'El correo no es válido.'
  }

  const username = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1).toLowerCase()

  // Reglas generales de puntos en el nombre de usuario
  if (username.startsWith('.') || username.endsWith('.')) {
    return 'El correo no puede empezar ni terminar con un punto.'
  }
  if (username.includes('..')) {
    return 'El correo no puede tener puntos consecutivos.'
  }

  // Validar que el dominio sea uno de los permitidos (sin texto adicional)
  const allowedDomains = ['gmail.com', 'googlemail.com', 'hotmail.com', 'outlook.com', 'yahoo.com']
  if (!allowedDomains.includes(domain)) {
    return 'El correo no es válido. No debe contener texto adicional después del dominio.'
  }

  // Reglas específicas para Gmail y Googlemail
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com'
  if (isGmail) {
    if (username.length < 6) {
      return 'El nombre de usuario de Gmail debe tener al menos 6 caracteres.'
    }
    if (username.length > 30) {
      return 'El nombre de usuario de Gmail no puede superar los 30 caracteres.'
    }
    if (!/^[a-zA-Z0-9.]+$/.test(username)) {
      return 'El nombre de usuario de Gmail solo puede contener letras, números y puntos.'
    }
  }

  // Validación de longitud mínima del nombre de usuario para otros dominios
  if (!isGmail && username.length < 1) {
    return 'El correo no es válido.'
  }

  return null
}

/**
 * Validador de contraseña:
 * - Al menos 8 caracteres.
 * - Al menos una letra mayúscula.
 * - Al menos una letra minúscula.
 * - Al menos un número.
 */
export const validatePassword = (pass: string): string | null => {
  if (!pass) {
    return 'La contraseña es requerida.'
  }
  if (pass.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }
  if (!/[A-Z]/.test(pass)) {
    return 'Debe incluir al menos una letra mayúscula.'
  }
  if (!/[a-z]/.test(pass)) {
    return 'Debe incluir al menos una letra minúscula.'
  }
  if (!/[0-9]/.test(pass)) {
    return 'Debe incluir al menos un número.'
  }
  return null
}

/**
 * Extrae de forma segura y recursiva un mensaje legible de error del backend .NET (ProblemDetails,
 * array de ValidationError, diccionario de errores, etc.), evitando siempre "[object Object]".
 */
export const extractErrorMessage = (err: any): string => {
  if (!err) return 'Error al crear la cuenta. Verifica los datos.'

  const data = err.response?.data
  if (!data) {
    if (err.message && typeof err.message === 'string') return err.message
    return 'Error al crear la cuenta. Verifica los datos.'
  }

  // 1. Si data es un string plano
  if (typeof data === 'string') {
    return data
  }

  // 2. Si data.message es un string
  if (data.message && typeof data.message === 'string') {
    return data.message
  }

  // 3. Si data.errors existe
  if (data.errors) {
    // Caso 1: data.errors es un array de objetos o strings [ { propertyName, message }, ... ]
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0]
      if (typeof first === 'string') return first
      if (first && typeof first === 'object') {
        const msg = first.message || first.errorMessage || first.description || first.error
        if (msg && typeof msg === 'string') return msg
      }
    }

    // Caso 2: data.errors es un diccionario { Email: ["..."], ... }
    if (typeof data.errors === 'object') {
      const values = Object.values(data.errors)
      for (const val of values) {
        if (typeof val === 'string') return val
        if (Array.isArray(val) && val.length > 0) {
          const item = val[0]
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            const msg = (item as any).message || (item as any).errorMessage
            if (msg && typeof msg === 'string') return msg
          }
        }
        if (val && typeof val === 'object') {
          const msg = (val as any).message || (val as any).errorMessage
          if (msg && typeof msg === 'string') return msg
        }
      }
    }
  }

  // 4. Si data.detail existe y no es el genérico
  if (data.detail && typeof data.detail === 'string') {
    if (data.detail !== 'Se encontraron uno o más errores de validación de datos.') {
      return data.detail
    }
  }

  // 5. Si data.title existe
  if (data.title && typeof data.title === 'string') {
    return data.title
  }

  return 'Error al crear la cuenta. Verifica los datos.'
}
