@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\Robo WhatsApp Casamento.lnk'); $s.TargetPath='%~dp0iniciar.bat'; $s.WorkingDirectory='%~dp0'; $s.WindowStyle=7; $s.Description='Robo WhatsApp do casamento'; $s.Save()"
if errorlevel 1 (
  echo Nao consegui criar o atalho.
) else (
  echo Pronto! O robo vai ligar sozinho ^(minimizado^) sempre que o Windows iniciar.
)
echo.
pause
