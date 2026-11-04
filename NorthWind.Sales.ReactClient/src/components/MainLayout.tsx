import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'

export const MainLayout: React.FC = () => {
  const { user, userName, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Prioriza el Nombre y Apellido del usuario; si no existe, usa el identificador o correo
  const displayName = userName || localStorage.getItem('userName') || user

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
    // Redirige a la página de inicio principal (/) de forma directa y limpia
    window.location.replace('/')
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 min-vh-100">
        {/* Sidebar Limpio */}
        <aside
          className="col-12 col-md-3 col-lg-2 text-white p-3 d-flex flex-column"
          style={{ backgroundColor: '#0f172a' }}
        >
          {/* Logo / Header */}
          <div className="d-flex align-items-center gap-2 mb-3 px-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 text-white fw-bold shadow-sm"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#10b981',
                flexShrink: 0,
                fontSize: '1.15rem',
              }}
            >
              N
            </span>
            <span
              className="fs-5 fw-bold text-white tracking-wide"
              style={{ letterSpacing: '0.5px' }}
            >
              NorthWind
            </span>
          </div>

          <hr style={{ borderColor: '#334155' }} className="mt-1 mb-3" />

          {/* Menú de Navegación: Órdenes y Facturas */}
          <ul className="nav nav-pills flex-column mb-auto gap-1">
            <li className="nav-item">
              <NavLink
                to="/ordenes"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium ${
                    isActive ? 'text-white' : 'text-light'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#10b981' : 'transparent',
                })}
              >
                <span className="fs-6">📄</span>
                <span>Órdenes</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/facturas"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium ${
                    isActive ? 'text-white' : 'text-light'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#10b981' : 'transparent',
                })}
              >
                <span className="fs-6">🧾</span>
                <span>Facturas</span>
              </NavLink>
            </li>
          </ul>

          <hr style={{ borderColor: '#334155' }} className="mt-auto" />

          {/* Botón de Cerrar Sesión: abre modal de confirmación */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="btn btn-outline-danger w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            <LogOut size={18} color="#ef4444" />
            <span>Cerrar Sesión</span>
          </button>
        </aside>

        {/* Columna Principal: Header Superior + Área de Contenido */}
        <div
          className="col-12 col-md-9 col-lg-10 d-flex flex-column min-vh-100"
          style={{ backgroundColor: '#f8fafc' }}
        >
          {/* Header Superior: Muestra Nombre y Apellido alineado a la derecha */}
          <header
            className="d-flex justify-content-end align-items-center px-4 py-3 shadow-sm no-print"
            style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}
          >
            {displayName && (
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Conectado como:
                </span>
                <span
                  className="fw-bold px-3 py-1 rounded-pill shadow-sm"
                  style={{
                    color: '#ffffff',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {displayName}
                </span>
              </div>
            )}
          </header>

          {/* Área de Contenido Principal */}
          <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8fafc' }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN AL CERRAR SESIÓN */}
      {showLogoutModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 1060 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark fs-5">
                  Confirmar Cierre de Sesión
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                />
              </div>
              <div className="modal-body px-4 py-3">
                <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                  ¿Estás seguro de que deseas cerrar sesión?
                </p>
              </div>
              <div className="modal-footer border-0 pb-4 pt-2 px-4 gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                  onClick={handleConfirmLogout}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainLayout
