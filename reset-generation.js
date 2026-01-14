const Redis = require('ioredis');
require('dotenv').config();

/**
 * Reset Redis to fresh evolution state
 */
async function resetToFresh() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const genesisToken = process.env.GENESIS_TOKEN_MINT;
  const redis = new Redis(redisUrl);

  try {
    console.log('Connecting to Redis...');
    await redis.ping();
    console.log('✅ Connected to Redis');

    // Show current state
    const currentGen = await redis.get('generation');
    const currentMint = await redis.get('active_mint');
    const currentPhase = await redis.get('phase');
    console.log(`\nCurrent state:`);
    console.log(`  Generation: ${currentGen || 'not set'}`);
    console.log(`  Active mint: ${currentMint || 'not set'}`);
    console.log(`  Phase: ${currentPhase || 'not set'}`);

    // Reset to fresh state
    console.log('\nResetting to fresh state...');

    await redis.set('generation', '1');
    await redis.set('phase', 'casual');
    await redis.del('last_update');

    if (genesisToken) {
      await redis.set('active_mint', genesisToken);
      console.log(`✅ Active mint set to genesis token: ${genesisToken}`);
    }

    // Clear old holder data if there was a previous mint
    if (currentMint) {
      await redis.del(`holders:${currentMint}`);
      console.log(`✅ Cleared holders for: ${currentMint}`);
    }

    // Show new state
    const newGen = await redis.get('generation');
    const newMint = await redis.get('active_mint');
    const newPhase = await redis.get('phase');
    console.log(`\nNew state:`);
    console.log(`  Generation: ${newGen}`);
    console.log(`  Active mint: ${newMint}`);
    console.log(`  Phase: ${newPhase}`);

    console.log('\n✅ Redis reset complete! Restart your backend to apply.');
  } catch (error) {
    console.error('❌ Error resetting:', error);
  } finally {
    await redis.quit();
    console.log('Disconnected from Redis');
  }
}

resetToFresh();
