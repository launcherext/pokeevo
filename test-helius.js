/**
 * Test Helius RPC connection and bonding curve fetching
 * Usage: node test-helius.js [TOKEN_MINT]
 */

require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { fetchBondingCurveState, calculateBondingCurveProgress, estimateMarketCap, deriveBondingCurvePDA } = require('./dist/utils/pump');

const tokenMint = process.argv[2] || process.env.GENESIS_TOKEN_MINT;

if (!tokenMint) {
  console.error('❌ Please provide a token mint address');
  console.log('Usage: node test-helius.js YOUR_TOKEN_MINT');
  console.log('Or set GENESIS_TOKEN_MINT in .env');
  process.exit(1);
}

if (!process.env.HELIUS_RPC_URL) {
  console.error('❌ HELIUS_RPC_URL not found in .env');
  process.exit(1);
}

async function testHelius() {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 TESTING HELIUS RPC CONNECTION');
  console.log('═══════════════════════════════════════════════');
  console.log();

  try {
    // Create connection
    const connection = new Connection(process.env.HELIUS_RPC_URL, {
      commitment: 'confirmed'
    });

    console.log('📡 Connecting to Helius RPC...');
    console.log(`   URL: ${process.env.HELIUS_RPC_URL.substring(0, 50)}...`);
    
    // Test basic connection
    const slot = await connection.getSlot();
    console.log(`✅ Connected! Current slot: ${slot}`);
    console.log();

    // Test token mint
    console.log('🔍 Testing token mint:', tokenMint);
    let mintPubkey;
    try {
      mintPubkey = new PublicKey(tokenMint);
      console.log(`✅ Valid Solana address`);
    } catch (error) {
      console.error('❌ Invalid token mint address:', error.message);
      process.exit(1);
    }

    // Derive bonding curve PDA
    console.log();
    console.log('📍 Deriving bonding curve PDA...');
    const [bondingCurvePDA, bump] = deriveBondingCurvePDA(mintPubkey);
    console.log(`   Bonding Curve PDA: ${bondingCurvePDA.toBase58()}`);
    console.log(`   Bump: ${bump}`);
    console.log();

    // Check if bonding curve account exists
    console.log('🔎 Fetching bonding curve account...');
    const accountInfo = await connection.getAccountInfo(bondingCurvePDA);
    
    if (!accountInfo) {
      console.log('⚠️  Bonding curve account not found!');
      console.log('   This could mean:');
      console.log('   - Token is not on Pump.fun');
      console.log('   - Token mint address is incorrect');
      console.log('   - Bonding curve PDA derivation is wrong');
      process.exit(1);
    }

    console.log(`✅ Bonding curve account found!`);
    console.log(`   Account size: ${accountInfo.data.length} bytes`);
    console.log(`   Owner: ${accountInfo.owner.toBase58()}`);
    console.log();

    // Parse bonding curve state
    console.log('📊 Parsing bonding curve data...');
    const state = await fetchBondingCurveState(connection, mintPubkey);
    
    if (!state) {
      console.error('❌ Failed to parse bonding curve state');
      process.exit(1);
    }

    console.log('✅ Bonding curve state parsed successfully!');
    console.log();
    console.log('📈 Bonding Curve Data:');
    console.log(`   Virtual SOL Reserves: ${state.virtualSolReserves.toFixed(6)} SOL`);
    console.log(`   Virtual Token Reserves: ${state.virtualTokenReserves.toFixed(2)} tokens`);
    console.log(`   Real SOL Reserves: ${state.realSolReserves.toFixed(6)} SOL`);
    console.log(`   Real Token Reserves: ${state.realTokenReserves.toFixed(2)} tokens`);
    console.log(`   Total Supply: ${state.tokenTotalSupply.toFixed(2)} tokens`);
    console.log(`   Complete: ${state.complete ? 'Yes ✅' : 'No ⏳'}`);
    console.log();

    // Calculate progress and market cap
    const progress = calculateBondingCurveProgress(state);
    const marketCap = estimateMarketCap(state);

    console.log('💰 Market Data:');
    console.log(`   Progress: ${(progress * 100).toFixed(2)}%`);
    console.log(`   Market Cap: $${marketCap.toFixed(2)}`);
    console.log(`   Target: $${process.env.MARKET_CAP_THRESHOLD || 50000}`);
    console.log();

    // Test RPC performance
    console.log('⚡ Testing RPC performance...');
    const startTime = Date.now();
    for (let i = 0; i < 5; i++) {
      await connection.getAccountInfo(bondingCurvePDA);
    }
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 5;
    console.log(`   Average fetch time: ${avgTime.toFixed(0)}ms`);
    console.log(`   Estimated RPS: ${(1000 / avgTime).toFixed(1)} requests/second`);
    console.log();

    console.log('═══════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════');
    console.log();
    console.log('🎯 Helius RPC is working correctly!');
    console.log('   Your bot can now fetch bonding curve data.');

  } catch (error) {
    console.error();
    console.error('═══════════════════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═══════════════════════════════════════════════');
    console.error();
    console.error('Error:', error.message);
    console.error();
    
    if (error.message.includes('fetch')) {
      console.error('💡 Possible issues:');
      console.error('   - Helius API key invalid or expired');
      console.error('   - Network connectivity issues');
      console.error('   - Rate limit exceeded');
    } else if (error.message.includes('parse')) {
      console.error('💡 Possible issues:');
      console.error('   - Bonding curve account structure changed');
      console.error('   - Account data format is different than expected');
    }
    
    process.exit(1);
  }
}

testHelius();
