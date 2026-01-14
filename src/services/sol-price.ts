/**
 * Real-time SOL Price Service
 * Fetches SOL/USD price from Jupiter API with fallbacks
 */

// Jupiter Price API v2 with API key
const JUPITER_API_KEY = '2b5e87d0-6cef-40e2-85e6-0de4a8596eec';
const JUPITER_PRICE_URL = 'https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112';

// Fallbacks
const BINANCE_SOL_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT';
const COINGECKO_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

// Cache configuration
const CACHE_DURATION_MS = parseInt(process.env.SOL_PRICE_CACHE_MS || '10000'); // 10 seconds default
const FALLBACK_PRICE = 185; // Last resort fallback (approximate current SOL price)

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

interface JupiterPriceResponse {
  data: {
    [key: string]: {
      id: string;
      price: string;
    };
  };
  timeTaken: number;
}

interface BinanceTickerResponse {
  price: string;
}

interface CoinGeckoPriceResponse {
  solana: {
    usd: number;
  };
}

/**
 * Fetch SOL price from Jupiter API (with API key)
 */
async function fetchFromJupiter(): Promise<number | null> {
  try {
    const response = await fetch(JUPITER_PRICE_URL, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': JUPITER_API_KEY
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`Jupiter API returned ${response.status}`);
      return null;
    }

    const data = await response.json() as JupiterPriceResponse;
    const solData = data?.data?.['So11111111111111111111111111111111111111112'];
    if (solData?.price) {
      const price = parseFloat(solData.price);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
    return null;
  } catch (error) {
    console.warn('Jupiter API error:', (error as Error).message);
    return null;
  }
}

/**
 * Fetch SOL price from Binance (free, no auth)
 */
async function fetchFromBinance(): Promise<number | null> {
  try {
    const response = await fetch(BINANCE_SOL_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`Binance API returned ${response.status}`);
      return null;
    }

    const data = await response.json() as BinanceTickerResponse;
    if (data?.price) {
      const price = parseFloat(data.price);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
    return null;
  } catch (error) {
    console.warn('Binance API error:', (error as Error).message);
    return null;
  }
}

/**
 * Fetch SOL price from CoinGecko (fallback)
 */
async function fetchFromCoinGecko(): Promise<number | null> {
  try {
    const response = await fetch(COINGECKO_PRICE_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`CoinGecko API returned ${response.status}`);
      return null;
    }

    const data = await response.json() as CoinGeckoPriceResponse;
    const price = data?.solana?.usd;
    if (typeof price === 'number' && price > 0) {
      return price;
    }
    return null;
  } catch (error) {
    console.warn('CoinGecko API error:', (error as Error).message);
    return null;
  }
}

/**
 * Get current SOL price in USD
 * Uses caching to avoid excessive API calls
 * @returns SOL price in USD
 */
export async function getSolPriceUsd(): Promise<number> {
  const now = Date.now();

  // Check cache
  if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION_MS) {
    return priceCache.price;
  }

  // Try Jupiter first (most accurate for DeFi)
  let price = await fetchFromJupiter();

  // Fallback to Binance
  if (price === null) {
    console.log('Falling back to Binance for SOL price...');
    price = await fetchFromBinance();
  }

  // Fallback to CoinGecko
  if (price === null) {
    console.log('Falling back to CoinGecko for SOL price...');
    price = await fetchFromCoinGecko();
  }

  // If all fail, use cached price if available, otherwise fallback
  if (price === null) {
    if (priceCache) {
      console.warn(`Using stale cached SOL price: $${priceCache.price}`);
      return priceCache.price;
    }
    console.warn(`Using fallback SOL price: $${FALLBACK_PRICE}`);
    return FALLBACK_PRICE;
  }

  // Update cache
  priceCache = {
    price,
    timestamp: now
  };

  return price;
}

/**
 * Force refresh the SOL price cache
 */
export async function refreshSolPrice(): Promise<number> {
  priceCache = null;
  return getSolPriceUsd();
}

/**
 * Get the last known SOL price without fetching
 * @returns Cached price or null if no cache
 */
export function getCachedSolPrice(): number | null {
  return priceCache?.price ?? null;
}

/**
 * Initialize the price service (prefetch)
 */
export async function initSolPriceService(): Promise<void> {
  console.log('💰 Checking PokeCoins exchange rate...');
  const price = await getSolPriceUsd();
  console.log(`💰 1 SOL = $${price.toFixed(2)} PokeDollars`);
}
