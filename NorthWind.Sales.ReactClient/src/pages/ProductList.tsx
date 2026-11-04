import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Product } from '../interfaces'

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<Product[]>('/products/available')
      setProducts(response.data)
    } catch (err: any) {
      console.error('Error al cargar productos:', err)
      setError(
        err.response?.data?.message ||
        'No se pudieron cargar los productos disponibles.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = (product: Product) => {
    navigate('/ordenes', {
      state: { selectedProduct: product },
    })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Productos Disponibles</h2>
          <p className="text-muted mb-0">Listado de productos listos para facturación</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchProducts} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" role="status"></div>
          <span>Cargando productos disponibles...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error: </strong> {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="alert alert-info" role="alert">
          No hay productos disponibles en este momento.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" style={{ width: '80px' }}>ID</th>
                  <th scope="col">Producto</th>
                  <th scope="col" className="text-end" style={{ width: '150px' }}>Precio Unitario</th>
                  <th scope="col" className="text-center" style={{ width: '150px' }}>Stock</th>
                  <th scope="col" className="text-center" style={{ width: '160px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td className="fw-semibold text-muted">#{product.productId}</td>
                    <td>
                      <span className="fw-bold">{product.productName}</span>
                    </td>
                    <td className="text-end">
                      {product.unitPrice != null
                        ? `$${product.unitPrice.toFixed(2)}`
                        : <span className="text-muted">N/D</span>}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          (product.unitsInStock ?? 0) > 10
                            ? 'bg-success'
                            : (product.unitsInStock ?? 0) > 0
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {product.unitsInStock ?? 0} unidades
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-primary btn-sm px-3"
                        onClick={() => handleCreateOrder(product)}
                      >
                        Crear Orden
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
