import api from './api'
import type { Product, ProductSearchDto, PagedResult } from '../interfaces'

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products')
  return response.data
}

/**
 * Servicio para buscar productos en el backend .NET
 * Endpoint: /api/products/search?q={searchTerm}&criteria={criteria}&page={page}&pageSize={pageSize}
 * Si falla, usa /api/products/available como fallback local.
 */
export async function searchProducts(
  searchTerm: string,
  criteria: string = 'Todos',
  page: number = 1,
  pageSize: number = 10,
  signal?: AbortSignal
): Promise<PagedResult<ProductSearchDto>> {
  const cleanTerm = searchTerm.trim()

  try {
    const response = await api.get<PagedResult<ProductSearchDto>>('/products/search', {
      params: {
        q: cleanTerm,
        criteria,
        page,
        pageSize,
        searchTerm: cleanTerm,
        searchCriteria: criteria,
        filter: criteria,
      },
      signal,
    })

    const data = response.data as any
    const rawItems: ProductSearchDto[] =
      data?.items || data?.Items || (Array.isArray(data) ? data : [])
    const items = [...rawItems].sort((a, b) => a.id - b.id)
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
  } catch (err: any) {
    // Si fue cancelado por el AbortController debido al debounce o nuevo tipeo, relanzar para ignorar
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      throw err
    }

    console.warn('[productService] /products/search no disponible, usando /products/available como fallback...')

    const availableRes = await api.get<any[]>('/products/available', { signal })
    const all = availableRes.data || []
    const normalizedTerm = cleanTerm.toLowerCase()

    const filtered = all.filter((p) => {
      const id = String(p.productId ?? p.id ?? '')
      const name = String(p.productName ?? p.name ?? '').toLowerCase()

      if (!normalizedTerm) return true
      if (criteria === 'Código' || criteria === 'Id') {
        return id.startsWith(normalizedTerm)
      }
      if (criteria === 'Nombre') {
        return name.startsWith(normalizedTerm) || name.includes(normalizedTerm)
      }
      return id.startsWith(normalizedTerm) || name.startsWith(normalizedTerm) || name.includes(normalizedTerm)
    })

    const items: ProductSearchDto[] = filtered.map((p) => ({
      id: p.productId ?? p.id,
      name: p.productName ?? p.name,
      unitPrice: p.unitPrice ?? 0,
      unitsInStock: p.unitsInStock ?? 0,
    }))

    // Ordenar los productos por Código (ID) ascendente
    items.sort((a, b) => a.id - b.id)

    const totalCount = items.length
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const pagedItems = items.slice((page - 1) * pageSize, page * pageSize)

    return {
      items: pagedItems,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    }
  }
}