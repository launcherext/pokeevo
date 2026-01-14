'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface TokenHolder {
  wallet: string
  balance: number
  rank: number
}

interface Props {
  holders: TokenHolder[]
  lastUpdate: number
}

export default function HolderLeaderboard({ holders, lastUpdate }: Props) {
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)
  const [timeAgo, setTimeAgo] = useState('Just now')

  // Update time ago display
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

  const copyToClipboard = (wallet: string) => {
    navigator.clipboard.writeText(wallet)
    setCopiedWallet(wallet)
    setTimeout(() => setCopiedWallet(null), 2000)
  }

  const shortenWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K`
    } else {
      return balance.toFixed(2)
    }
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-pokemon-yellow font-bold'
    if (rank === 2) return 'text-pokemon-lightBlue font-bold'
    if (rank === 3) return 'text-pokemon-electric font-bold'
    if (rank <= 10) return 'text-white font-semibold'
    return 'text-pokemon-blue/70'
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🏆'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getTrainerTitle = (rank: number) => {
    if (rank === 1) return 'Champion'
    if (rank <= 4) return 'Elite Four'
    if (rank <= 8) return 'Gym Leader'
    if (rank <= 20) return 'Ace Trainer'
    if (rank <= 50) return 'Trainer'
    return 'Youngster'
  }

  return (
    <div className="pokemon-card holo-texture p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-xl font-bold text-pokemon-yellow tracking-tight flex items-center gap-2">
          <span>🎖️</span>
          Top 100 Trainers
        </h2>
        <div className="text-pokemon-blue text-xs">
          Updated {timeAgo}
        </div>
      </div>

      <div className="holo-inner overflow-hidden relative z-10">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-pokemon-dark/80 border-b border-pokemon-blue/30 text-xs uppercase tracking-wider text-pokemon-lightBlue">
          <div className="col-span-2">Rank</div>
          <div className="col-span-6">Trainer</div>
          <div className="col-span-4 text-right">Power</div>
        </div>

        {/* Scrollable list */}
        <div className="max-h-96 overflow-y-auto">
          {holders.length === 0 ? (
            <div className="text-center text-pokemon-blue/50 py-12 text-sm italic">
              Searching for trainers...
            </div>
          ) : (
            holders.map((holder, index) => (
              <motion.div
                key={holder.wallet}
                className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-pokemon-blue/10 last:border-0 hover:bg-pokemon-yellow/5 cursor-pointer transition-colors ${
                  holder.rank <= 10 ? 'bg-pokemon-yellow/[0.02]' : ''
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => copyToClipboard(holder.wallet)}
              >
                {/* Rank */}
                <div className={`col-span-2 ${getRankStyle(holder.rank)}`}>
                  {getRankBadge(holder.rank)}
                </div>

                {/* Wallet */}
                <div className="col-span-6">
                  <div className="font-mono text-sm text-white">
                    {shortenWallet(holder.wallet)}
                    {copiedWallet === holder.wallet && (
                      <span className="ml-2 text-xs text-pokemon-yellow">Copied!</span>
                    )}
                  </div>
                  <div className="text-[10px] text-pokemon-blue/50">{getTrainerTitle(holder.rank)}</div>
                </div>

                {/* Balance */}
                <div className={`col-span-4 text-right ${getRankStyle(holder.rank)}`}>
                  {formatBalance(holder.balance)}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer stats */}
      {holders.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-pokemon-darker/80 rounded-lg p-3 border border-pokemon-yellow/30">
            <div className="text-pokemon-yellow uppercase tracking-wider mb-1">Champion</div>
            <div className="text-white font-medium">
              {formatBalance(holders[0]?.balance || 0)} power
            </div>
          </div>
          <div className="bg-pokemon-darker/80 rounded-lg p-3 border border-pokemon-blue/30">
            <div className="text-pokemon-lightBlue uppercase tracking-wider mb-1">Trainers</div>
            <div className="text-white font-medium">
              {holders.length} registered
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
