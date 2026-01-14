/**
 * Quick script to update the active token mint in Redis
 * Usage: node update-token.js YOUR_NEW_TOKEN_MINT
 */

const Redis = require('ioredis');
require('dotenv').config();

const newMint = process.argv[2];

if (!newMint) {
  console.error('❌ Please provide a token mint address');
  console.log('Usage: node update-token.js YOUR_TOKEN_MINT');
  process.exit(1);
}

if (!process.env.REDIS_URL) {
  console.error('❌ REDIS_URL not found in .env');
  process.exit(1);
}

async function updateToken() {
  const redis = new Redis(process.env.REDIS_URL, {
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    lazyConnect: false // Auto-connect, don't call connect() manually
  });

  try {
    // Wait for connection to be ready
    await redis.ping();
    console.log('✅ Connected to Redis');

    const oldMint = await redis.get('active_mint');
    console.log(`Current token: ${oldMint || 'None'}`);
    
    await redis.set('active_mint', newMint);
    await redis.set('generation', '1'); // Reset generation
    await redis.set('phase', 'casual');
    
    console.log(`✅ Updated active token to: ${newMint}`);
    console.log('✅ Reset generation to 1');
    console.log('\n⚠️  You need to restart the bot for changes to take effect!');
    
    await redis.quit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToken();
