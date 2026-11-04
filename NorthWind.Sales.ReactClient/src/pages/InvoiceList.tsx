import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  searchInvoices,
  sanitizeInvoiceInput,
  type InvoiceSearchDto,
} from '../services/invoiceService'
import useDebounce from '../hooks/useDebounce'

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate()
  const [criteria, setCriteria] = useState<string>('Todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const [page, setPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [invoices, setInvoices] = useState<InvoiceSearchDto[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const dateRangeIsInvalid = Boolean(dateFrom && dateTo && dateFrom > dateTo)

  const getPlaceholder = (): string => {
    switch (criteria) {
      case 'Factura':
        return 'Ej: FAC-00000027 o solo 27...'
      case 'Nombre':
        return 'Nombre del cliente...'
      case 'Apellido':
        return 'Apellido del cliente...'
      case 'Todos':
      default:
        return 'Buscar por factura, nombre o apellido...'
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const sanitized = sanitizeInvoiceInput(raw, criteria)
    setSearchTerm(sanitized)
    setPage(1)
  }

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCriteria(e.target.value)
    setSearchTerm('')
    setPage(1)
  }

  const applyDatePreset = (preset: 0 | 1 | 2) => {
    const today = new Date()
    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    if (preset === 0) {
      // Hoy
      const str = formatDate(today)
      setDateFrom(str)
      setDateTo(str)
    } else if (preset === 1) {
      // Esta semana
      const dayOfWeek = (today.getDay() + 6) % 7
      const monday = new Date(today)
      monday.setDate(today.getDate() - dayOfWeek)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      setDateFrom(formatDate(monday))
      setDateTo(formatDate(sunday))
    } else if (preset === 2) {
      // Este mes
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setDateFrom(formatDate(firstDay))
      setDateTo(formatDate(lastDay))
    }
    setPage(1)
  }

  const clearFilters = () => {
    setCriteria('Todos')
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  useEffect(() => {
    if (dateRangeIsInvalid) {
      setInvoices([])
      setTotalCount(0)
      setTotalPages(1)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    searchInvoices(
      debouncedSearchTerm,
      criteria,
      page,
      pageSize,
      dateFrom || null,
      dateTo || null,
      controller.signal
    )
      .then((res) => {
        setInvoices(res.items || [])
        setTotalCount(res.totalCount || 0)
        setTotalPages(res.totalPages || 1)
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error al consultar facturas:', err)
          setError('No se pudieron cargar las facturas.')
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [debouncedSearchTerm, criteria, page, pageSize, dateFrom, dateTo, dateRangeIsInvalid])

  const formatInvoiceDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="container-fluid p-0">
      {/* Tarjeta: Búsqueda y Filtros */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-3" style={{ color: '#0f172a' }}>
            Historial de Facturas
          </h4>

          {/* Fila del buscador */}
          <div className="input-group mb-3">
            <select
              className="form-select fw-semibold"
              style={{ maxWidth: '150px', backgroundColor: '#f8fafc' }}
              value={criteria}
              onChange={handleCriteriaChange}
            >
              <option value="Todos">Todos</option>
              <option value="Factura">Factura #</option>
              <option value="Nombre">Nombre</option>
              <option value="Apellido">Apellido</option>
            </select>

            <input
              type="text"
              className="form-control form-control-lg"
              placeholder={getPlaceholder()}
              value={searchTerm}
              onChange={handleInputChange}
            />

            <button
              type="button"
              className="btn btn-success px-4 fw-semibold"
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              onClick={() => setPage(1)}
            >
              Buscar
            </button>
          </div>

          {/* Filtros de Fecha */}
          <div className="row g-2 mt-1">
            <div className="col-sm-6 col-lg-3">
              <label htmlFor="invoice-date-from" className="form-label text-muted small mb-1">
                Fecha desde
              </label>
              <input
                id="invoice-date-from"
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <label htmlFor="invoice-date-to" className="form-label text-muted small mb-1">
                Fecha hasta
              </label>
              <input
                id="invoice-date-to"
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            {dateRangeIsInvalid && (
              <div className="col-12">
                <small className="text-danger fw-semibold">
                  La fecha inicial no puede ser posterior a la fecha final.
                </small>
              </div>
            )}
          </div>

          {/* Presets rápidos de fechas */}
          <div className="d-flex flex-wrap gap-2 mt-3" role="group">
            <button
              type="button"
              className="btn btn-outline-success btn-sm rounded-pill px-3"
              onClick={() => applyDatePreset(0)}
            >
              Hoy
            </button>
            <button
              type="button"
              className="btn btn-outline-success btn-sm rounded-pill px-3"
              onClick={() => applyDatePreset(1)}
            >
              Esta semana
            </button>
            <button
              type="button"
              className="btn btn-outline-success btn-sm rounded-pill px-3"
              onClick={() => applyDatePreset(2)}
            >
              Este mes
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 ms-sm-auto"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta: Resultados */}
      <div className="card shadow-sm border-0 rounded-4 bg-white">
        <div className="card-body p-0">
          {error && (
            <div className="alert alert-danger m-3 mb-0 py-2 small" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2 fw-semibold">Buscando facturas...</p>
            </div>
          ) : invoices.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <tr>
                      <th className="text-center text-muted small fw-semibold">Factura #</th>
                      <th className="text-center text-muted small fw-semibold">Fecha</th>
                      <th className="text-center text-muted small fw-semibold">Nombre</th>
                      <th className="text-center text-muted small fw-semibold">Apellido</th>
                      <th className="text-center text-muted small fw-semibold">Total</th>
                      <th className="text-center text-muted small fw-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="text-center fw-semibold" style={{ color: '#10b981' }}>
                          {inv.invoiceNumber}
                        </td>
                        <td className="text-center">{formatInvoiceDate(inv.orderDate)}</td>
                        <td className="text-center">
                          {inv.customerFirstName || inv.customerId}
                        </td>
                        <td className="text-center">{inv.customerLastName || '-'}</td>
                        <td className="text-center fw-bold text-dark">
                          ${(inv.total || 0).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold"
                            onClick={() => navigate(`/factura/${inv.id}`)}
                          >
                            Ver Factura
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="p-3 border-top d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Mostrando {invoices.length} de {totalCount} facturas
                </span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <span className="align-self-center px-2 small fw-semibold">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No se encontraron facturas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceList
