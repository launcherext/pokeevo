#!/bin/bash

# CHAIN_REACTION Bot Startup Script

echo "🔥 CHAIN_REACTION Bot - Starting... 🔥"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.example and configure it."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dist exists
if [ ! -d dist ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
redis-cli ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Redis doesn't seem to be running!"
    echo "Start Redis with: redis-server"
    echo "Or check REDIS_URL in .env if using remote Redis"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "======================================"
echo "🚀 Starting CHAIN_REACTION Bot..."
echo "======================================"
echo ""

# Start the bot
npm start
