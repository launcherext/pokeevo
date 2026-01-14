'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getPokemonForGeneration, getEvolutionStageName } from '@/lib/pokemon'

interface Props {
  generation: number
  progress: number
  marketCap: number
  lastUpdate: number
}

export default function StatsPanel({ generation, progress, marketCap, lastUpdate }: Props) {
  const [timeAgo, setTimeAgo] = useState('Just now')
  const { current: pokemon, stageIndex } = getPokemonForGeneration(generation)

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate) / 1000)
      if (seconds < 5) {
        setTimeAgo('Just now')
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastUpdate])

  const stats = [
    {
      label: 'Evolution Stage',
      value: `#${generation}`,
      color: 'text-pokemon-yellow',
      icon: '⚡'
    },
    {
      label: 'Power Level',
      value: `${(progress * 100).toFixed(1)}%`,
      color: progress >= 0.99 ? 'text-pokemon-yellow animate-pulse' : 'text-white',
      icon: '📊'
    },
    {
      label: 'Market Cap',
      value: `$${(marketCap / 1000).toFixed(1)}k`,
      color: 'text-pokemon-lightBlue',
      icon: '💎'
    },
    {
      label: 'Status',
      value: progress >= 0.995 ? 'EVOLVING!' : progress >= 0.9 ? 'READY!' : 'TRAINING',
      color: progress >= 0.995 ? 'text-pokemon-yellow' : progress >= 0.9 ? 'text-pokemon-electric' : 'text-pokemon-lightBlue',
      icon: progress >= 0.995 ? '✨' : progress >= 0.9 ? '⚡' : '🎮'
    }
  ]

  return (
    <div className="pokemon-card p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-pokemon-yellow tracking-tight flex items-center gap-2">
        <span>📱</span>
        PokéDex Stats
      </h2>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-pokemon-darker/50 border border-pokemon-blue/20 rounded-xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest flex items-center gap-2">
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
              <div className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Current Pokemon */}
        <div className="bg-pokemon-darker/50 border border-pokemon-yellow/30 rounded-xl p-4">
          <div className="text-pokemon-yellow text-xs uppercase tracking-widest mb-2">Current Form</div>
          <div className="text-lg font-medium text-white flex items-center justify-between">
            <span>{pokemon.name}</span>
            <span className="text-sm text-pokemon-lightBlue">{getEvolutionStageName(stageIndex)}</span>
          </div>
        </div>

        {/* Last update */}
        <div className="text-center pt-4 border-t border-pokemon-blue/20">
          <div className="text-pokemon-blue text-xs">
            Last Sync: {timeAgo}
          </div>
        </div>

        {/* Phase indicator */}
        <div className="bg-pokemon-darker/50 border border-pokemon-blue/20 rounded-xl p-4">
          <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-2">Battle Phase</div>
          <div className="text-sm font-medium">
            {marketCap < 50000 ? (
              <span className="text-pokemon-lightBlue">🎮 Training Mode (30s)</span>
            ) : progress < 0.995 ? (
              <span className="text-pokemon-electric">⚡ Battle Ready (200ms)</span>
            ) : (
              <span className="text-pokemon-yellow animate-pulse font-bold">✨ EVOLVING NOW!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
