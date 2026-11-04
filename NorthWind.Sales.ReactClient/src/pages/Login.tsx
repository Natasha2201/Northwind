import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { filterEmailInput, validateEmail, EMAIL_STRICT_REGEX } from '../utils/validators'
import { Eye, EyeOff } from 'lucide-react'

export const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/ordenes'

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Filtro de caracteres al escribir: solo letras, números, arroba (@) o punto (.) y límite de 25 caracteres
    const filtered = filterEmailInput(e.target.value).slice(0, 25)
    setUsername(filtered)

    if (filtered.includes('@')) {
      setEmailError(validateEmail(filtered))
    } else if (emailError) {
      setEmailError(validateEmail(filtered))
    } else {
      setEmailError(null)
    }
  }

  const handleEmailBlur = () => {
    if (username.trim().length > 0) {
      setEmailError(validateEmail(username))
    } else {
      setEmailError('El correo electrónico es requerido.')
    }
  }

  // Analiza la respuesta de error del backend para mostrar mensajes específicos
  const parseLoginError = (err: any): string => {
    const data = err.response?.data
    let combinedMsg = ''

    if (data) {
      if (typeof data === 'string') {
        combinedMsg = data
      } else {
        // ProblemDetails: errors dictionary
        if (data.errors && typeof data.errors === 'object') {
          for (const [key, value] of Object.entries(data.errors)) {
            const keyLower = key.toLowerCase()
            const valStr = Array.isArray(value) ? value.join(' ') : String(value)
            const valLower = valStr.toLowerCase()

            if (keyLower.includes('email') || valLower.includes('correo') || valLower.includes('email')) {
              if (
                valLower.includes('no está registrado') ||
                valLower.includes('no registrado') ||
                valLower.includes('no existe') ||
                valLower.includes('not found')
              ) {
                return 'El correo electrónico no está registrado.'
              }
            }

            if (keyLower.includes('password') || valLower.includes('contraseña') || valLower.includes('password')) {
              if (
                valLower.includes('incorrecta') ||
                valLower.includes('invalid') ||
                valLower.includes('no coincide')
              ) {
                return 'La contraseña es incorrecta.'
              }
            }

            combinedMsg += ` ${valStr}`
          }
        }

        combinedMsg += ` ${data.detail || ''} ${data.message || ''} ${data.title || ''}`
      }
    }

    const lower = combinedMsg.toLowerCase()
    if (
      lower.includes('no está registrado') ||
      lower.includes('no registrado') ||
      lower.includes('no existe') ||
      lower.includes('not found') ||
      lower.includes('usuario no encontrado')
    ) {
      return 'El correo electrónico no está registrado.'
    }

    if (
      lower.includes('contraseña es incorrecta') ||
      lower.includes('contraseña incorrecta') ||
      lower.includes('password incorrect') ||
      lower.includes('wrong password')
    ) {
      return 'La contraseña es incorrecta.'
    }

    if (
      lower.includes('credenciales') ||
      lower.includes('invalid credentials') ||
      lower.includes('correo o la contraseña') ||
      lower.includes('credenciales de usuario')
    ) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }

    if (data?.detail && data.detail !== 'Se encontraron uno o más errores de validación de datos.') {
      return data.detail
    }

    if (data?.message) {
      return data.message
    }

    return 'Credenciales inválidas. Verifica tu correo y contraseña.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación estricta antes de enviar
    const emailValidationError = validateEmail(username)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    if (!password) {
      setError('La contraseña es requerida.')
      return
    }

    setLoading(true)

    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(parseLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  const isEmailValid = Boolean(username.trim()) && EMAIL_STRICT_REGEX.test(username.trim()) && !emailError
  const isLoginFormValid = isEmailValid && Boolean(password)

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div className="card shadow border-0 rounded-4 bg-white">
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <Link
                  to="/"
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold mb-3 text-decoration-none shadow-sm"
                  style={{ width: '48px', height: '48px', backgroundColor: '#10b981', fontSize: '1.25rem' }}
                >
                  N
                </Link>
                <h3 className="fw-bold mb-1" style={{ color: '#0f172a' }}>NorthWind Sales</h3>
                <p className="text-muted small">Ingresa tus credenciales para acceder al sistema de facturación</p>
              </div>

              {error && (
                <div
                  className="alert py-2.5 px-3 small rounded-3 mb-3 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #f87171',
                  }}
                  role="alert"
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Campo Correo Electrónico (con maxLength=25) */}
                <div className="mb-3">
                  <label htmlFor="usernameInput" className="form-label fw-semibold text-muted small">
                    Correo Electrónico
                  </label>
                  <input
                    id="usernameInput"
                    type="text"
                    maxLength={25}
                    className={`form-control form-control-lg fs-6 ${emailError ? 'is-invalid border-danger' : ''}`}
                    placeholder="usuario@gmail.com"
                    value={username}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    required
                    disabled={loading}
                  />
                  {emailError && (
                    <div className="text-danger small mt-1 fw-semibold" style={{ fontSize: '0.82rem' }}>
                      {emailError}
                    </div>
                  )}
                </div>

                {/* Campo Contraseña (con maxLength=25 y Mostrar/Ocultar con ícono de ojo) */}
                <div className="mb-4">
                  <label htmlFor="passwordInput" className="form-label fw-semibold text-muted small">
                    Contraseña
                  </label>
                  <div className="input-group">
                    <input
                      id="passwordInput"
                      type={showPassword ? 'text' : 'password'}
                      maxLength={25}
                      className="form-control form-control-lg fs-6"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.slice(0, 25))}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary d-flex align-items-center justify-content-center px-3"
                      style={{
                        backgroundColor: '#ffffff',
                        borderColor: '#ced4da',
                        borderLeft: 'none',
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </button>
                  </div>
                </div>

                {/* Botón Iniciar Sesión: se deshabilita y pone gris si no es válido */}
                <button
                  type="submit"
                  className="btn w-100 py-3 rounded-pill fw-bold shadow-sm"
                  style={{
                    backgroundColor: isLoginFormValid && !loading ? '#10b981' : '#94a3b8',
                    borderColor: isLoginFormValid && !loading ? '#10b981' : '#94a3b8',
                    color: '#ffffff',
                    cursor: isLoginFormValid && !loading ? 'pointer' : 'not-allowed',
                  }}
                  disabled={loading || !isLoginFormValid}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-2 border-top small text-muted">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: '#10b981' }}>
                  Crear Cuenta
                </Link>
                <div className="mt-2">
                  <Link to="/" className="text-secondary text-decoration-none">
                    &larr; Volver al Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
