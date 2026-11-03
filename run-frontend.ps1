# =============================================================
# run-frontend.ps1
# Inicia el cliente Web Blazor WebAssembly (Diseño de interfaz)
# =============================================================

$ErrorActionPreference = "Stop"

$ProjectDir = $PSScriptRoot
$BlazorProj = Join-Path $ProjectDir "NorthWind.Sales.BlazorClient"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NorthWind Frontend - Cliente Web Blazor WebAssembly     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Liberar puerto 5136 si quedó tomado por una ejecución previa
$prevConns = Get-NetTCPConnection -LocalPort 5136 -ErrorAction SilentlyContinue
if ($prevConns) {
    Write-Host "Liberando puerto 5136 ocupado previamente..." -ForegroundColor Yellow
    $prevConns.OwningProcess | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

Write-Host "`nIniciando cliente web en http://localhost:5136..." -ForegroundColor Yellow
Write-Host "Abriendo la interfaz gráfica en tu navegador...`n" -ForegroundColor Green

# Iniciar navegador
Start-Process "http://localhost:5136"

# Ejecutar Blazor Client
dotnet run --project $BlazorProj --launch-profile http
