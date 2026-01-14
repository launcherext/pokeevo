'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ExplainerSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="pokemon-card p-8 shadow-2xl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-pokemon-yellow mb-2 tracking-tight flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            What is PokeChain?
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

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-pokemon-darker/50 border border-pokemon-blue/20 rounded-xl p-6">
          <div className="text-3xl mb-4">🔄</div>
          <div className="font-bold text-lg mb-2 text-pokemon-yellow">Evolution Loop</div>
          <div className="text-sm text-pokemon-lightBlue/80">
            Each Pokemon evolves into a new form automatically when power reaches max.
          </div>
        </div>

        <div className="bg-pokemon-darker/50 border border-pokemon-blue/20 rounded-xl p-6">
          <div className="text-3xl mb-4">⚡</div>
          <div className="font-bold text-lg mb-2 text-pokemon-yellow">Atomic Evolution</div>
          <div className="text-sm text-pokemon-lightBlue/80">
            Jito bundles ensure claim, create, and catch happen together atomically.
          </div>
        </div>

        <div className="bg-pokemon-darker/50 border border-pokemon-blue/20 rounded-xl p-6">
          <div className="text-3xl mb-4">🎁</div>
          <div className="font-bold text-lg mb-2 text-pokemon-yellow">Trainer Rewards</div>
          <div className="text-sm text-pokemon-lightBlue/80">
            Top 100 trainers get airdropped the next evolution when it happens.
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
                    The cycle begins again. Charmander → Charmeleon → Charizard → new chain. The evolutions never end!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-pokemon-darker/50 border border-pokemon-blue/20 rounded-xl p-6">
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
