# =============================================================
# run-webapi.ps1
# Compila, firma el ejecutable y arranca NorthWind.Sales.WebApi
# Compatible al 100% con Smart App Control de Windows 11
# =============================================================

$ErrorActionPreference = "Stop"

$ProjectDir   = $PSScriptRoot
$WebApiProj   = Join-Path $ProjectDir "NorthWind.Sales.WebApi"
$PublishDir   = "C:\NorthWindPublished\SingleFile"
$ExePath      = Join-Path $PublishDir "NorthWind.Sales.WebApi.exe"
$Signtool     = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\signtool.exe"
$Thumbprint   = "A6B6C4FEBEAEF99EF84E4209B8BD8D6C7C9F576B"
$TimestampUrl = "http://timestamp.digicert.com"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  NorthWind WebApi - Iniciar Servidor  " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Compilar y empaquetar
Write-Host "`n[1/3] Compilando y empaquetando WebApi..." -ForegroundColor Yellow
dotnet publish $WebApiProj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o $PublishDir --nologo -v quiet
if ($LASTEXITCODE -ne 0) { throw "Error en la compilación" }
Write-Host "     Compilación y empaquetado OK" -ForegroundColor Green

# 2. Firmar ejecutable
Write-Host "`n[2/3] Aplicando firma digital de desarrollo..." -ForegroundColor Yellow
& $Signtool sign /sha1 $Thumbprint /fd sha256 /tr $TimestampUrl /td sha256 $ExePath 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Error al firmar el ejecutable" }
Write-Host "     Firma digital verificada OK" -ForegroundColor Green

# 3. Arrancar servidor
Write-Host "`n[3/3] Iniciando servidor WebApi..." -ForegroundColor Yellow
Write-Host "     Swagger UI disponible en:" -ForegroundColor Cyan
Write-Host "     -> http://localhost:5254/swagger" -ForegroundColor White
Write-Host "     -> https://localhost:7154/swagger" -ForegroundColor White
Write-Host "`n     (Presiona Ctrl+C en esta consola para detener el servidor)`n" -ForegroundColor Gray

$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "https://localhost:7154;http://localhost:5254"

# Copiar appsettings.json al directorio de ejecucion
Copy-Item (Join-Path $WebApiProj "appsettings.json") $PublishDir -Force

# Iniciar navegador automáticamente
Start-Process "http://localhost:5254/swagger"

# Iniciar proceso con el directorio de trabajo correcto
Push-Location $PublishDir
try {
    & $ExePath
}
finally {
    Pop-Location
}
