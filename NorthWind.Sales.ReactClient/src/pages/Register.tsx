import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  filterEmailInput,
  filterNameInput,
  validateEmail,
  validatePassword,
  extractErrorMessage,
  EMAIL_STRICT_REGEX,
} from '../utils/validators'
import { Eye, EyeOff } from 'lucide-react'

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('')
  const [firstNameError, setFirstNameError] = useState<string | null>(null)

  const [lastName, setLastName] = useState('')
  const [lastNameError, setLastNameError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  // Manejo de Nombre (solo letras y espacios, máx 25)
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const filtered = filterNameInput(raw).slice(0, 25)
    setFirstName(filtered)

    if (raw.slice(0, 25) !== filtered) {
      setFirstNameError('Solo se permiten letras y espacios.')
    } else if (filtered.trim().length === 0) {
      setFirstNameError('El nombre es requerido.')
    } else {
      setFirstNameError(null)
    }
  }

  const handleFirstNameBlur = () => {
    if (firstName.trim().length === 0) {
      setFirstNameError('El nombre es requerido.')
    }
  }

  // Manejo de Apellido (solo letras y espacios, máx 25)
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const filtered = filterNameInput(raw).slice(0, 25)
    setLastName(filtered)

    if (raw.slice(0, 25) !== filtered) {
      setLastNameError('Solo se permiten letras y espacios.')
    } else if (filtered.trim().length === 0) {
      setLastNameError('El apellido es requerido.')
    } else {
      setLastNameError(null)
    }
  }

  const handleLastNameBlur = () => {
    if (lastName.trim().length === 0) {
      setLastNameError('El apellido es requerido.')
    }
  }

  // Manejo de Correo (filtro en tiempo real y máx 25)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterEmailInput(e.target.value).slice(0, 25)
    setEmail(filtered)

    if (filtered.includes('@')) {
      setEmailError(validateEmail(filtered))
    } else if (emailError) {
      setEmailError(validateEmail(filtered))
    } else {
      setEmailError(null)
    }
  }

  const handleEmailBlur = () => {
    if (email.trim().length > 0) {
      setEmailError(validateEmail(email))
    } else {
      setEmailError('El correo electrónico es requerido.')
    }
  }

  // Manejo de Contraseña (mínimo 8 caracteres, mayúscula, minúscula, número, máx 25)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 25)
    setPassword(val)

    if (val.length > 0) {
      setPasswordError(validatePassword(val))
    } else {
      setPasswordError(null)
    }

    if (confirmPassword.length > 0) {
      if (confirmPassword !== val) {
        setConfirmPasswordError('Las contraseñas no coinciden.')
      } else {
        setConfirmPasswordError(null)
      }
    }
  }

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('La contraseña es requerida.')
    } else {
      setPasswordError(validatePassword(password))
    }
  }

  // Manejo de Confirmar Contraseña (máx 25)
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 25)
    setConfirmPassword(val)

    if (val.length > 0) {
      if (val !== password) {
        setConfirmPasswordError('Las contraseñas no coinciden.')
      } else {
        setConfirmPasswordError(null)
      }
    } else {
      setConfirmPasswordError(null)
    }
  }

  const handleConfirmPasswordBlur = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Debe confirmar su contraseña.')
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validaciones finales antes de enviar
    let hasErrors = false

    if (!firstName.trim()) {
      setFirstNameError('El nombre es requerido.')
      hasErrors = true
    }

    if (!lastName.trim()) {
      setLastNameError('El apellido es requerido.')
      hasErrors = true
    }

    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      hasErrors = true
    }

    const passErr = validatePassword(password)
    if (passErr) {
      setPasswordError(passErr)
      hasErrors = true
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Debe confirmar su contraseña.')
      hasErrors = true
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.')
      hasErrors = true
    }

    if (hasErrors) {
      return
    }

    setLoading(true)

    try {
      await api.post('/user/Register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      })

      const registeredFullName = `${firstName.trim()} ${lastName.trim()}`
      localStorage.setItem('userName', registeredFullName)
      localStorage.setItem('user', email.trim())

      setIsRegistered(true)
      setSuccess('¡Cuenta creada con éxito! Ahora puedes hacer clic en "Iniciar Sesión" para acceder.')
    } catch (err: any) {
      // Extrae siempre un mensaje específico limpio, evitando [object Object]
      const message = extractErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Comprobación completa de validez del formulario para habilitar el botón
  const isFirstNameValid = Boolean(firstName.trim()) && !firstNameError
  const isLastNameValid = Boolean(lastName.trim()) && !lastNameError
  const isEmailValid = Boolean(email.trim()) && !emailError && EMAIL_STRICT_REGEX.test(email.trim())
  const isPasswordValid = Boolean(password) && !passwordError && validatePassword(password) === null
  const isConfirmPasswordValid = Boolean(confirmPassword) && !confirmPasswordError && confirmPassword === password

  const isRegisterFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
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
                <h3 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Crear Cuenta</h3>
                <p className="text-muted small">Regístrate para comenzar a emitir órdenes en NorthWind Sales</p>
              </div>

              {/* Mensaje de error general (restringido a texto limpio) */}
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

              {/* Mensaje de éxito */}
              {success && (
                <div
                  className="alert py-2.5 px-3 small rounded-3 mb-3 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #86efac',
                  }}
                  role="alert"
                >
                  <span>✅</span>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Nombre y Apellido (con maxLength=25) */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">Nombre</label>
                    <input
                      type="text"
                      maxLength={25}
                      className={`form-control ${firstNameError ? 'is-invalid border-danger' : ''}`}
                      placeholder="Ej. Juan"
                      value={firstName}
                      onChange={handleFirstNameChange}
                      onBlur={handleFirstNameBlur}
                      required
                      disabled={loading}
                    />
                    {firstNameError && (
                      <div className="text-danger small mt-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                        {firstNameError}
                      </div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold text-muted small">Apellido</label>
                    <input
                      type="text"
                      maxLength={25}
                      className={`form-control ${lastNameError ? 'is-invalid border-danger' : ''}`}
                      placeholder="Ej. Pérez"
                      value={lastName}
                      onChange={handleLastNameChange}
                      onBlur={handleLastNameBlur}
                      required
                      disabled={loading}
                    />
                    {lastNameError && (
                      <div className="text-danger small mt-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                        {lastNameError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Correo Electrónico (con maxLength=25) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small">Correo Electrónico</label>
                  <input
                    type="text"
                    maxLength={25}
                    className={`form-control ${emailError ? 'is-invalid border-danger' : ''}`}
                    placeholder="usuario@gmail.com"
                    value={email}
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

                {/* Contraseña (con maxLength=25 y botón de ver/ocultar ojo) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small">Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      maxLength={25}
                      className={`form-control ${passwordError ? 'is-invalid border-danger' : ''}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
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
                  {passwordError && (
                    <div className="text-danger small mt-1 fw-semibold" style={{ fontSize: '0.82rem' }}>
                      {passwordError}
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña (con maxLength=25 y botón de ver/ocultar ojo) */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small">Confirmar Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      maxLength={25}
                      className={`form-control ${confirmPasswordError ? 'is-invalid border-danger' : ''}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={handleConfirmPasswordBlur}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <div className="text-danger small mt-1 fw-semibold" style={{ fontSize: '0.82rem' }}>
                      {confirmPasswordError}
                    </div>
                  )}
                </div>

                {/* Botón Crear Cuenta: se deshabilita y pone gris si hay errores de validación */}
                <button
                  type="submit"
                  className="btn w-100 py-3 rounded-pill fw-bold shadow-sm"
                  style={{
                    backgroundColor: isRegisterFormValid && !loading ? '#10b981' : '#94a3b8',
                    borderColor: isRegisterFormValid && !loading ? '#10b981' : '#94a3b8',
                    color: '#ffffff',
                    cursor: isRegisterFormValid && !loading ? 'pointer' : 'not-allowed',
                  }}
                  disabled={loading || !isRegisterFormValid}
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>

              {/* Enlace Iniciar Sesión (Deshabilitado hasta registro exitoso) */}
              <div className="text-center mt-4 pt-2 border-top small text-muted">
                ¿Ya tienes una cuenta?{' '}
                {isRegistered ? (
                  <Link
                    to="/login"
                    className="fw-semibold text-decoration-none"
                    style={{ color: '#10b981', cursor: 'pointer' }}
                  >
                    Iniciar Sesión
                  </Link>
                ) : (
                  <span
                    className="fw-semibold text-decoration-none"
                    style={{
                      color: '#94a3b8',
                      cursor: 'default',
                      userSelect: 'none',
                    }}
                    onClick={(e) => e.preventDefault()}
                    title="Debe completar el registro antes de iniciar sesión"
                  >
                    Iniciar Sesión
                  </span>
                )}
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

export default Register
