'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ExplainerSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="pokemon-card holo-texture p-8 shadow-2xl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-pokemon-yellow mb-2 tracking-tight flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            What is PikachuChain?
          </h2>
          <p className="text-pokemon-lightBlue text-lg">
            A recursive token evolution experiment powered by atomic transactions.
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="bg-pokemon-yellow/10 border border-pokemon-yellow/30 hover:bg-pokemon-yellow/20 text-pokemon-yellow px-6 py-2 rounded-lg transition-colors text-sm uppercase tracking-wider"
        >
          {expanded ? 'Collapse' : 'Learn More'}
        </button>
      </div>

      {/* Next Evolution Preview */}
      <div className="mb-8 relative z-10">
        <h3 className="text-lg font-semibold text-pokemon-lightBlue mb-4">Next Evolution Preview</h3>
        <div className="holo-inner p-6 inline-block">
          <div className="bg-pokemon-dark/60 rounded-lg p-4 border border-white/10 relative z-10">
            <img
              src="/pikachu-next-evolution.png"
              alt="Pikachu - Next Evolution"
              className="w-48 h-48 object-contain mx-auto rounded-lg"
            />
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl font-bold text-white">PikachuChain</div>
            <div className="text-pokemon-electric font-mono text-sm mt-1">$Pikachu</div>
            <div className="mt-3 px-3 py-1 bg-pokemon-yellow/20 border border-pokemon-yellow/40 rounded-full inline-block">
              <span className="text-pokemon-yellow text-xs font-semibold">NEXT EVOLUTION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Rewards Banner */}
      <div className="holo-inner p-6 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-5xl">🎁</div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-pokemon-yellow mb-2">Every Evolution = New Token + Bigger Airdrop!</h3>
            <p className="text-pokemon-lightBlue">
              When a Pokemon evolves, a <strong className="text-white">brand new token</strong> is created.
              The top 100 holders receive it for <strong className="text-pokemon-electric">FREE</strong>.
              Each evolution's rewards grow as the system compounds!
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 bg-pokemon-darker/60 rounded-lg p-4 border border-white/10 relative z-10">
            <div className="text-sm text-pokemon-lightBlue/80">Airdrop Formula</div>
            <div className="text-lg font-mono text-pokemon-yellow">Gen N → Gen N+1</div>
            <div className="text-xs text-pokemon-electric">Rewards compound each cycle</div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="holo-inner p-5">
          <div className="text-2xl mb-3 relative z-10">🥚</div>
          <div className="font-bold text-base mb-2 text-pokemon-yellow relative z-10">New Token Born</div>
          <div className="text-xs text-pokemon-lightBlue/80 relative z-10">
            Each evolution spawns a completely new token on Pump.fun.
          </div>
        </div>

        <div className="holo-inner p-5">
          <div className="text-2xl mb-3 relative z-10">📈</div>
          <div className="font-bold text-base mb-2 text-pokemon-yellow relative z-10">Growing Rewards</div>
          <div className="text-xs text-pokemon-lightBlue/80 relative z-10">
            Each airdrop is bigger than the last as SOL compounds through evolutions.
          </div>
        </div>

        <div className="holo-inner p-5">
          <div className="text-2xl mb-3 relative z-10">⚡</div>
          <div className="font-bold text-base mb-2 text-pokemon-yellow relative z-10">Atomic Evolution</div>
          <div className="text-xs text-pokemon-lightBlue/80 relative z-10">
            Jito bundles ensure claim, create, and buy happen together atomically.
          </div>
        </div>

        <div className="holo-inner p-5">
          <div className="text-2xl mb-3 relative z-10">🏆</div>
          <div className="font-bold text-base mb-2 text-pokemon-yellow relative z-10">Top 100 Win</div>
          <div className="text-xs text-pokemon-lightBlue/80 relative z-10">
            Be in the top 100 holders when evolution triggers to get airdropped.
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="space-y-8 pt-8 border-t border-pokemon-blue/20">
          {/* How It Works */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-pokemon-yellow tracking-tight flex items-center gap-2">
              <span>📖</span>
              How Evolution Works
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pokemon-blue/30 border border-pokemon-blue/50 flex items-center justify-center font-bold text-pokemon-lightBlue">
                  1
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-white">Wild Pokemon Appears!</div>
                  <div className="text-pokemon-lightBlue/80 text-sm">
                    A new token launches on Pump.fun with a bonding curve. Trainers buy and trade freely.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pokemon-blue/30 border border-pokemon-blue/50 flex items-center justify-center font-bold text-pokemon-lightBlue">
                  2
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-white">Power Level Rising</div>
                  <div className="text-pokemon-lightBlue/80 text-sm">
                    As trading continues, the power level fills up. When it reaches ~$69k market cap (100% power), evolution approaches.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pokemon-electric/30 border border-pokemon-electric/50 flex items-center justify-center font-bold text-pokemon-electric">
                  3
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-pokemon-electric">Evolution Ready! (99%+)</div>
                  <div className="text-pokemon-lightBlue/80 text-sm">
                    When power hits 99.5%, the system enters battle mode - monitoring every 200ms, ready to trigger evolution.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pokemon-yellow/30 border border-pokemon-yellow/50 flex items-center justify-center font-bold text-pokemon-yellow">
                  4
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-pokemon-yellow">EVOLUTION! (Atomic)</div>
                  <div className="text-pokemon-lightBlue/80 text-sm">
                    The system executes a Jito bundle with 3 atomic transactions:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-pokemon-blue/70">
                      <li><strong className="text-pokemon-lightBlue">Claim</strong> rewards from the graduated token</li>
                      <li><strong className="text-pokemon-lightBlue">Create</strong> the next evolution (new token)</li>
                      <li><strong className="text-pokemon-lightBlue">Catch</strong> the new Pokemon using claimed SOL</li>
                    </ul>
                    All 3 succeed together or fail together - no partial evolution.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pokemon-blue/30 border border-pokemon-blue/50 flex items-center justify-center font-bold text-pokemon-lightBlue">
                  5
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-white">Airdrop to Top Trainers</div>
                  <div className="text-pokemon-lightBlue/80 text-sm">
                    The system captures the top 100 trainers and airdrops them equal shares of the new evolution. This rewards loyal trainers!
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pokemon-blue/30 border border-pokemon-blue/50 flex items-center justify-center font-bold text-pokemon-lightBlue">
                  6
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-white">Evolution Chain Continues</div>
                  <div className="text-pokemon-lightBlue/80 text-sm">
                    The cycle begins again. Pichu → Pikachu → Raichu → back to Pichu. The evolutions never end!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evolution Rewards Deep Dive */}
          <div className="bg-gradient-to-br from-pokemon-darker/90 to-pokemon-dark border border-pokemon-yellow/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-6 text-pokemon-yellow flex items-center gap-2">
              <span>💎</span>
              How Evolution Rewards Work
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-pokemon-electric mb-4">The Evolution Cycle</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-pokemon-yellow">1.</span>
                    <div>
                      <strong className="text-white">Token Graduates</strong>
                      <p className="text-pokemon-lightBlue/80">When bonding curve hits 100%, the token "graduates" and creator rewards unlock.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-pokemon-yellow">2.</span>
                    <div>
                      <strong className="text-white">New Token Created</strong>
                      <p className="text-pokemon-lightBlue/80">A brand new token is instantly created on Pump.fun - this is the "evolution".</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-pokemon-yellow">3.</span>
                    <div>
                      <strong className="text-white">SOL Reinvested</strong>
                      <p className="text-pokemon-lightBlue/80">Claimed rewards are used to buy into the new token, seeding the next generation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-pokemon-yellow">4.</span>
                    <div>
                      <strong className="text-white">Airdrop Distributed</strong>
                      <p className="text-pokemon-lightBlue/80">Top 100 holders of the old token receive tokens from the new evolution for FREE.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-pokemon-electric mb-4">Why Rewards Grow</h4>
                <div className="bg-pokemon-darker/60 rounded-lg p-4 border border-pokemon-blue/20 mb-4">
                  <div className="text-center mb-4">
                    <div className="text-xs text-pokemon-lightBlue/60 mb-2">EVOLUTION CHAIN</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="bg-pokemon-blue/20 px-3 py-1 rounded">Pichu</span>
                      <span className="text-pokemon-yellow">→</span>
                      <span className="bg-pokemon-blue/30 px-3 py-1 rounded">Pikachu</span>
                      <span className="text-pokemon-yellow">→</span>
                      <span className="bg-pokemon-yellow/20 px-3 py-1 rounded text-pokemon-yellow">Raichu</span>
                      <span className="text-pokemon-yellow">→</span>
                      <span className="text-pokemon-electric">∞</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-pokemon-lightBlue/80">
                    <li>• Each graduation unlocks ~0.5 SOL in creator rewards</li>
                    <li>• Rewards compound as more SOL enters each evolution</li>
                    <li>• Earlier trainers get proportionally more tokens</li>
                    <li>• The chain continues indefinitely</li>
                  </ul>
                </div>
                <div className="bg-pokemon-yellow/10 border border-pokemon-yellow/30 rounded-lg p-3">
                  <div className="text-xs font-bold text-pokemon-yellow mb-1">💡 KEY INSIGHT</div>
                  <div className="text-xs text-pokemon-lightBlue/80">
                    You don't need to sell. Just HOLD through evolutions and collect new tokens each time. The longer the chain, the more you accumulate!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-pokemon-darker/80 border border-pokemon-blue/20 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-pokemon-yellow flex items-center gap-2">
              <span>🔧</span>
              Technical PokeDex
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div>
                <div className="font-bold mb-2 text-pokemon-lightBlue">Battle System</div>
                <ul className="space-y-2 text-pokemon-blue/70">
                  <li>• <strong className="text-pokemon-lightBlue">Monitor Service:</strong> Two-phase polling (casual → battle ready)</li>
                  <li>• <strong className="text-pokemon-lightBlue">Snapshot Engine:</strong> Captures top 100 trainers via Helius API</li>
                  <li>• <strong className="text-pokemon-lightBlue">Jito Executor:</strong> Atomic bundle submission</li>
                  <li>• <strong className="text-pokemon-lightBlue">Dispenser:</strong> Batched airdrop distribution</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2 text-pokemon-lightBlue">Key Abilities</div>
                <ul className="space-y-2 text-pokemon-blue/70">
                  <li>• <strong className="text-pokemon-lightBlue">Speed Boost:</strong> Jito bundles prevent front-running</li>
                  <li>• <strong className="text-pokemon-lightBlue">Quick Attack:</strong> WebSocket streaming every 200ms</li>
                  <li>• <strong className="text-pokemon-lightBlue">Memory:</strong> Redis cache for fast lookups</li>
                  <li>• <strong className="text-pokemon-lightBlue">Retry:</strong> Higher tips if bundle fails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
