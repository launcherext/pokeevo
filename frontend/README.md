# ZERO_HOUR Frontend

Real-time visualization dashboard for the ZERO_HOUR recursive token experiment.

## Features

- 🔴 **Live Bonding Curve Progress** - Animated progress bar with real-time updates
- 💀 **Kill Zone Effects** - Visual warnings when approaching 99%+ completion
- 🎬 **Mitosis Animation** - Epic transition when new tokens are born
- 📊 **System Stats** - Generation counter, market cap, status indicators
- 📡 **Event Stream** - Real-time log of all bot activities
- 🎨 **Blood-Red Theme** - Custom styling with glitch effects

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure WebSocket

Create `.env.local`:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

If your backend is on a different host:
```env
NEXT_PUBLIC_WS_URL=ws://your-server-ip:8080
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## WebSocket Events

The frontend listens for these events from the backend:

### curve_update
```json
{
  "event": "curve_update",
  "progress": 0.987,
  "marketCap": 67500,
  "mint": "TokenMintAddress",
  "timestamp": 1234567890
}
```

### mitosis_imminent
```json
{
  "event": "mitosis_imminent",
  "currentMint": "CurrentTokenMint",
  "progress": 0.996,
  "timestamp": 1234567890
}
```

### mitosis_complete
```json
{
  "event": "mitosis_complete",
  "oldMint": "OldTokenMint",
  "newMint": "NewTokenMint",
  "signature": "TransactionSignature",
  "generation": 7,
  "timestamp": 1234567890
}
```

## Customization

### Colors

Edit `tailwind.config.ts` to change the blood-red color scheme:
```typescript
colors: {
  blood: {
    500: '#ff3838',  // Change this
  }
}
```

### Animations

Edit `app/globals.css` for custom animations:
- `.glitch-text` - Text glitch effect
- `.kill-zone` - Pulsing red glow
- `.mitosis-animation` - Token splitting effect

### Update Frequency

The frontend updates in real-time based on WebSocket messages. The backend sends:
- `curve_update` every 200ms during intensive polling
- `mitosis_imminent` when progress > 99%
- `mitosis_complete` after successful deployment

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **WebSocket** - Real-time communication

## Troubleshooting

### WebSocket won't connect
- Check backend is running on port 8080
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
- Check browser console for errors

### Updates are slow
- Backend might be in casual polling phase (30s intervals)
- Wait for market cap to reach $50k for intensive polling

### Animation lag
- Check CPU usage
- Reduce animation complexity in `MitosisAnimation.tsx`

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

**Built for the ZERO_HOUR experiment** 🔥
