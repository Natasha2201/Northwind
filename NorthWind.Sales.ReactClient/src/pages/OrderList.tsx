import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import CustomerSearchModal from '../components/CustomerSearchModal'
import ProductSearchModal from '../components/ProductSearchModal'
import type { CustomerSearchDto } from '../interfaces'

interface OrderItem {
  productId: number
  productName: string
  unitPrice: number
  unitsInStock: number
  quantity: number
}

export const OrderList: React.FC = () => {
  const navigate = useNavigate()
  // Form fields
  const [customerId, setCustomerId] = useState('')
  const [customerDebtMessage, setCustomerDebtMessage] = useState('')
  const [orderDate] = useState(() => new Date().toISOString().split('T')[0])
  const [shipAddress, setShipAddress] = useState('')
  const [shipCity, setShipCity] = useState('')
  const [shipCountry, setShipCountry] = useState('')
  const [shipPostalCode, setShipPostalCode] = useState('')

  // Validation touched states
  const [cityTouched, setCityTouched] = useState(false)
  const [countryTouched, setCountryTouched] = useState(false)
  const [postalCodeTouched, setPostalCodeTouched] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  // Order items
  const [items, setItems] = useState<OrderItem[]>([])
  // Texto del input de cantidad por productId (permite borrar y reetipear libremente)
  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({})

  // Payment
  const [cashReceivedText, setCashReceivedText] = useState('')
  const cashReceived = parseFloat(cashReceivedText) || 0

  // Modals state
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  // Confirmation warning modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(null)

  // Status & feedback
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null)

  // Calculated totals
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  const tax = Math.round(subtotal * 0.15 * 100) / 100
  const total = subtotal + tax
  const change = cashReceived >= total ? cashReceived - total : 0

  // Real-time validations — Ciudad
  const cityTrimmed = shipCity.trim()
  const isCityEmpty = cityTrimmed.length === 0
  const isCityTooShort = cityTrimmed.length > 0 && cityTrimmed.length < 3
  const isCityValid = cityTrimmed.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(shipCity)

  // Real-time validations — País
  const countryTrimmed = shipCountry.trim()
  const isCountryEmpty = countryTrimmed.length === 0
  const isCountryTooShort = countryTrimmed.length > 0 && countryTrimmed.length < 3
  const isCountryValid = countryTrimmed.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(shipCountry)

  const isPostalCodeValid = shipPostalCode.length === 6 && /^[0-9]{6}$/.test(shipPostalCode)
  const isCustomerValid = Boolean(customerId)
  const isShipAddressValid = Boolean(shipAddress.trim())

  const isFormValid =
    isCustomerValid &&
    !customerDebtMessage &&
    isShipAddressValid &&
    isCityValid &&
    isCountryValid &&
    isPostalCodeValid &&
    items.length > 0 &&
    items.every((i) => i.quantity >= 1) &&
    total > 0 &&
    cashReceived >= total &&
    !submitting

  // El botón "Enviar Orden" debe estar deshabilitado (gris) por defecto.
  // Debe activarse (verde) y permitir el envío solo cuando:
  // 1. Se haya seleccionado un cliente.
  // 2. Se haya ingresado un monto en "Efectivo Recibido" (mayor o igual al total).
  // 3. No existan errores de validación en Ciudad, País o Código Postal.
  const isSubmitButtonActive =
    Boolean(customerId) &&
    !customerDebtMessage &&
    cashReceivedText.trim() !== '' &&
    cashReceived >= total &&
    total > 0 &&
    items.length > 0 &&
    isCityValid &&
    isCountryValid &&
    isPostalCodeValid &&
    !submitting

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Al seleccionar cliente del modal
  const handleSelectCustomer = (customer: CustomerSearchDto) => {
    const displayName = customer.id || customer.fullName || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
    setCustomerId(customer.id)
    setShipAddress(customer.address || '')

    // Verificar si viene pendingDebt o currentBalance en el cliente
    const initialDebt = Number(customer.pendingDebt ?? customer.currentBalance ?? (customer as any).debt ?? 0)

    if (initialDebt > 0) {
      const formattedMonto = initialDebt.toFixed(2).replace('.', ',')
      setCustomerDebtMessage(`El cliente ${displayName} tiene un adeudo pendiente de ${formattedMonto}`)
    } else {
      setCustomerDebtMessage('')
    }

    // Consultar el endpoint de balance por si no vino en el DTO
    api
      .get(`/customers/${encodeURIComponent(customer.id)}/balance`)
      .then((res) => {
        const bal = Number(res.data?.pendingDebt ?? res.data?.currentBalance ?? res.data?.balance ?? 0)
        if (bal > 0) {
          const formattedMonto = bal.toFixed(2).replace('.', ',')
          setCustomerDebtMessage(`El cliente ${displayName} tiene un adeudo pendiente de ${formattedMonto}`)
        } else {
          setCustomerDebtMessage('')
        }
      })
      .catch(() => {})

    setFeedback({
      type: 'success',
      message: `Cliente seleccionado: ${customer.id}`,
    })
  }

  // Al hacer clic en Buscar/Cambiar cliente
  const handleCustomerButtonClick = () => {
    if (customerId) {
      setConfirmTitle('Cambiar Cliente')
      setConfirmMessage('¿Seguro que desea cambiar el cliente? Se perderán los datos de envío actuales.')
      setOnConfirmAction(() => () => {
        // Vaciar TODOS los campos del formulario y la tabla de productos
        setCustomerId('')
        setCustomerDebtMessage('')
        setShipAddress('')
        setShipCity('')
        setShipCountry('')
        setShipPostalCode('')
        setCityTouched(false)
        setCountryTouched(false)
        setPostalCodeTouched(false)
        setAttemptedSubmit(false)
        setItems([])
        setQtyInputs({})
        setCashReceivedText('')
        setShowCustomerModal(true)
      })
      setShowConfirmModal(true)
    } else {
      setShowCustomerModal(true)
    }
  }

  // Manejador cuando se agrega un producto desde el modal
  const handleAddProduct = (product: {
    productId: number
    productName: string
    unitPrice: number
    unitsInStock: number
  }) => {
    const existing = items.find((i) => i.productId === product.productId)

    if (existing) {
      if (existing.quantity < product.unitsInStock) {
        const newQty = existing.quantity + 1
        setItems(
          items.map((i) =>
            i.productId === product.productId ? { ...i, quantity: newQty } : i
          )
        )
        setQtyInputs((prev) => ({ ...prev, [product.productId]: String(newQty) }))
        setFeedback({
          type: 'success',
          message: `Se incrementó la cantidad de "${product.productName}".`,
        })
      } else {
        setFeedback({
          type: 'danger',
          message: `Stock máximo alcanzado para "${product.productName}" (${product.unitsInStock} disponibles).`,
        })
      }
    } else {
      setItems([
        ...items,
        {
          productId: product.productId,
          productName: product.productName,
          unitPrice: product.unitPrice,
          unitsInStock: product.unitsInStock,
          quantity: 1,
        },
      ])
      setQtyInputs((prev) => ({ ...prev, [product.productId]: '1' }))
      setFeedback({
        type: 'success',
        message: `Producto agregado: "${product.productName}"`,
      })
    }
  }

  // Manejador del cambio de texto en el input de cantidad
  const handleQtyInputChange = (item: OrderItem, rawValue: string) => {
    // Solo permite dígitos
    const digits = rawValue.replace(/[^0-9]/g, '')
    // Actualiza el texto del input (puede quedar vacío mientras el usuario escribe)
    setQtyInputs((prev) => ({ ...prev, [item.productId]: digits }))

    if (digits === '' || digits === '0') {
      // Campo vacío o cero: deja quantity en 0 para activar el mensaje "Mínimo 1"
      setItems((prev) =>
        prev.map((i) => (i.productId === item.productId ? { ...i, quantity: 0 } : i))
      )
      return
    }

    const parsed = parseInt(digits, 10)
    if (parsed > item.unitsInStock) {
      setFeedback({
        type: 'danger',
        message: `La cantidad máxima para "${item.productName}" es ${item.unitsInStock}. Se ha ajustado automáticamente.`,
      })
      setQtyInputs((prev) => ({ ...prev, [item.productId]: String(item.unitsInStock) }))
      setItems((prev) =>
        prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: item.unitsInStock } : i
        )
      )
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === item.productId ? { ...i, quantity: parsed } : i))
      )
    }
  }

  // Al hacer clic en eliminar producto con confirmación
  const handleRemoveProductClick = (item: OrderItem) => {
    setConfirmTitle('Confirmar eliminación')
    setConfirmMessage(`¿Eliminar ${item.productName} de la orden?`)
    setOnConfirmAction(() => () => {
      setItems((prev) => prev.filter((i) => i.productId !== item.productId))
      setQtyInputs((prev) => {
        const next = { ...prev }
        delete next[item.productId]
        return next
      })
    })
    setShowConfirmModal(true)
  }

  // Al hacer clic en cambiar producto con confirmación
  const handleChangeProductClick = (item: OrderItem) => {
    setConfirmTitle('Cambiar Producto')
    setConfirmMessage(
      `¿Seguro que desea cambiar este producto? Se perderán los datos de cantidad actuales.`
    )
    setOnConfirmAction(() => () => {
      setItems((prev) => prev.filter((i) => i.productId !== item.productId))
      setQtyInputs((prev) => {
        const next = { ...prev }
        delete next[item.productId]
        return next
      })
      setShowProductModal(true)
    })
    setShowConfirmModal(true)
  }

  // Manejadores de campos de envío con Regex
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permite letras y espacios, máx 25 caracteres
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25)
    setShipCity(val)
    setCityTouched(true)
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permite letras y espacios, máx 25 caracteres
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25)
    setShipCountry(val)
    setCountryTouched(true)
  }

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permite números, máx 6 caracteres
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setShipPostalCode(val)
    setPostalCodeTouched(true)
  }

  // Manejador de Efectivo Recibido: no permite guiones ni símbolos, solo números y un punto decimal, máx 10 dígitos
  const handleCashReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '')
    const parts = val.split('.')
    let integerPart = parts[0] || ''
    let decimalPart = parts.length > 1 ? parts.slice(1).join('') : null

    // Contar dígitos en total (sin contar el punto decimal)
    const totalDigits = integerPart.length + (decimalPart ? decimalPart.length : 0)
    if (totalDigits > 10) {
      if (integerPart.length >= 10) {
        integerPart = integerPart.slice(0, 10)
        decimalPart = null
      } else {
        const allowedDecimals = 10 - integerPart.length
        decimalPart = decimalPart ? decimalPart.slice(0, allowedDecimals) : null
      }
    }

    const finalVal = decimalPart !== null ? `${integerPart}.${decimalPart}` : integerPart
    setCashReceivedText(finalVal)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttemptedSubmit(true)
    setFeedback(null)

    // Si no hay cliente seleccionado, no mostramos alerta genérica; el mensaje aparece debajo del campo de cliente
    if (!customerId) {
      return
    }

    // Si el cliente tiene deuda pendiente, no procesar la orden
    if (customerDebtMessage) {
      return
    }

    if (!isFormValid) {
      return
    }

    setSubmitting(true)

    // 1. Verificación previa de existencia y stock en tiempo real antes de enviar
    try {
      const currentProductsMap = new Map<number, { id: number; name: string; unitsInStock: number }>()

      // Consultar endpoint de productos disponibles
      try {
        const availableRes = await api.get('/products/available')
        if (Array.isArray(availableRes.data)) {
          availableRes.data.forEach((p: any) => {
            const pId = p.productId ?? p.id
            if (pId != null) {
              currentProductsMap.set(Number(pId), {
                id: Number(pId),
                name: p.productName ?? p.name ?? '',
                unitsInStock: Number(p.unitsInStock ?? 0),
              })
            }
          })
        }
      } catch (err) {
        console.warn('No se pudo consultar /products/available:', err)
      }

      // Si algún producto de la orden no vino en available, consultamos con /products/search?q={id}&criteria=id
      for (const item of items) {
        if (!currentProductsMap.has(item.productId)) {
          try {
            const searchRes = await api.get('/products/search', {
              params: {
                q: String(item.productId),
                criteria: 'Id',
                page: 1,
                pageSize: 10,
              },
            })
            const searchItems: any[] =
              searchRes.data?.items ||
              searchRes.data?.Items ||
              (Array.isArray(searchRes.data) ? searchRes.data : [])
            const exactMatch = searchItems.find(
              (p: any) => Number(p.id ?? p.productId) === item.productId
            )
            if (exactMatch) {
              currentProductsMap.set(item.productId, {
                id: item.productId,
                name: exactMatch.name ?? exactMatch.productName ?? item.productName,
                unitsInStock: Number(exactMatch.unitsInStock ?? 0),
              })
            }
          } catch (err) {
            console.warn(`Error al consultar producto ID ${item.productId}:`, err)
          }
        }
      }

      // Validar existencia y stock de cada producto en la orden
      for (const item of items) {
        const productInfo = currentProductsMap.get(item.productId)

        // Caso 1: El producto ya no existe en la base de datos (e.g. Delete from Products where id = 24)
        if (!productInfo) {
          setFeedback({
            type: 'danger',
            message: `El producto ${item.productName} ya no existe en la base de datos. Por favor, elimínelo de la orden.`,
          })
          setSubmitting(false)
          return
        }

        // Caso 2: El stock actual es menor a la cantidad solicitada
        if (productInfo.unitsInStock < item.quantity) {
          if (productInfo.unitsInStock <= 0) {
            setFeedback({
              type: 'danger',
              message: `El producto ${item.productName} ya no tiene stock disponible (0 unidades). Por favor, elimínelo de la orden.`,
            })
            setSubmitting(false)
            return
          }

          // Ajustar automáticamente la cantidad al stock disponible
          const adjustedStock = productInfo.unitsInStock
          setItems((prevItems) =>
            prevItems.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: adjustedStock, unitsInStock: adjustedStock }
                : i
            )
          )
          setQtyInputs((prev) => ({
            ...prev,
            [item.productId]: String(adjustedStock),
          }))
          setFeedback({
            type: 'danger',
            message: `La cantidad máxima para ${item.productName} es ${adjustedStock}. Se ha ajustado automáticamente.`,
          })
          setSubmitting(false)
          return
        }
      }
    } catch (checkErr) {
      console.warn('Error en la verificación previa de stock:', checkErr)
    }

    const payload = {
      customerId,
      shipAddress,
      shipCity,
      shipCountry,
      shipPostalCode,
      orderDetails: items.map((i) => ({
        productId: i.productId,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    }

    try {
      const response = await api.post('/CreateOrder', payload)
      const newOrderId = response.data

      // Limpiar formulario tras creación exitosa
      setCustomerId('')
      setCustomerDebtMessage('')
      setShipAddress('')
      setShipCity('')
      setShipCountry('')
      setShipPostalCode('')
      setCityTouched(false)
      setCountryTouched(false)
      setPostalCodeTouched(false)
      setAttemptedSubmit(false)
      setItems([])
      setQtyInputs({})
      setCashReceivedText('')

      // Navegación automática a la factura generada
      if (newOrderId) {
        navigate(`/factura/${newOrderId}`)
      }
    } catch (err: any) {
      const data = err.response?.data

      // 1. Extraer cualquier mensaje de producto no existente o ajuste de stock del backend
      let missingProductMsg = ''
      let stockAdjustedMsg = ''

      const checkProductError = (text: string) => {
        if (!text || typeof text !== 'string') return
        const notFoundMatch = text.match(/producto\s+(\d+)\s+no\s+existe/i)
        if (notFoundMatch) {
          const missingId = Number(notFoundMatch[1])
          const missingItem = items.find((i) => i.productId === missingId)
          const pName = missingItem ? missingItem.productName : `ID ${missingId}`
          missingProductMsg = `El producto ${pName} ya no existe en la base de datos. Por favor, elimínelo de la orden.`
          return
        }
        if (text.toLowerCase().includes('no existe') && text.toLowerCase().includes('producto')) {
          missingProductMsg = text
          return
        }

        const stockMatch = text.match(/(\d+).*?(\d+).*?producto\s+(\d+)/i)
        if (stockMatch) {
          const pId = Number(stockMatch[3])
          const availableStock = Number(stockMatch[2])
          const pItem = items.find((i) => i.productId === pId)
          const pName = pItem ? pItem.productName : `ID ${pId}`
          stockAdjustedMsg = `La cantidad máxima para ${pName} es ${availableStock}. Se ha ajustado automáticamente.`
        }
      }

      // 2. Extraer cualquier mensaje de adeudo pendiente del backend
      let debtMsg = ''
      const inspectItem = (item: any) => {
        if (!item) return
        const text =
          typeof item === 'string'
            ? item
            : item.message || item.Message || item.errorMessage || item.ErrorMessage || ''
        if (
          typeof text === 'string' &&
          (text.toLowerCase().includes('adeudo') || text.toLowerCase().includes('deuda'))
        ) {
          debtMsg = text
        }
        checkProductError(text)
      }

      if (data?.errors) {
        if (Array.isArray(data.errors)) {
          data.errors.forEach(inspectItem)
        } else if (typeof data.errors === 'object') {
          Object.values(data.errors).forEach((val) => {
            if (Array.isArray(val)) {
              val.forEach(inspectItem)
            } else {
              inspectItem(val)
            }
          })
        }
      }

      if (!debtMsg && data?.errors) {
        const inspectCustomerProp = (item: any) => {
          if (!item) return
          const prop = item.propertyName || item.PropertyName || ''
          const msg = item.message || item.Message || ''
          if (prop.toLowerCase() === 'customerid' && msg) {
            debtMsg = msg
          }
        }
        if (Array.isArray(data.errors)) {
          data.errors.forEach(inspectCustomerProp)
        }
      }

      const rawDetail = data?.detail || data?.message || (typeof data === 'string' ? data : null)
      if (
        !debtMsg &&
        rawDetail &&
        (rawDetail.toLowerCase().includes('adeudo') || rawDetail.toLowerCase().includes('deuda'))
      ) {
        debtMsg = rawDetail
      }

      if (rawDetail) {
        checkProductError(rawDetail)
      }

      // Si se detectó producto no existente del backend
      if (missingProductMsg) {
        setFeedback({ type: 'danger', message: missingProductMsg })
        return
      }

      // Si se detectó ajuste de stock del backend
      if (stockAdjustedMsg) {
        setFeedback({ type: 'danger', message: stockAdjustedMsg })
        return
      }

      // Si se encontró mensaje de adeudo, se muestra debajo del campo de cliente
      if (debtMsg) {
        setCustomerDebtMessage(debtMsg)
        return
      }

      // Eliminar alerta genérica y mostrar mensaje específico
      const candidateMsg =
        data?.detail ||
        data?.title ||
        data?.message ||
        (typeof data === 'string' ? data : null)

      const isGenericValidationError =
        typeof candidateMsg === 'string' &&
        (candidateMsg.toLowerCase().includes('errores de validación') ||
          candidateMsg.toLowerCase().includes('validacion de datos') ||
          candidateMsg.toLowerCase().includes('validación de datos') ||
          candidateMsg.toLowerCase().includes('validation error') ||
          candidateMsg.toLowerCase().includes('se encontraron uno o más'))

      if (candidateMsg && !isGenericValidationError) {
        setFeedback({ type: 'danger', message: candidateMsg })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-fluid p-0">
      {/* Ocultar flechas (spinners) de inputs de número y efectivo */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button,
        .cash-input::-webkit-inner-spin-button,
        .cash-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number],
        .cash-input {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Toast flotante de retroalimentación */}
      {feedback && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1060, marginTop: '20px' }}>
          <div
            className={`toast show align-items-center text-white border-0 shadow-lg ${
              feedback.type === 'success' ? 'bg-success' : 'bg-danger'
            }`}
            style={{ borderRadius: '12px' }}
          >
            <div className="d-flex justify-content-between p-2">
              <div className="toast-body fw-semibold">{feedback.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setFeedback(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="row g-4 align-items-start">
          {/* COLUMNA IZQUIERDA: Formulario de Cliente, Envío y Productos */}
          <div className="col-12 col-lg-8">
            {/* Tarjeta: Datos del Cliente y Envío */}
            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                  Nueva Orden de Venta
                </h4>

                <div className="row g-3">
                  {/* Cliente */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small">Cliente</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className={`form-control ${
                          (customerId && customerDebtMessage) || (attemptedSubmit && !customerId)
                            ? 'is-invalid border-danger'
                            : ''
                        }`}
                        placeholder="Ningún cliente seleccionado"
                        value={customerId}
                        disabled
                        style={{ backgroundColor: '#f8fafc' }}
                      />
                      <button
                        type="button"
                        className="btn btn-success fw-semibold"
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                        onClick={handleCustomerButtonClick}
                      >
                        {customerId ? 'Cambiar cliente' : 'Buscar cliente'}
                      </button>
                    </div>
                    {/* Mensaje de deuda pendiente del cliente: solo cuando hay cliente seleccionado y tiene deuda */}
                    {customerId && customerDebtMessage && (
                      <span className="text-danger small mt-1 d-block fw-semibold">
                        {customerDebtMessage}
                      </span>
                    )}
                    {/* Validación al enviar sin cliente seleccionado */}
                    {attemptedSubmit && !customerId && (
                      <span className="text-danger small mt-1 d-block fw-semibold">
                        Debe seleccionar un cliente antes de enviar la orden.
                      </span>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small">Fecha</label>
                    <input
                      type="date"
                      className="form-control"
                      value={orderDate}
                      disabled
                      style={{ backgroundColor: '#f8fafc' }}
                    />
                  </div>

                  {/* Dirección de Envío (readOnly) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">Dirección de Envío</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      placeholder="Dirección del cliente seleccionado"
                      value={shipAddress}
                      readOnly
                      aria-readonly="true"
                    />
                    {attemptedSubmit && !isShipAddressValid && (
                      <span className="text-danger small mt-1 d-block">
                        Debe proporcionar la dirección de envío.
                      </span>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-muted small">Ciudad</label>
                    <input
                      type="text"
                      className={`form-control ${(cityTouched || attemptedSubmit) && !isCityValid ? 'is-invalid' : ''}`}
                      placeholder="Ej. Ambato"
                      value={shipCity}
                      onChange={handleCityChange}
                      onBlur={() => setCityTouched(true)}
                      maxLength={25}
                    />
                    {(cityTouched || attemptedSubmit) && !isCityValid && (
                      <span className="text-danger small mt-1 d-block">
                        {isCityEmpty
                          ? 'Se requiere la ciudad de envío.'
                          : isCityTooShort
                          ? 'Debe especificar al menos 3 caracteres del nombre de la ciudad.'
                          : ''}
                      </span>
                    )}
                  </div>

                  {/* País */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-muted small">País</label>
                    <input
                      type="text"
                      className={`form-control ${(countryTouched || attemptedSubmit) && !isCountryValid ? 'is-invalid' : ''}`}
                      placeholder="Ej. Ecuador"
                      value={shipCountry}
                      onChange={handleCountryChange}
                      onBlur={() => setCountryTouched(true)}
                      maxLength={25}
                    />
                    {(countryTouched || attemptedSubmit) && !isCountryValid && (
                      <span className="text-danger small mt-1 d-block">
                        {isCountryEmpty
                          ? 'Se requiere el país de envío.'
                          : isCountryTooShort
                          ? 'Debe especificar al menos 3 caracteres del nombre del País.'
                          : ''}
                      </span>
                    )}
                  </div>

                  {/* Código Postal */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-muted small">Código Postal</label>
                    <input
                      type="text"
                      className={`form-control ${(postalCodeTouched || attemptedSubmit) && !isPostalCodeValid ? 'is-invalid' : ''}`}
                      placeholder="Exactamente 6 dígitos"
                      value={shipPostalCode}
                      onChange={handlePostalCodeChange}
                      onBlur={() => setPostalCodeTouched(true)}
                      maxLength={6}
                    />
                    {(postalCodeTouched || attemptedSubmit) && !isPostalCodeValid && (
                      <span className="text-danger small mt-1 d-block">
                        Debe proporcionar el código postal de envío.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Productos */}
            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold m-0" style={{ color: '#0f172a' }}>
                    Productos
                  </h5>
                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4 fw-semibold"
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                    onClick={() => setShowProductModal(true)}
                  >
                    + Agregar Producto
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p className="mb-0 fs-6">
                      No hay productos. Use el botón 'Agregar Producto' para comenzar.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                          <th className="text-muted small fw-semibold text-center">ID</th>
                          <th className="text-muted small fw-semibold text-center">Producto</th>
                          <th className="text-muted small fw-semibold text-center">Precio</th>
                          <th className="text-muted small fw-semibold text-center">Stock</th>
                          <th className="text-muted small fw-semibold text-center" style={{ width: '130px' }}>
                            Cantidad
                          </th>
                          <th className="text-muted small fw-semibold text-center">Subtotal</th>
                          <th className="text-center text-muted small fw-semibold pe-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const qtyInvalid = item.quantity < 1
                          return (
                            <tr key={item.productId}>
                              <td className="fw-semibold text-secondary text-center">{item.productId}</td>
                              <td className="fw-bold text-center" style={{ color: '#0f172a' }}>
                                {item.productName}
                              </td>
                              <td className="text-center">${item.unitPrice.toFixed(2)}</td>
                              <td className="text-center">
                                <span className="badge bg-light text-dark border">
                                  {item.unitsInStock}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className={`form-control form-control-sm text-center ${qtyInvalid ? 'is-invalid' : ''}`}
                                  value={qtyInputs[item.productId] ?? String(item.quantity)}
                                  onChange={(e) => handleQtyInputChange(item, e.target.value)}
                                />
                                {qtyInvalid && (
                                  <span className="text-danger" style={{ fontSize: '0.75rem' }}>
                                    Mínimo 1
                                  </span>
                                )}
                              </td>
                              <td className="text-center fw-bold" style={{ color: '#10b981' }}>
                                ${(item.unitPrice * item.quantity).toFixed(2)}
                              </td>
                              <td className="text-center pe-3">
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    onClick={() => handleChangeProductClick(item)}
                                  >
                                    Cambiar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                    onClick={() => handleRemoveProductClick(item)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resumen de Pago y Envío */}
          <div className="col-12 col-lg-4">
            <div className="d-flex flex-column gap-3 mb-3">
              {/* Resumen de Pago */}
              <div
                className="card shadow-sm border-0 rounded-4"
                style={{ backgroundColor: '#f8fafc' }}
              >
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>
                    Resumen de Pago
                  </h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span className="fw-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">IVA (15%):</span>
                    <span className="fw-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-3">
                    <span className="fs-5 fw-bold">Total:</span>
                    <span className="fs-5 fw-bold" style={{ color: '#10b981' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Efectivo Recibido y Cambio */}
              <div className="card shadow-sm border-0 rounded-4 bg-white">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: '#0f172a' }}>
                      Efectivo Recibido:
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-control text-end fw-bold cash-input"
                        placeholder="0.00"
                        value={cashReceivedText}
                        onChange={handleCashReceivedChange}
                        required
                      />
                    </div>
                    {cashReceived > 0 && cashReceived < total && (
                      <small className="text-danger mt-1 d-block fw-semibold">
                        El efectivo recibido es insuficiente (${(total - cashReceived).toFixed(2)} faltante).
                      </small>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="fs-5 fw-bold">Cambio:</span>
                    <span
                      className={`fs-4 fw-bold ${
                        cashReceived >= total && total > 0 ? 'text-success' : 'text-muted'
                      }`}
                    >
                      ${change.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Enviar Orden */}
              <div className="d-grid mt-2">
                <button
                  type="submit"
                  className={`btn btn-lg rounded-pill fw-bold py-3 shadow-sm ${
                    isSubmitButtonActive ? 'btn-success' : 'btn-secondary text-white'
                  }`}
                  style={
                    isSubmitButtonActive
                      ? { backgroundColor: '#10b981', borderColor: '#10b981', cursor: 'pointer' }
                      : { backgroundColor: '#94a3b8', borderColor: '#94a3b8', cursor: 'not-allowed' }
                  }
                  disabled={!isSubmitButtonActive || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Enviando Orden...
                    </>
                  ) : (
                    'Enviar Orden'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal Advertencia de Confirmación (Cambiar Cliente / Eliminar Producto) */}
      {showConfirmModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 bg-white">
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h5 className="modal-title fw-bold" style={{ color: '#0f172a' }}>
                  {confirmTitle}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body px-4 py-3 fs-6 text-secondary">
                {confirmMessage}
              </div>
              <div className="modal-footer border-0 px-4 pb-4 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-semibold"
                  onClick={() => {
                    onConfirmAction?.()
                    setShowConfirmModal(false)
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buscar Cliente */}
      <CustomerSearchModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Modal Buscar Producto */}
      <ProductSearchModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddProduct={handleAddProduct}
        alreadyAddedIds={items.map((i) => i.productId)}
      />
    </div>
  )
}

export default OrderList
