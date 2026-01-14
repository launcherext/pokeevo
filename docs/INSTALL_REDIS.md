# 🔴 Install Redis on Windows

Redis is not installed on your system. Here are your options:

---

## ⚡ Option 1: Use Redis Cloud (Easiest - 2 minutes)

**Best for:** Quick setup, no local installation needed

### Steps:

1. Go to **https://redis.com/try-free/**
2. Sign up (free tier - no credit card needed)
3. Create a new database
4. Copy the connection string (looks like: `redis://default:password@redis-12345.cloud.redislabs.com:12345`)
5. Update your `.env` file:
   ```env
   REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_REDIS_URL:PORT
   ```
6. **Done!** Skip to starting the bot.

---

## 🐧 Option 2: Use WSL (Windows Subsystem for Linux)

**Best for:** Local development, full control

### Steps:

1. **Install WSL** (if not already installed):
   ```powershell
   wsl --install
   ```
   (Restart computer if prompted)

2. **Open WSL terminal**:
   ```powershell
   wsl
   ```

3. **Install Redis in WSL**:
   ```bash
   sudo apt update
   sudo apt install redis-server -y
   ```

4. **Start Redis**:
   ```bash
   redis-server --daemonize yes
   ```

5. **Test it works**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

6. **Keep WSL running** and open a new PowerShell terminal for the bot

7. Your `.env` is already correct:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

---

## 🪟 Option 3: Memurai (Windows Native Redis)

**Best for:** Windows-native solution

### Steps:

1. Download **Memurai** (Windows Redis alternative):
   - Go to: https://www.memurai.com/get-memurai
   - Download free version

2. Install Memurai

3. Start Memurai (should auto-start)

4. Your `.env` is already correct:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

---

## 🐳 Option 4: Docker

**Best for:** If you already have Docker installed

```bash
docker run -d -p 6379:6379 redis:alpine
```

Your `.env` is already correct:
```env
REDIS_URL=redis://localhost:6379
```

---

## ⚡ QUICK RECOMMENDATION

**For immediate testing**: Use **Redis Cloud** (Option 1)
- No installation needed
- Works instantly
- Free tier is plenty for this bot

**For long-term**: Use **WSL** (Option 2)
- Free forever
- Local control
- Better for development

---

## After Redis is Ready

Once Redis is running (via any option), continue:

```bash
# Terminal 1: Redis is running (Cloud, WSL, Memurai, or Docker)

# Terminal 2: Start Backend
npm start

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

---

## Testing Redis Connection

To verify Redis is working:

**If using WSL/Local:**
```bash
redis-cli ping
# Should return: PONG
```

**If using Redis Cloud:**
The bot will connect automatically if the URL is correct in `.env`

---

## My Recommendation for You

Use **Redis Cloud** for now:

1. https://redis.com/try-free/ (2 minutes to setup)
2. Get connection URL
3. Update `.env` with the URL
4. Start bot immediately

You can always switch to WSL later if you want!

---

## Need Help?

If you choose Redis Cloud and get the connection string, just paste it here and I'll update your `.env` file for you!
