import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import OrderList from './pages/OrderList'
import InvoiceView from './pages/InvoiceView'
import InvoiceList from './pages/InvoiceList'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas con Sidebar/MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/ordenes" element={<OrderList />} />
            <Route path="/facturas" element={<InvoiceList />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/factura/:id" element={<InvoiceView />} />
            <Route path="/invoice/:id" element={<InvoiceView />} />
          </Route>

          {/* Redirección por defecto a la página de bienvenida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
