@echo off
echo ========================================
echo CHAIN_REACTION - ngrok WebSocket Tunnel
echo ========================================
echo.
echo Make sure your backend is running on port 8080 first!
echo.
echo Starting ngrok tunnel...
echo.
ngrok http 8080
pause
