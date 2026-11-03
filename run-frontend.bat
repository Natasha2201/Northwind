@echo off
title NorthWind Frontend Blazor
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-frontend.ps1"
pause
