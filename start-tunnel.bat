@echo off
echo ========================================
echo CHAIN_REACTION - WebSocket Tunnel
echo ========================================
echo.
echo Make sure your backend is running on port 8080 first!
echo.
echo Starting localtunnel...
echo.
lt --port 8080 --subdomain chain-reaction-ws
pause
