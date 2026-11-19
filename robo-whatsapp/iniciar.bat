@echo off
chcp 65001 >nul
title Robo WhatsApp - Casamento Cezar e Liriel
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  O Node.js nao esta instalado.
  echo  Baixe a versao LTS em https://nodejs.org , instale e abra este arquivo de novo.
  echo.
  start https://nodejs.org
  pause
  exit /b
)

if not exist node_modules (
  echo Instalando o robo pela primeira vez, aguarde 1-2 minutos...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo Falha na instalacao. Verifique a internet e tente de novo.
    pause
    exit /b
  )
)

:loop
node robo.js
echo.
echo O robo parou. Reiniciando em 10 segundos (feche a janela para encerrar)...
timeout /t 10 >nul
goto loop
