import React, { useState, useEffect, useRef } from 'react'
import { searchProducts } from '../services/productService'
import { useDebounce } from '../hooks/useDebounce'
import type { ProductSearchDto } from '../interfaces'

interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (product: {
    productId: number
    productName: string
    unitPrice: number
    unitsInStock: number
  }) => void
  alreadyAddedIds?: number[]
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  alreadyAddedIds = [],
}) => {
  const [criteria, setCriteria] = useState<'Nombre' | 'Código' | 'Todos'>('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Hook de debounce: 300ms después del último tipeo
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [products, setProducts] = useState<ProductSearchDto[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addedProductId, setAddedProductId] = useState<number | null>(null)

  // Referencia para cancelar peticiones anteriores en vuelo
  const abortControllerRef = useRef<AbortController | null>(null)
  // Referencia estable a onClose para usar dentro de setTimeout sin problemas de stale closure
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Sanitización de entrada según el criterio
  const sanitizeInput = (val: string, currentCriteria: string): string => {
    switch (currentCriteria) {
      case 'Código':
        // Solo dígitos
        return val.replace(/[^0-9]/g, '').slice(0, 10)
      case 'Nombre':
        // Solo letras y espacios
        return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 30)
      case 'Todos':
      default:
        // Letras, números y espacios (sin guiones ni símbolos especiales)
        return val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 30)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value, criteria)
    setSearchTerm(sanitized)
    setPage(1)
  }

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCriteria = e.target.value as any
    setCriteria(newCriteria)
    setSearchTerm(sanitizeInput(searchTerm, newCriteria))
    setPage(1)
  }

  const getPlaceholder = (): string => {
    switch (criteria) {
      case 'Código':
        return 'Buscar por código...'
      case 'Nombre':
        return 'Buscar por nombre de producto...'
      default:
        return 'Buscar por nombre o código...'
    }
  }

  // Reset al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setCriteria('Todos')
      setPage(1)
      setProducts([])
      setTotalPages(1)
      setError(null)
      setAddedProductId(null)
    }
  }, [isOpen])

  // Efecto de búsqueda con Debounce y AbortController
  useEffect(() => {
    if (!isOpen) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const performSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await searchProducts(
          debouncedSearchTerm,
          criteria,
          page,
          pageSize,
          controller.signal
        )

        const sorted = [...result.items].sort((a, b) => a.id - b.id)
        setProducts(sorted)
        setTotalPages(Math.max(1, result.totalPages))
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }

        console.error('[ProductSearchModal] Error al buscar productos:', err)
        setError('Error al cargar productos desde el servidor.')
        setProducts([])
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
      <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '720px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 bg-white">
          {/* Encabezado */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold" style={{ color: '#0f172a' }}>
              Buscar Producto
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
                  <option value="Código">Código</option>
                  <option value="Nombre">Nombre</option>
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
            {loading && products.length === 0 && (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-success spinner-border-sm me-2"
                  role="status"
                ></div>
                <span className="text-muted fw-semibold">Consultando productos...</span>
              </div>
            )}

            {/* Tabla de Resultados */}
            {products.length > 0 && (
              <div className="table-responsive rounded-3 border mb-3">
                <table className="table table-hover align-middle mb-0" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '38%' }} />
                    <col style={{ width: '135px' }} />
                    <col style={{ width: '85px' }} />
                    <col style={{ width: '110px' }} />
                  </colgroup>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th className="text-center text-muted small fw-semibold">Código</th>
                      <th className="text-center text-muted small fw-semibold">Nombre del Producto</th>
                      <th className="text-center text-muted small fw-semibold">Precio Unitario</th>
                      <th className="text-center text-muted small fw-semibold">Stock</th>
                      <th className="text-center text-muted small fw-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => {
                      const id = prod.id
                      const name = prod.name
                      const price = prod.unitPrice ?? 0
                      const stock = prod.unitsInStock ?? 0
                      const isOutOfStock = stock <= 0
                      // Marcado si se agregó ahora mismo O si ya estaba en la orden
                      const wasAdded = addedProductId === id || alreadyAddedIds.includes(id)

                      return (
                        <tr key={id} style={wasAdded ? { backgroundColor: '#f8fafc' } : {}}>
                          <td className="text-center fw-semibold text-secondary">{id}</td>
                          <td
                            className="text-center fw-bold"
                            style={{
                              color: wasAdded ? '#6b7280' : '#0f172a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {name}
                          </td>
                          <td className="text-center fw-semibold">${price.toFixed(2)}</td>
                          <td className="text-center">
                            <span
                              className={`badge ${
                                isOutOfStock ? 'bg-danger' : 'bg-success'
                              }`}
                            >
                              {stock}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                                wasAdded ? 'btn-secondary' : 'btn-success'
                              }`}
                              style={
                                wasAdded
                                  ? { backgroundColor: '#64748b', borderColor: '#64748b', color: '#ffffff', opacity: 0.9 }
                                  : { backgroundColor: '#10b981', borderColor: '#10b981' }
                              }
                              disabled={isOutOfStock || wasAdded}
                              onClick={() => {
                                onAddProduct({
                                  productId: id,
                                  productName: name,
                                  unitPrice: price,
                                  unitsInStock: stock,
                                })
                                setAddedProductId(id)
                                setTimeout(() => {
                                  onCloseRef.current()
                                }, 500)
                              }}
                            >
                              {wasAdded ? 'Agregado' : 'Agregar'}
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
            {!loading && products.length === 0 && !error && (
              <div className="text-center py-5 text-muted">
                <p className="mb-0 fs-6">No se encontraron productos disponibles.</p>
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

export default ProductSearchModal
