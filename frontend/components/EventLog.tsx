'use client'

import { motion } from 'framer-motion'

interface WSEvent {
  event: string
  progress?: number
  marketCap?: number
  mint?: string
  currentMint?: string
  oldMint?: string
  newMint?: string
  signature?: string
  generation?: number
  error?: string
  timestamp: number
  // Token created event fields
  name?: string
  symbol?: string
  creator?: string
  // Holder update fields
  holders?: { wallet: string; balance: number; rank: number }[]
  totalHolders?: number
}

interface Props {
  events: WSEvent[]
}

export default function EventLog({ events }: Props) {
  const getEventIcon = (event: string) => {
    switch (event) {
      case 'curve_update': return '⚡'
      case 'mitosis_imminent': return '🔥'
      case 'mitosis_complete': return '✨'
      case 'token_created': return '🥚'
      case 'holder_update': return '👥'
      case 'initial_state': return '🎮'
      case 'error': return '💀'
      default: return '🔸'
    }
  }

  const getEventColor = (event: string) => {
    switch (event) {
      case 'curve_update': return 'text-pokemon-lightBlue'
      case 'mitosis_imminent': return 'text-pokemon-yellow'
      case 'mitosis_complete': return 'text-pokemon-electric'
      case 'token_created': return 'text-pokemon-blue'
      case 'holder_update': return 'text-pokemon-lightBlue'
      case 'initial_state': return 'text-pokemon-yellow'
      case 'error': return 'text-pokemon-red'
      default: return 'text-pokemon-blue/50'
    }
  }

  const getEventName = (event: string) => {
    switch (event) {
      case 'curve_update': return 'LEVEL UP!'
      case 'mitosis_imminent': return 'WHAT? EVOLVING!'
      case 'mitosis_complete': return 'CONGRATULATIONS!'
      case 'token_created': return 'EGG HATCHED!'
      case 'holder_update': return 'TRAINERS FOUND!'
      case 'initial_state': return 'GAME START!'
      case 'error': return 'IT FAINTED!'
      default: return event.toUpperCase().replace('_', ' ')
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatEvent = (evt: WSEvent) => {
    switch (evt.event) {
      case 'curve_update':
        const pct = (evt.progress! * 100).toFixed(0)
        return `Pokemon reached Level ${pct}%! Power: $${evt.marketCap?.toLocaleString()}`
      case 'mitosis_imminent':
        return `What? Pokemon is evolving! (${(evt.progress! * 100).toFixed(1)}% XP)`
      case 'mitosis_complete':
        return `Congratulations! Your Pokemon evolved into Evolution #${evt.generation}!`
      case 'token_created':
        return `A wild ${evt.name || evt.symbol || 'Pokemon'} appeared! Trainer threw a Master Ball!`
      case 'holder_update':
        return `${evt.totalHolders || evt.holders?.length || 0} trainers registered in the PokeDex!`
      case 'initial_state':
        return `Professor Oak: Welcome, trainer! Tracking Evolution #${evt.generation || 1}`
      case 'error':
        return `${evt.error || 'Pokemon fainted!'} It hurt itself in confusion!`
      default:
        return JSON.stringify(evt)
    }
  }

  return (
    <div className="pokemon-card holo-texture p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-pokemon-yellow tracking-tight flex items-center gap-2 relative z-10">
        <span>📜</span>
        Professor Oak's Journal
      </h2>

      <div className="holo-inner p-4 h-96 overflow-y-auto relative z-10">
        {events.length === 0 ? (
          <div className="text-center text-pokemon-blue/50 py-12 text-sm italic">
            Searching for wild Pokemon in tall grass...
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt, index) => (
              <motion.div
                key={`${evt.timestamp}-${index}`}
                className="flex items-start gap-4 text-sm border-b border-pokemon-blue/10 pb-4 last:border-0 last:pb-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <span className="text-lg">{getEventIcon(evt.event)}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${getEventColor(evt.event)}`}>
                    {getEventName(evt.event)}
                  </div>
                  <div className="text-pokemon-lightBlue/70 truncate text-xs mt-1">
                    {formatEvent(evt)}
                  </div>
                </div>
                <div className="text-pokemon-blue/50 text-[10px] whitespace-nowrap mt-1">
                  {formatTime(evt.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
