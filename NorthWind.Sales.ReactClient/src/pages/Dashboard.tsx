import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar superior de la Landing Page */}
      <nav className="navbar navbar-expand-lg navbar-dark px-4 py-3" style={{ backgroundColor: '#0f172a' }}>
        <div className="container-fluid max-w-6xl">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fs-4 fw-bold text-white">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
              style={{ width: '36px', height: '36px', backgroundColor: '#10b981' }}
            >
              N
            </span>
            NorthWind Sales
          </Link>
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/ordenes')}
                className="btn btn-success fw-semibold px-4 rounded-pill"
              >
                Ir a Órdenes
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light px-3 py-1 rounded-pill fw-medium">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-success px-3 py-1 rounded-pill fw-semibold">
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section centrado */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <div className="container text-center" style={{ maxWidth: '850px' }}>
          {/* Badge superior */}
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4 border"
               style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <span className="badge rounded-pill bg-success" style={{ backgroundColor: '#10b981' }}>
              Plataforma 2.0
            </span>
            <span className="small fw-semibold" style={{ color: '#065f46' }}>
              Sistema de Facturación y Ventas
            </span>
          </div>

          {/* Título principal */}
          <h1 className="display-4 fw-extrabold mb-3" style={{ color: '#0f172a', fontWeight: 800 }}>
            Bienvenido a <span style={{ color: '#10b981' }}>NorthWind Sales</span>
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: '680px', fontSize: '1.25rem' }}>
            Gestiona tus órdenes de venta, clientes y emisión de facturas en tiempo real con rapidez,
            confiabilidad y una interfaz moderna.
          </p>

          {/* Botones de Acción */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <Link
              to="/login"
              className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              Empezar a Vender &rarr;
            </Link>
            <Link
              to="/register"
              className="btn btn-outline-secondary btn-lg px-5 py-3 rounded-pill fw-semibold"
              style={{ color: '#334155', borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
            >
              Crear Cuenta
            </Link>
          </div>

          {/* Tarjetas informativas de características */}
          <div className="row g-4 mt-2 text-start">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="card-body">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: '45px', height: '45px', backgroundColor: '#d1fae5', color: '#059669' }}
                  >
                    ⚡
                  </div>
                  <h6 className="fw-bold" style={{ color: '#0f172a' }}>Órdenes al Instante</h6>
                  <p className="text-muted small mb-0">
                    Crea órdenes de venta en segundos con cálculo dinámico de subtotales, IVA y cambio de efectivo.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="card-body">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: '45px', height: '45px', backgroundColor: '#e2e8f0', color: '#334155' }}
                  >
                    👥
                  </div>
                  <h6 className="fw-bold" style={{ color: '#0f172a' }}>Gestión de Clientes</h6>
                  <p className="text-muted small mb-0">
                    Búsqueda ágil de clientes por cédula, nombre o correo y autocompletado de datos de envío.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="card-body">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: '45px', height: '45px', backgroundColor: '#ecfdf5', color: '#10b981' }}
                  >
                    📦
                  </div>
                  <h6 className="fw-bold" style={{ color: '#0f172a' }}>Control de Stock</h6>
                  <p className="text-muted small mb-0">
                    Validación automática de stock disponible por cada producto antes de emitir la orden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-muted border-top bg-white small">
        &copy; {new Date().getFullYear()} NorthWind Sales — Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default Dashboard
