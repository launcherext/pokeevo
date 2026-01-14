const Redis = require('ioredis');
require('dotenv').config();

/**
 * Reset Redis generation counter to 0
 */
async function resetGeneration() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new Redis(redisUrl);

  try {
    console.log('Connecting to Redis...');
    await redis.ping();
    console.log('✅ Connected to Redis');

    // Get current generation
    const currentGen = await redis.get('generation');
    console.log(`Current generation: ${currentGen || 'not set'}`);

    // Reset to 0
    await redis.set('generation', '0');
    console.log('✅ Generation reset to 0');

    // Verify
    const newGen = await redis.get('generation');
    console.log(`New generation: ${newGen}`);

    console.log('\n✅ Redis generation counter has been reset!');
    console.log('You can now restart your backend to start fresh at generation 1.');
  } catch (error) {
    console.error('❌ Error resetting generation:', error);
  } finally {
    await redis.quit();
    console.log('Disconnected from Redis');
  }
}

resetGeneration();
