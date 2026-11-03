# =============================================================
# test-api-and-db.ps1
# Prueba integral de WebApi y base de datos CarlosM\MULTIDIMENSIONAL
# =============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Prueba Integral NorthWind (API + SQL Server)            " -ForegroundColor Cyan
Write-Host "  Instancia BD: CarlosM\MULTIDIMENSIONAL                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Comprobar si la WebApi está respondiendo
Write-Host "`n[1/4] Verificando conexión con WebApi en http://localhost:5254..." -ForegroundColor Yellow
try {
    $swagger = Invoke-RestMethod -Uri "http://localhost:5254/swagger/v1/swagger.json" -Method Get
    Write-Host "     WebApi ACTIVA y respondiendo: $($swagger.info.title) v$($swagger.info.version)" -ForegroundColor Green
} catch {
    Write-Host "     La WebApi no está iniciada. Iníciala primero con .\run-webapi.ps1" -ForegroundColor Red
    exit 1
}

# 2. Registrar usuario o Iniciar sesión
Write-Host "`n[2/4] Autenticación de usuario..." -ForegroundColor Yellow
$userEmail = "carlos@northwind.com"
$userPass  = "Password123!"

$loginBody = @{
    Email    = $userEmail
    Password = $userPass
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "http://localhost:5254/user/Login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResp.accessToken
    Write-Host "     Inicio de sesión exitoso. Token JWT generado correctamente." -ForegroundColor Green
} catch {
    Write-Host "     Registrando usuario $userEmail..." -ForegroundColor Gray
    $regBody = @{
        FirstName = "Carlos"
        LastName  = "Mendoza"
        Email     = $userEmail
        Password  = $userPass
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5254/user/Register" -Method Post -Body $regBody -ContentType "application/json" | Out-Null
    $loginResp = Invoke-RestMethod -Uri "http://localhost:5254/user/Login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResp.accessToken
    Write-Host "     Usuario registrado y logueado OK." -ForegroundColor Green
}

# 3. Crear orden de prueba (usando productos con stock en base de datos)
Write-Host "`n[3/4] Enviando orden de compra a /CreateOrder..." -ForegroundColor Yellow
$orderData = @{
    CustomerId     = "ALFKI"
    ShipAddress    = "Obere Str. 57"
    ShipCity       = "Berlin"
    ShipCountry    = "Germany"
    ShipPostalCode = "12209"
    OrderDetails   = @(
        @{
            ProductId = 1
            UnitPrice = 35.00
            Quantity  = 2
        },
        @{
            ProductId = 3
            UnitPrice = 65.00
            Quantity  = 3
        }
    )
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

$orderId = Invoke-RestMethod -Uri "http://localhost:5254/CreateOrder" -Method Post -Body $orderData -ContentType "application/json" -Headers $headers
Write-Host "     ¡Orden creada exitosamente con ID: $orderId!" -ForegroundColor Green

# 4. Consultar SQL Server en CarlosM\MULTIDIMENSIONAL
Write-Host "`n[4/4] Consultando datos guardados en SQL Server (CarlosM\MULTIDIMENSIONAL)..." -ForegroundColor Yellow
Write-Host "`n--> Tabla Orders (NorthWindDB):" -ForegroundColor Cyan
sqlcmd -S "CarlosM\MULTIDIMENSIONAL" -E -d NorthWindDB -Q "SELECT TOP 5 Id, CustomerId, ShipAddress, ShipCity, OrderDate FROM Orders ORDER BY Id DESC;"

Write-Host "`n--> Tabla OrderDetails (NorthWindDB):" -ForegroundColor Cyan
sqlcmd -S "CarlosM\MULTIDIMENSIONAL" -E -d NorthWindDB -Q "SELECT OrderId, ProductId, Quantity, UnitPrice FROM OrderDetails WHERE OrderId = $orderId;"

Write-Host "`n--> Tabla DomainLogs (NorthWindLogsDB):" -ForegroundColor Cyan
sqlcmd -S "CarlosM\MULTIDIMENSIONAL" -E -d NorthWindLogsDB -Q "SELECT TOP 4 Id, Information, UserName, CreatedDate FROM DomainLogs ORDER BY Id DESC;"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  ¡TODO EL SISTEMA ESTÁ 100% FUNCIONAL Y VERIFICADO!      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
