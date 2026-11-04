import React, { useEffect, useState } from 'react'
import api from '../services/api'
import type { Customer } from '../interfaces'

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<Customer[]>('/customers/search', {
        params: searchTerm ? { term: searchTerm } : undefined,
      })
      setCustomers(response.data || [])
    } catch (err: any) {
      console.error('Error al buscar clientes:', err)
      setError(err.response?.data?.message || 'Error al consultar clientes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Clientes</h2>
          <p className="text-muted mb-0">Búsqueda y gestión de clientes</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-2">
            <div className="col-12 col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por identificación, nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar Clientes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" role="status"></div>
          <span>Buscando clientes...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="alert alert-info" role="alert">
          No se encontraron clientes registrados o que coincidan con la búsqueda.
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nombre / Empresa</th>
                  <th scope="col">Identificación</th>
                  <th scope="col">Email</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Dirección</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.id}</td>
                    <td>{c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A'}</td>
                    <td>{c.identification || 'N/A'}</td>
                    <td>{c.email || 'N/A'}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td>{c.address || 'N/A'}</td>
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

export default CustomerList
