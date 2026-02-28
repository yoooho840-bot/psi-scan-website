@echo off
chcp 65001 > nul
echo ===================================================
echo [SEC-WATCH] ⚠️ MAIN APP EXTERNAL TUNNEL INITIATED
echo ===================================================
npx localtunnel --port 5174
pause
