'use client'

import { motion } from 'framer-motion'

interface Props {
  currentMint: string
}

export default function HowToParticipate({ currentMint }: Props) {
  return (
    <div className="pokemon-card p-8 shadow-2xl mb-8">
      <h2 className="text-2xl font-bold text-pokemon-yellow mb-8 tracking-tight flex items-center gap-3">
        <span className="text-3xl">🎮</span>
        How To Become a Trainer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* As a Trainer */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-pokemon-yellow/20 border border-pokemon-yellow/50 flex items-center justify-center text-xl">🏆</div>
            <h3 className="text-xl font-bold text-pokemon-yellow">Active Trainer</h3>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                1
              </div>
              <div>
                <div className="font-bold text-white mb-1">Catch on Pump.fun</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  Purchase the current Pokemon token on{' '}
                  {currentMint ? (
                    <a
                      href={`https://pump.fun/${currentMint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pokemon-yellow hover:text-pokemon-electric underline"
                    >
                      Pump.fun
                    </a>
                  ) : (
                    <span className="text-pokemon-yellow">Pump.fun</span>
                  )}
                  {' '}while the bonding curve is active.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                2
              </div>
              <div>
                <div className="font-bold text-white mb-1">Train & Hold</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  The more you hold, the higher your trainer ranking. Top 100 trainers get airdropped the next evolution!
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                3
              </div>
              <div>
                <div className="font-bold text-white mb-1">Watch Power Level</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  Monitor this dashboard to see when evolution is approaching. Be in the top 100 when it hits 100%!
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                4
              </div>
              <div>
                <div className="font-bold text-white mb-1">Receive Evolution</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  When evolution happens, you'll automatically receive the new Pokemon token in your wallet!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* As a Watcher */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-pokemon-blue/20 border border-pokemon-blue/50 flex items-center justify-center text-xl">👁️</div>
            <h3 className="text-xl font-bold text-pokemon-lightBlue">Pokemon Watcher</h3>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                1
              </div>
              <div>
                <div className="font-bold text-white mb-1">Watch the Battle</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  This dashboard shows real-time updates. No need to catch - just watch the evolutions unfold.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                2
              </div>
              <div>
                <div className="font-bold text-white mb-1">See the Evolution Stages</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  Observe training mode → battle ready → evolution imminent → EVOLUTION! Each stage is unique.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                3
              </div>
              <div>
                <div className="font-bold text-white mb-1">Learn Battle Mechanics</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  See how Jito bundles enable atomic execution. Watch real-time blockchain automation!
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pokemon-blue/30 flex items-center justify-center font-bold text-pokemon-lightBlue text-sm border border-pokemon-blue/50">
                4
              </div>
              <div>
                <div className="font-bold text-white mb-1">Join the Journey</div>
                <div className="text-sm text-pokemon-lightBlue/80">
                  When you're ready, become a trainer. Or keep watching. Either way, you're part of the adventure!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-pokemon-yellow/10 border border-pokemon-yellow/30 rounded-xl p-4">
          <div className="font-bold text-pokemon-yellow mb-2">💡 Pro Tip</div>
          <div className="text-sm text-pokemon-lightBlue/80">
            Catch early in each evolution to get a better ranking for the next airdrop.
          </div>
        </div>

        <div className="bg-pokemon-electric/10 border border-pokemon-electric/30 rounded-xl p-4">
          <div className="font-bold text-pokemon-electric mb-2">⚡ Battle Alert</div>
          <div className="text-sm text-pokemon-lightBlue/80">
            Timing is everything. If you catch too late, you might not make the top 100 trainers.
          </div>
        </div>

        <div className="bg-pokemon-blue/10 border border-pokemon-blue/30 rounded-xl p-4">
          <div className="font-bold text-pokemon-lightBlue mb-2">🎯 Strategy</div>
          <div className="text-sm text-pokemon-lightBlue/80">
            Hold through evolution to receive the next form, or trade before for quick gains. Your choice!
          </div>
        </div>
      </div>

      {/* Current Token CTA */}
      {currentMint && (
        <motion.div
          className="mt-6 bg-pokemon-yellow/10 border-2 border-pokemon-yellow/50 rounded-xl p-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-xl text-pokemon-yellow mb-2">
                Ready to Catch This Pokemon?
              </div>
              <div className="text-pokemon-lightBlue">
                Buy on Pump.fun now to be eligible for the next evolution airdrop!
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://pump.fun/${currentMint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pokemon-yellow hover:bg-pokemon-electric text-pokemon-dark font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
              >
                Catch on Pump.fun →
              </a>
              <a
                href={`https://solscan.io/token/${currentMint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pokemon-blue hover:bg-pokemon-lightBlue text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
              >
                View PokeDex
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
