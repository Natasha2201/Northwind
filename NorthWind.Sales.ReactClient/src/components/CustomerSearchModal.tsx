import React, { useState, useEffect, useRef } from 'react'
import { searchCustomers } from '../services/customerService'
import { useDebounce } from '../hooks/useDebounce'
import type { CustomerSearchDto } from '../interfaces'

interface CustomerSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectCustomer: (customer: CustomerSearchDto) => void
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const [criteria, setCriteria] = useState<'Todos' | 'Cédula' | 'Nombre' | 'Apellido'>('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Hook de debounce: retrasa la ejecución 300ms después del último tipeo
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [customers, setCustomers] = useState<CustomerSearchDto[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Referencia para cancelar la petición anterior al escribir o cambiar de página
  const abortControllerRef = useRef<AbortController | null>(null)

  // Sanitización de entrada según el criterio seleccionado
  const sanitizeInput = (val: string, currentCriteria: string): string => {
    switch (currentCriteria) {
      case 'Cédula':
        // Solo permite números, longitud máxima 10
        return val.replace(/[^0-9]/g, '').slice(0, 10)
      case 'Nombre':
      case 'Apellido':
        // Solo permite letras y espacios, longitud máxima 25
        return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25)
      case 'Todos':
      default:
        // Letras, números y espacios (sin guiones ni símbolos), longitud máxima 25
        return val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value, criteria)
    setSearchTerm(sanitized)
    setPage(1) // Al cambiar el término, siempre volver a la página 1
  }

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCriteria = e.target.value as 'Todos' | 'Cédula' | 'Nombre' | 'Apellido'
    setCriteria(newCriteria)
    // Re-sanitizar el término actual con las reglas del nuevo criterio
    setSearchTerm(sanitizeInput(searchTerm, newCriteria))
    setPage(1)
  }

  // Placeholder dinámico según el criterio
  const getPlaceholder = (): string => {
    switch (criteria) {
      case 'Cédula':
        return 'Buscar por cédula (solo números)...'
      case 'Nombre':
        return 'Buscar por nombre...'
      case 'Apellido':
        return 'Buscar por apellido...'
      default:
        return 'Buscar por cédula, nombre o apellido...'
    }
  }

  // Reset al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setCriteria('Todos')
      setPage(1)
      setCustomers([])
      setTotalPages(1)
      setError(null)
    }
  }, [isOpen])

  // Efecto principal de búsqueda con Debounce y AbortController
  useEffect(() => {
    if (!isOpen) return

    // Cancelar cualquier petición en vuelo previa para evitar condición de carrera o congelamiento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const performSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await searchCustomers(
          debouncedSearchTerm,
          criteria,
          page,
          pageSize,
          controller.signal
        )

        setCustomers(result.items)
        setTotalPages(Math.max(1, result.totalPages))
      } catch (err: any) {
        // Ignorar cancelaciones intencionales por tipeo
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }

        console.error('[CustomerSearchModal] Error en la búsqueda de clientes:', err)
        setError('Error al cargar clientes desde el servidor.')
        setCustomers([])
        setTotalPages(1)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    performSearch()

    return () => {
      controller.abort()
    }
  }, [debouncedSearchTerm, criteria, page, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 bg-white">
          {/* Encabezado */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold" style={{ color: '#0f172a' }}>
              Buscar Cliente
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body px-4 pb-3">
            {/* Fila de filtros con debounce */}
            <div className="mb-3">
              <div className="input-group">
                <select
                  className="form-select fw-semibold"
                  style={{ maxWidth: '140px', backgroundColor: '#f8fafc' }}
                  value={criteria}
                  onChange={handleCriteriaChange}
                >
                  <option value="Todos">Todos</option>
                  <option value="Cédula">Cédula</option>
                  <option value="Nombre">Nombre</option>
                  <option value="Apellido">Apellido</option>
                </select>

                <input
                  type="text"
                  className="form-control"
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={handleInputChange}
                  autoFocus
                />

                <button
                  type="button"
                  className="btn btn-success fw-semibold px-4"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                  disabled={loading}
                  onClick={() => setPage(1)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Buscando...
                    </>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">
                <strong>Aviso:</strong> {error}
              </div>
            )}

            {/* Estado de carga */}
            {loading && customers.length === 0 && (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-success spinner-border-sm me-2"
                  role="status"
                ></div>
                <span className="text-muted fw-semibold">Consultando clientes...</span>
              </div>
            )}

            {/* Tabla de Resultados */}
            {customers.length > 0 && (
              <div className="table-responsive rounded-3 border mb-3">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th className="text-center text-muted small fw-semibold">Cédula</th>
                      <th className="text-center text-muted small fw-semibold">Nombre</th>
                      <th className="text-center text-muted small fw-semibold">Apellido</th>
                      <th className="text-center text-muted small fw-semibold">Email</th>
                      <th className="text-center text-muted small fw-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => {
                      const identification = c.identification || '—'
                      const firstName = c.firstName || ''
                      const lastName = c.lastName || ''
                      const email = c.email || '—'

                      return (
                        <tr key={c.id || c.identification}>
                          <td className="text-center fw-bold" style={{ color: '#10b981' }}>
                            {identification}
                          </td>
                          <td className="text-center fw-semibold" style={{ color: '#0f172a' }}>
                            {firstName || c.fullName || c.id}
                          </td>
                          <td className="text-center">{lastName || '—'}</td>
                          <td className="text-center text-muted small">{email}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-success rounded-pill px-3 fw-semibold"
                              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                              onClick={() => {
                                onSelectCustomer(c)
                                onClose()
                              }}
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Estado vacío */}
            {!loading && customers.length === 0 && !error && (
              <div className="text-center py-5 text-muted">
                <p className="mb-0 fs-6">No se encontraron clientes.</p>
                <small>Verifica el término ingresado o prueba cambiando de criterio.</small>
              </div>
            )}
          </div>

          {/* Pie de página con Paginación */}
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-semibold"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              &larr; Anterior
            </button>

            <span className="text-muted small fw-semibold">
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-semibold"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSearchModal
