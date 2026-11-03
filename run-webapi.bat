@echo off
title NorthWind WebApi Server
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-webapi.ps1"
pause
