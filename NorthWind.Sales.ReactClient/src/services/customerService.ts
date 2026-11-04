import api from './api'
import type { CustomerSearchDto, PagedResult } from '../interfaces'

/**
 * Servicio para buscar clientes en el backend .NET
 * Endpoint: /api/customers/search?q={searchTerm}&criteria={criteria}&page={page}&pageSize={pageSize}
 */
export async function searchCustomers(
  searchTerm: string,
  criteria: string = 'Todos',
  page: number = 1,
  pageSize: number = 10,
  signal?: AbortSignal
): Promise<PagedResult<CustomerSearchDto>> {
  const cleanTerm = searchTerm.trim()

  const response = await api.get<PagedResult<CustomerSearchDto>>('/customers/search', {
    params: {
      q: cleanTerm,
      criteria,
      page,
      pageSize,
      // Nombres alternativos por compatibilidad con diferentes configuraciones de controllers
      searchTerm: cleanTerm,
      searchCriteria: criteria,
      filter: criteria,
    },
    signal,
  })

  const data = response.data as any

  // Soporta respuestas con items o Items (camelCase / PascalCase) o arrays planos
  const items: CustomerSearchDto[] =
    data?.items || data?.Items || (Array.isArray(data) ? data : [])
  const totalCount: number =
    data?.totalCount ?? data?.TotalCount ?? (Array.isArray(data) ? data.length : items.length)
  const totalPages: number =
    data?.totalPages ?? data?.TotalPages ?? Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage: number = data?.page ?? data?.Page ?? page

  return {
    items,
    totalCount,
    page: currentPage,
    pageSize: data?.pageSize ?? data?.PageSize ?? pageSize,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  }
}
