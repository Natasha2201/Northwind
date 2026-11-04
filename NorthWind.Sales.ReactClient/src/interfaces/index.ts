export interface Product {
  productId: number
  productName: string
  unitPrice: number | null
  unitsInStock: number | null
}

export interface Customer {
  id: string
  identification?: string
  firstName?: string
  lastName?: string
  companyName?: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  currentBalance?: number
}

export interface CustomerSearchDto {
  id: string
  identification?: string
  firstName?: string
  lastName?: string
  email?: string
  address?: string
  fullName?: string
  currentBalance?: number
  pendingDebt?: number
}

export interface ProductSearchDto {
  id: number
  name: string
  unitPrice: number
  unitsInStock: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface OrderDetail {
  productId: number
  unitPrice: number
  quantity: number
  productName?: string
}

export interface Order {
  orderId?: number
  customerId: string
  orderDate?: string
  shipAddress?: string
  shipCity?: string
  shipCountry?: string
  shipPostalCode?: string
  orderDetails?: OrderDetail[]
  total?: number
}

export interface LoginResponse {
  token?: string
  accessToken?: string
  user?: string | { id?: string; email?: string; name?: string; firstName?: string; lastName?: string }
  firstName?: string
  lastName?: string
  fullName?: string
}

