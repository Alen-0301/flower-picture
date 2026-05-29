@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ================================
echo    🌸 沐野鲜花 - 启动中...
echo  ================================

REM 启动 Node 服务器（后台）
start "FlowerShop" /B node server.js

REM 等待服务器就绪
timeout /t 2 /nobreak >nul

REM 启动 ngrok
echo    启动 ngrok 隧道...
echo    如果没有预留域名，请改成: ngrok http 8080
echo.
ngrok http --domain=你的域名.ngrok.app 8080

pause
