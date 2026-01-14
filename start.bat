@echo off
REM CHAIN_REACTION Bot Startup Script (Windows)

echo 🔥 CHAIN_REACTION Bot - Starting... 🔥
echo ======================================

REM Check if .env exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo Please create .env from .env.example and configure it.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if dist exists
if not exist dist (
    echo 🔨 Building TypeScript...
    call npm run build
)

echo ======================================
echo 🚀 Starting CHAIN_REACTION Bot...
echo ======================================
echo.

REM Start the bot
call npm start
