import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInvoice, type InvoiceDto } from '../services/invoiceService'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [printing, setPrinting] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) {
      setError('ID de orden no proporcionado')
      setLoading(false)
      return
    }

    const orderId = parseInt(id, 10)
    if (isNaN(orderId)) {
      setError('ID de orden inválido')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    getInvoice(orderId)
      .then((data) => {
        setInvoice(data)
      })
      .catch((err) => {
        console.error('Error al cargar factura:', err)
        setError('No se pudo encontrar la factura solicitada.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch {
      return dateStr
    }
  }

  // Genera clave de acceso / autorización SRI electrónica formal (49 dígitos)
  const getAuthKey = (dateStr?: string, num?: string): string => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date()
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = String(d.getFullYear())
      const ruc = '1792048956001'
      const sec = (num || '1').replace(/\D/g, '').padStart(9, '0')
      const raw = `${day}${month}${year}01${ruc}1001001${sec}123456781`
      return raw.padEnd(49, '7').slice(0, 49)
    } catch {
      return '031120260117920489560011001001000000351234567819'
    }
  }

  // Genera el documento PDF en escala de grises (blanco y negro puro) usando html2canvas y jsPDF
  const generatePdfDocument = async (): Promise<{ pdf: jsPDF; fileName: string } | null> => {
    if (!invoice || !invoiceRef.current) return null
    const element = invoiceRef.current

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Conversión de píxeles a escala de grises (blanco y negro estricto)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data
      for (let i = 0; i < data.length; i += 4) {
        // Luminancia estándar NTSC / CIE: 0.299 R + 0.587 G + 0.114 B
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        data[i] = gray     // Red
        data[i + 1] = gray // Green
        data[i + 2] = gray // Blue
      }
      ctx.putImageData(imgData, 0, 0)
    }

    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.98)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfPageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const contentWidth = pdfWidth - margin * 2
    const contentHeight = (canvas.height * contentWidth) / canvas.width

    if (contentHeight <= pdfPageHeight - margin * 2) {
      pdf.addImage(imgDataUrl, 'JPEG', margin, margin, contentWidth, contentHeight)
    } else {
      const scaledHeight = pdfPageHeight - margin * 2
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height
      const offsetX = margin + (contentWidth - scaledWidth) / 2
      pdf.addImage(imgDataUrl, 'JPEG', offsetX, margin, scaledWidth, scaledHeight)
    }

    const fileName = `Factura-${invoice.invoiceNumber || id}.pdf`
    return { pdf, fileName }
  }

  // Descarga del archivo PDF en escala de grises
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      const result = await generatePdfDocument()
      if (result) {
        result.pdf.save(result.fileName)
      }
    } catch (clientErr) {
      console.error('Error generando PDF de factura con html2canvas:', clientErr)
      alert('Ocurrió un error al generar el PDF de la factura.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Imprimir: genera el PDF en escala de grises y lo abre en una nueva pestaña para imprimir desde el visor PDF
  const handlePrint = async () => {
    setPrinting(true)
    try {
      const result = await generatePdfDocument()
      if (result) {
        result.pdf.autoPrint()
        const pdfBlob = result.pdf.output('blob')
        const blobUrl = URL.createObjectURL(pdfBlob)
        window.open(blobUrl, '_blank')
      }
    } catch (clientErr) {
      console.error('Error preparando impresión de factura:', clientErr)
      alert('Ocurrió un error al generar la vista previa de impresión.')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="container-fluid p-0">
      {/* BOTONES DE ACCIÓN (FUERA DE LA FACTURA Y OCULTOS AL IMPRIMIR O EN PDF) */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print flex-wrap gap-2">
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4 fw-semibold shadow-sm"
            onClick={() => navigate('/ordenes')}
          >
            ← Volver a Órdenes
          </button>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            disabled={downloadingPdf || printing || !invoice}
            onClick={handleDownloadPdf}
          >
            {downloadingPdf ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Generando PDF...
              </>
            ) : (
              <>📄 Descargar PDF</>
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-dark rounded-pill px-4 fw-bold shadow-sm"
            disabled={downloadingPdf || printing || !invoice}
            onClick={handlePrint}
          >
            {printing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Generando PDF...
              </>
            ) : (
              <>🖨️ Imprimir</>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-2 fw-semibold">Cargando factura...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card shadow-sm border-0 rounded-4 bg-white p-5 text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="mb-3 text-danger fs-1">⚠️</div>
          <h4 className="fw-bold text-dark">{error}</h4>
          <p className="text-muted">Verifique que el identificador de la orden sea correcto.</p>
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-success rounded-pill px-4 fw-semibold"
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              onClick={() => navigate('/ordenes')}
            >
              Volver a Órdenes
            </button>
          </div>
        </div>
      )}

      {/* ÁREA EXCLUSIVA DE LA FACTURA */}
      {invoice && !loading && (
        <div
          id="printable-invoice"
          ref={invoiceRef}
          style={{
            maxWidth: '800px',
            width: '100%',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '32px 36px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
            color: '#1a1a1a',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          {/* ENCABEZADO */}
          <div className="row g-4 mb-4 align-items-start">
            {/* Encabezado Izquierdo */}
            <div className="col-12 col-md-6">
              <h2 className="fw-bold m-0" style={{ letterSpacing: '0.5px', fontSize: '1.8rem', color: '#000000' }}>
                NORTHWIND
              </h2>
              <div className="small fw-bold mb-2" style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>
                Soluciones Comerciales & Distribución
              </div>
              <div className="small" style={{ lineHeight: '1.5', fontSize: '0.85rem', color: '#1a1a1a' }}>
                <div><strong style={{ color: '#000000', fontWeight: 700 }}>RUC:</strong> 1792048956001</div>
                <div>Av. Amazonas N24-196 y Luis Cordero, Quito - Ecuador</div>
                <div>contacto@northwind.com | Telf: (02) 298-5400</div>
              </div>
            </div>

            {/* Encabezado Derecho (Recuadro gris claro con bordes negros finos) */}
            <div className="col-12 col-md-6">
              <div
                style={{
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  padding: '12px 16px',
                  backgroundColor: '#f3f4f6',
                }}
              >
                <div
                  className="fw-bold text-center text-uppercase mb-1"
                  style={{ fontSize: '1rem', letterSpacing: '0.5px', color: '#000000' }}
                >
                  FACTURA ELECTRÓNICA
                </div>
                <div className="text-center fw-bold mb-2" style={{ fontSize: '1.15rem', color: '#000000' }}>
                  {invoice.invoiceNumber || 'FAC-00000035'}
                </div>
                <div className="small mb-1 text-center" style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>
                  <strong style={{ color: '#000000', fontWeight: 700 }}>Fecha:</strong> {formatDate(invoice.orderDate)}
                </div>
                <div className="small fw-bold mt-2 text-center" style={{ fontSize: '0.82rem', color: '#000000' }}>
                  AUTORIZACIÓN SRI
                </div>
                <div
                  className="mt-1 p-1 bg-white rounded border text-center"
                  style={{
                    fontSize: '0.52rem',
                    fontFamily: 'Courier New, monospace',
                    letterSpacing: '-0.2px',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    color: '#000000',
                    fontWeight: 600,
                  }}
                  title={getAuthKey(invoice.orderDate, invoice.invoiceNumber)}
                >
                  {getAuthKey(invoice.orderDate, invoice.invoiceNumber)}
                </div>
              </div>
            </div>
          </div>

          {/* DATOS DEL CLIENTE Y ENTREGA */}
          <div
            className="mb-4"
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
            }}
          >
            <div className="row g-3">
              {/* Columna Cliente */}
              <div className="col-12 col-md-6 border-md-end" style={{ borderRight: '1px solid #e2e8f0' }}>
                <div
                  className="fw-bold text-uppercase small mb-2"
                  style={{ letterSpacing: '0.5px', fontSize: '0.85rem', color: '#000000' }}
                >
                  Datos del Cliente
                </div>
                <div className="small" style={{ lineHeight: '1.5', fontSize: '0.85rem', color: '#1a1a1a' }}>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>Razón Social:</strong>{' '}
                    <span style={{ fontWeight: 500 }}>{invoice.customerName || invoice.customerId}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>RUC/C.I.:</strong>{' '}
                    <span style={{ fontWeight: 500 }}>{invoice.customerIdentification || invoice.customerId}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>Dirección:</strong>{' '}
                    <span style={{ fontWeight: 500 }}>{invoice.customerAddress || invoice.shipAddress || 'S/N'}</span>
                  </div>
                </div>
              </div>

              {/* Columna Entrega */}
              <div className="col-12 col-md-6">
                <div
                  className="fw-bold text-uppercase small mb-2"
                  style={{ letterSpacing: '0.5px', fontSize: '0.85rem', color: '#000000' }}
                >
                  Datos de Entrega
                </div>
                <div className="small" style={{ lineHeight: '1.5', fontSize: '0.85rem', color: '#1a1a1a' }}>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>Dirección:</strong>{' '}
                    <span style={{ fontWeight: 500 }}>{invoice.shipAddress || invoice.customerAddress || 'S/N'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>Ciudad/País:</strong>{' '}
                    <span style={{ fontWeight: 500 }}>
                      {invoice.shipCity ? `${invoice.shipCity}, ${invoice.shipCountry}` : (invoice.shipCountry || 'Ecuador')}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>Cód. Postal:</strong>{' '}
                    <span style={{ fontWeight: 500 }}>{invoice.shipPostalCode || '170150'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS (Encabezado negro con letras blancas) */}
          <div className="mb-4" style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                tableLayout: 'fixed',
                borderCollapse: 'collapse',
                border: '1px solid #000000',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                  <th style={{ width: '12%', padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px', color: '#ffffff', border: '1px solid #000000' }}>
                    CÓDIGO
                  </th>
                  <th style={{ width: '46%', padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px', color: '#ffffff', border: '1px solid #000000' }}>
                    DESCRIPCIÓN
                  </th>
                  <th style={{ width: '14%', padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', letterSpacing: '0.5px', color: '#ffffff', border: '1px solid #000000' }}>
                    PRECIO
                  </th>
                  <th style={{ width: '12%', padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', letterSpacing: '0.5px', color: '#ffffff', border: '1px solid #000000' }}>
                    CANT.
                  </th>
                  <th style={{ width: '16%', padding: '8px 10px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'right', letterSpacing: '0.5px', color: '#ffffff', border: '1px solid #000000' }}>
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.details && invoice.details.length > 0 ? (
                  invoice.details.map((item, idx) => (
                    <tr
                      key={item.productId || idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <td style={{ padding: '8px 10px', fontSize: '0.85rem', color: '#1a1a1a', fontWeight: 600, border: '1px solid #e5e7eb', textAlign: 'left' }}>
                        {item.productId}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.85rem', color: '#000000', fontWeight: 600, border: '1px solid #e5e7eb', textAlign: 'left' }}>
                        {item.productName}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.85rem', textAlign: 'center', color: '#1a1a1a', fontWeight: 500, border: '1px solid #e5e7eb' }}>
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600, color: '#000000', border: '1px solid #e5e7eb' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.85rem', textAlign: 'right', fontWeight: 700, color: '#000000', border: '1px solid #e5e7eb' }}>
                        ${(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#4b5563', border: '1px solid #e5e7eb' }}>
                      Sin productos registrados en esta factura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALES E INFORMACIÓN ADICIONAL */}
          <div className="row g-3 align-items-start mb-2">
            {/* Información Adicional */}
            <div className="col-12 col-md-7">
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '12px 14px',
                  backgroundColor: '#f9fafb',
                }}
              >
                <div
                  className="fw-bold text-uppercase small mb-2"
                  style={{ letterSpacing: '0.5px', fontSize: '0.85rem', color: '#000000' }}
                >
                  Información Adicional
                </div>
                <div className="small" style={{ lineHeight: '1.6', fontSize: '0.85rem', color: '#1a1a1a' }}>
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 700 }}>Forma de Pago:</strong> Efectivo
                  </div>
                  <div className="mt-2" style={{ fontSize: '0.75rem', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', color: '#4b5563' }}>
                    Documento generado electrónicamente. Comprobante válido para fines tributarios de acuerdo a la normativa legal vigente del SRI.
                  </div>
                </div>
              </div>
            </div>

            {/* Totales (TOTAL A PAGAR con fondo negro y letras blancas) */}
            <div className="col-12 col-md-5">
              <div
                style={{
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  className="d-flex justify-content-between px-3 py-2 small"
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <span style={{ color: '#000000', fontWeight: 700 }}>SUBTOTAL:</span>
                  <span style={{ color: '#000000', fontWeight: 700 }}>${(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div
                  className="d-flex justify-content-between px-3 py-2 small"
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <span style={{ color: '#000000', fontWeight: 700 }}>IVA:</span>
                  <span style={{ color: '#000000', fontWeight: 700 }}>${(invoice.tax || 0).toFixed(2)}</span>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center px-3 py-2"
                  style={{ backgroundColor: '#000000', color: '#ffffff' }}
                >
                  <span className="fw-bold text-white" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                    TOTAL A PAGAR:
                  </span>
                  <span className="fw-bold fs-6 text-white">
                    ${(invoice.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceView
