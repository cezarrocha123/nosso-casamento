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

if exist "node_modules\@whiskeysockets\baileys\package.json" if exist "node_modules\pino\package.json" goto rodar

where git >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Falta instalar o Git para Windows ^(o robo precisa dele so na instalacao^).
  echo  Vou abrir o site: baixe, instale com as opcoes padrao ^(Next, Next...^)
  echo  e depois FECHE esta janela e abra o iniciar.bat de novo.
  echo.
  start https://git-scm.com/download/win
  pause
  exit /b
)

echo Instalando o robo pela primeira vez, aguarde 1-3 minutos...
if exist node_modules rmdir /s /q node_modules
call npm install --no-audit --no-fund
if not exist "node_modules\@whiskeysockets\baileys\package.json" (
  echo.
  echo  A instalacao nao terminou. Verifique a internet e tente de novo.
  echo  Se continuar, mande ao Claude o texto de erro acima.
  pause
  exit /b
)

:rodar
node robo.js
echo.
echo O robo parou. Reiniciando em 10 segundos (feche a janela para encerrar)...
timeout /t 10 >nul
goto rodar
