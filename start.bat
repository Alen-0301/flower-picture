@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ================================
echo    🌸 沐野鲜花 - 启动中...
echo  ================================
echo.
echo    前台展示: http://localhost:8080
echo    管理后台: http://localhost:8080/admin
echo    管理密码: flower2024
echo.
echo    按 Ctrl+C 停止服务器
echo  ================================
echo.
node server.js
pause
