import api from './api'
import type { PagedResult } from '../interfaces'

export interface InvoiceDetailDto {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface InvoiceDto {
  id: number
  invoiceNumber: string
  orderDate: string
  customerId: string
  customerName: string
  customerIdentification: string
  customerAddress?: string
  shipAddress?: string
  shipCity?: string
  shipCountry?: string
  shipPostalCode?: string
  subtotal: number
  tax: number
  total: number
  details: InvoiceDetailDto[]
}

export interface InvoiceSearchDto {
  id: number
  invoiceNumber: string
  orderDate: string
  customerId: string
  customerFirstName?: string
  customerLastName?: string
  customerIdentification?: string
  total: number
}

/**
 * Obtiene el detalle completo de una factura por ID de orden
 */
export async function getInvoice(orderId: number): Promise<InvoiceDto> {
  const response = await api.get<InvoiceDto>(`/orders/${orderId}/invoice`)
  return response.data
}

/**
 * Obtiene el archivo PDF de la factura desde el backend
 */
export async function getInvoicePdf(orderId: number): Promise<Blob> {
  const response = await api.get(`/orders/${orderId}/invoice/pdf`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Sanitiza la entrada de búsqueda de facturas según las reglas de negocio:
 * - "Número de factura": Letras, números y espacios (y guiones típicos de FAC-)
 * - "Nombre": Letras y espacios
 * - "Apellido": Letras y espacios
 * - "Todos": Letras, números, guiones y espacios
 */
export function sanitizeInvoiceInput(val: string, criteria: string): string {
  switch (criteria) {
    case 'Número de factura':
    case 'Factura':
      return val.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 25)
    case 'Nombre':
    case 'Apellido':
      return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25)
    case 'Todos':
    default:
      return val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '').slice(0, 25)
  }
}

/**
 * Servicio para buscar facturas en /api/orders/search (con fallback a /invoices/search)
 */
export async function searchInvoices(
  searchTerm: string,
  criteria: string = 'Todos',
  page: number = 1,
  pageSize: number = 10,
  dateFrom?: string | null,
  dateTo?: string | null,
  signal?: AbortSignal
): Promise<PagedResult<InvoiceSearchDto>> {
  const cleanTerm = searchTerm.trim()

  try {
    const response = await api.get<PagedResult<InvoiceSearchDto>>('/orders/search', {
      params: {
        q: cleanTerm,
        criteria,
        page,
        pageSize,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
      signal,
    })
    return response.data
  } catch {
    const response = await api.get<PagedResult<InvoiceSearchDto>>('/invoices/search', {
      params: {
        q: cleanTerm,
        criteria,
        page,
        pageSize,
      },
      signal,
    })
    return response.data
  }
}
