@echo off
title Iniciar NorthWind (Backend + Frontend)
cd /d "%~dp0"
echo ==========================================================
echo   Iniciando NorthWind: Backend API + Frontend Web
echo ==========================================================
echo.
echo 1. Iniciando WebApi (Backend)...
start "NorthWind Backend API" cmd /c "%~dp0run-webapi.bat"

echo Esperando 5 segundos a que el Backend este listo...
timeout /t 5 /nobreak >nul

echo 2. Iniciando Blazor WebAssembly (Frontend con Diseno)...
start "NorthWind Frontend Web" cmd /c "%~dp0run-frontend.bat"

echo.
echo Todo listo. Se han abierto las ventanas de Backend y Frontend.
