@echo off
chcp 65001 >nul
cd /d "%~dp0"
node tools\generate-daily-code.js
echo.
pause

