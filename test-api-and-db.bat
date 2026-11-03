@echo off
title NorthWind Integration Test
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0test-api-and-db.ps1"
pause
