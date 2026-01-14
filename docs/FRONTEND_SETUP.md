# 🎨 CHAIN_REACTION Frontend - Complete Setup Guide

## ✅ What Was Built

A **stunning, real-time Next.js dashboard** that visualizes the entire CHAIN_REACTION mitosis process with:

- 🔴 **Live bonding curve progress bar** (updates every 200ms)
- 💀 **"Kill Zone" effects** - Pulsing red glows and glitch text at 99%+
- 🎬 **Epic mitosis animation** - Token "splits" and new generation emerges
- 📊 **Real-time stats panel** - Generation counter, market cap, system phase
- 🔄 **Token info display** - Current mint, name, symbol with Solscan/Pump.fun links
- 📡 **Live event stream** - Scrolling log of all bot activities
- 🎨 **Blood-red cyberpunk theme** - Custom Tailwind colors and animations
- ⚡ **WebSocket connection** - Real-time updates with auto-reconnect

---

## 🚀 Quick Start (5 Minutes)

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14 (React framework)
- Framer Motion (smooth animations)
- Recharts (future charts)
- TypeScript & Tailwind CSS

### 3. Configure WebSocket

Create `.env.local`:
```bash
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8080" > .env.local
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open Browser

Navigate to: **http://localhost:3000**

You should see the CHAIN_REACTION dashboard!

---

## 🎬 What You'll See

### Initial State (No Connection)
- Black/red cyberpunk interface
- "DISCONNECTED" status indicator
- Empty progress bar
- "Waiting for events..." message

### When Bot Connects
- ✅ "LIVE" status turns green
- Progress bar starts updating
- Market cap displays
- Event stream populates

### Casual Phase (MC < $50k)
- Blue progress bar
- Updates every 30 seconds
- "🌙 Casual Monitoring" phase indicator

### Intensive Phase (MC ≥ $50k)
- Orange/red progress bar
- Updates every 200ms
- "⚡ Intensive Scan" phase indicator

### Kill Zone (99%+)
- 🔴 Pulsing red border
- Glitch text effects
- "⚠️ KILL ZONE ACTIVE" warning
- "MITOSIS IMMINENT" alert box

### Mitosis Event
- Full-screen animation overlay
- Old token "splits" and fades
- New token emerges spinning
- "MITOSIS COMPLETE" message
- Generation counter increments
- New token info displays
- Everything resets for next cycle

---

## 🎨 Visual Features

### Animations

**Progress Bar**
- Smooth width transitions
- Color shifts based on progress:
  - Blue/Purple: 0-94%
  - Orange/Red: 95-99%
  - Red with glow: 99%+ (Kill Zone)

**Kill Zone Effects**
- Pulsing red border (box-shadow animation)
- Text glitch effect (RGB shift)
- Flash animation (opacity pulse)

**Mitosis Animation (2-3 seconds)**
1. 20 particle explosions
2. Old token scales up and splits
3. New token emerges from center
4. Flash of white light
5. Smooth fade to normal view

### Color Scheme

```
Primary: Blood Red (#ff0000, #8b0000)
Accent: Purple (#9333ea)
Success: Green (#22c55e)
Warning: Orange (#f97316)
Background: Black gradient
```

### Typography

- Header: 72px bold "CHAIN REACTION"
- Progress %: 32px bold
- Stats: 24px bold
- Body: 16px regular

---

## 📊 Components Breakdown

### `app/page.tsx` (Main Dashboard)
- WebSocket connection logic
- State management
- Event routing
- Component orchestration

### `BondingProgress.tsx`
- Progress bar with animation
- Market cap display
- Kill zone warning
- Threshold marker at 99.5%

### `TokenInfo.tsx`
- Token name/symbol/generation
- Mint address with copy button
- Links to Solscan & Pump.fun

### `MitosisAnimation.tsx`
- Full-screen overlay
- Particle effects
- Token splitting animation
- Generation announcement

### `StatsPanel.tsx`
- 4 key metrics (generation, progress, MC, status)
- Phase indicator
- Last update timestamp
- Auto-updating timers

### `EventLog.tsx`
- Scrolling event stream
- 50 most recent events
- Icon & color coding
- Timestamp formatting

---

## 🔌 WebSocket Integration

The frontend auto-connects to your backend WebSocket server.

### Connection Flow

1. Frontend connects to `ws://localhost:8080` on page load
2. Backend sends events (curve_update, mitosis_imminent, etc.)
3. Frontend updates UI in real-time
4. If disconnected, auto-reconnects after 5 seconds

### Handling Events

```typescript
// Backend sends:
{
  event: "curve_update",
  progress: 0.987,
  marketCap: 67500,
  mint: "ABC123...",
  timestamp: 1234567890
}

// Frontend updates:
- Progress bar → 98.7%
- Market cap → $67,500
- Event log adds entry
- Last update timestamp refreshes
```

---

## 🚀 Production Deployment

### Option 1: Vercel (Easiest)

```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_WS_URL=wss://your-backend-server.com:8080
```

### Option 2: Docker

Create `frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t chain-reaction-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_WS_URL=ws://backend:8080 chain-reaction-frontend
```

### Option 3: PM2

```bash
cd frontend
npm run build

npm install -g pm2
pm2 start npm --name "chain-reaction-frontend" -- start
pm2 save
```

---

## 🔧 Customization

### Change Colors

Edit `frontend/tailwind.config.ts`:
```typescript
colors: {
  blood: {
    500: '#your-color',  // Main red
  }
}
```

### Adjust Animation Speed

Edit `frontend/components/MitosisAnimation.tsx`:
```typescript
transition={{
  duration: 2,  // Change from 2 to your preferred seconds
}}
```

### Change WebSocket URL

Edit `.env.local`:
```env
NEXT_PUBLIC_WS_URL=ws://your-server:port
```

For secure WebSocket (production):
```env
NEXT_PUBLIC_WS_URL=wss://your-server.com:8080
```

---

## 🐛 Troubleshooting

### "DISCONNECTED" Status

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Check backend is running: `npm start` (in root directory)
2. Verify WebSocket port: Should be 8080
3. Check `.env.local` URL is correct
4. Look at browser console for errors (F12)

### No Updates

**Problem**: Connected but progress not updating

**Solutions**:
1. Backend might be in casual mode (30s updates) - wait
2. Check backend logs for errors
3. Verify bot has active token configured
4. Check `GENESIS_TOKEN_MINT` is set in backend `.env`

### Animation Lag

**Problem**: Slow or choppy animations

**Solutions**:
1. Check CPU usage (animations are intensive)
2. Close other browser tabs
3. Reduce particle count in `MitosisAnimation.tsx`
4. Disable animations in `framer-motion` components

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📱 Mobile Responsiveness

The frontend is **fully responsive**:

- **Desktop (1920px+)**: 3-column layout
- **Tablet (768-1920px)**: 2-column layout
- **Mobile (< 768px)**: Single column, stacked

Test mobile view:
1. Open dev tools (F12)
2. Click device toolbar icon
3. Select iPhone or Android

---

## 🎯 Next Steps

### Now that frontend is built:

1. ✅ **Run backend**: `cd .. && npm start`
2. ✅ **Run frontend**: `cd frontend && npm run dev`
3. 📝 **Configure .env**: Set GENESIS_TOKEN_MINT
4. 🧪 **Test connection**: Check "LIVE" status
5. 👀 **Watch the magic**: See bonding curve progress
6. 🚀 **Deploy both**: Backend + Frontend to production

---

## 📊 Full System Architecture

```
┌─────────────────────┐
│   Frontend (Next.js) │
│   Port: 3000        │
└──────────┬──────────┘
           │ WebSocket
           ▼
┌─────────────────────┐
│  Backend MEV Bot    │
│  Port: 8080 (WS)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Redis Cache        │
│  Port: 6379         │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Solana Network     │
│  (Helius RPC)       │
└─────────────────────┘
```

---

## 🔥 You Now Have

- ✅ Complete backend MEV bot
- ✅ Real-time WebSocket server
- ✅ Stunning animated frontend
- ✅ Full documentation
- ✅ Production-ready setup

**The CHAIN_REACTION system is complete!** 🎉

Just configure your tokens and watch the recursive mitosis unfold in beautiful, real-time visualization.

---

**Built with 🔪 for the CHAIN_REACTION experiment**
