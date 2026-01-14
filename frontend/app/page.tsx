'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import EvolutionAnimation from '@/components/EvolutionAnimation'
import HolderLeaderboard from '@/components/HolderLeaderboard'
import EventLog from '@/components/EventLog'
import { getPokemonForGeneration, getGlowColor } from '@/lib/pokemon'

interface TokenHolder {
  wallet: string
  balance: number
  rank: number
}

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
  name?: string
  symbol?: string
  creator?: string
  holders?: TokenHolder[]
  totalHolders?: number
}

interface InitialStateEvent {
  event: 'initial_state'
  mint: string
  generation: number
  timestamp: number
}

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [progress, setProgress] = useState(0)
  const [marketCap, setMarketCap] = useState(0)
  const [currentMint, setCurrentMint] = useState('')
  const [generation, setGeneration] = useState(1)
  const [killZone, setKillZone] = useState(false)
  const [mitosisActive, setMitosisActive] = useState(false)
  const [holders, setHolders] = useState<TokenHolder[]>([])
  const [holderLastUpdate, setHolderLastUpdate] = useState(Date.now())
  const [events, setEvents] = useState<WSEvent[]>([])
  const [copiedCA, setCopiedCA] = useState(false)

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentMintRef = useRef<string>('')
  const hasPlayedRef = useRef(false)
  const lastMilestoneRef = useRef<number>(0)

  // Audio controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Auto-play on mount - with fallback to first user interaction
  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current && !hasPlayedRef.current) {
        audioRef.current.volume = volume
        try {
          await audioRef.current.play()
          hasPlayedRef.current = true
          setIsPlaying(true)
        } catch (err) {
          // Autoplay blocked by browser - try on first user interaction
          console.log('Autoplay blocked, will play on first interaction')
        }
      }
    }

    // Try to play immediately
    playAudio()

    // Also try to play on any user interaction (click, touch, keypress, scroll)
    const playOnInteraction = () => {
      if (audioRef.current && !hasPlayedRef.current) {
        audioRef.current.play()
          .then(() => {
            hasPlayedRef.current = true
            setIsPlaying(true)
            // Remove listeners once playing
            document.removeEventListener('click', playOnInteraction)
            document.removeEventListener('touchstart', playOnInteraction)
            document.removeEventListener('keydown', playOnInteraction)
            document.removeEventListener('scroll', playOnInteraction)
            document.removeEventListener('mousemove', playOnInteraction)
          })
          .catch(() => {})
      }
    }

    document.addEventListener('click', playOnInteraction)
    document.addEventListener('touchstart', playOnInteraction)
    document.addEventListener('keydown', playOnInteraction)
    document.addEventListener('scroll', playOnInteraction)
    document.addEventListener('mousemove', playOnInteraction, { once: true })

    return () => {
      document.removeEventListener('click', playOnInteraction)
      document.removeEventListener('touchstart', playOnInteraction)
      document.removeEventListener('keydown', playOnInteraction)
      document.removeEventListener('scroll', playOnInteraction)
      document.removeEventListener('mousemove', playOnInteraction)
    }
  }, [])

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    let websocket: WebSocket | null = new WebSocket(wsUrl)

    websocket.onopen = () => setConnected(true)

    websocket.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data)

        // Helper to add event to log (limit to last 50)
        const logEvent = (evt: WSEvent) => {
          setEvents(prev => [evt, ...prev].slice(0, 50))
        }

        switch (data.event) {
          case 'curve_update':
            if (data.progress !== undefined) {
              setProgress(data.progress)
              setMarketCap(data.marketCap || 0)
              const newMint = data.mint || ''
              if (newMint && newMint !== currentMintRef.current) {
                currentMintRef.current = newMint
                setCurrentMint(newMint)
              }
              if (data.progress >= 0.99) setKillZone(true)
              // Log every 10% milestone when crossed
              const currentMilestone = Math.floor(data.progress * 10) * 10 // 0, 10, 20, 30...
              if (currentMilestone > lastMilestoneRef.current && currentMilestone > 0) {
                lastMilestoneRef.current = currentMilestone
                logEvent(data)
              }
            }
            break

          case 'mitosis_imminent':
            setKillZone(true)
            setMitosisActive(true)
            logEvent(data)
            break

          case 'mitosis_complete':
            setMitosisActive(true)
            if (data.newMint) {
              currentMintRef.current = data.newMint
              setCurrentMint(data.newMint)
            }
            if (data.generation) setGeneration(data.generation)
            logEvent(data)
            lastMilestoneRef.current = 0 // Reset milestone tracking for new token
            setTimeout(() => {
              setMitosisActive(false)
              setKillZone(false)
              setProgress(0)
            }, 3000)
            break

          case 'token_created':
            if (data.mint) {
              currentMintRef.current = data.mint
              setCurrentMint(data.mint)
            }
            if (data.generation) setGeneration(data.generation)
            setProgress(0)
            setMarketCap(0)
            setKillZone(false)
            setMitosisActive(false)
            setHolders([])
            lastMilestoneRef.current = 0 // Reset milestone tracking
            logEvent(data)
            break

          case 'holder_update':
            if (data.holders) {
              setHolders(data.holders)
              setHolderLastUpdate(Date.now())
              // Log holder updates too
              logEvent({ ...data, event: 'holder_update' })
            }
            break

          case 'initial_state':
            const initData = data as unknown as InitialStateEvent
            if (initData.mint) {
              currentMintRef.current = initData.mint
              setCurrentMint(initData.mint)
            }
            if (initData.generation !== undefined) setGeneration(initData.generation)
            // Log initial connection
            logEvent({ event: 'initial_state', timestamp: Date.now(), generation: initData.generation, mint: initData.mint })
            break
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    websocket.onerror = () => setConnected(false)
    websocket.onclose = () => {
      setConnected(false)
      setTimeout(() => {
        if (!websocket) return
        const reconnectWs = new WebSocket(wsUrl)
        reconnectWs.onopen = () => {
          setConnected(true)
          websocket = reconnectWs
        }
      }, 5000)
    }

    return () => {
      if (websocket && (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING)) {
        websocket.close()
      }
    }
  }, [])

  const { current: pokemon, next: nextPokemon } = getPokemonForGeneration(generation)
  const percentage = (progress * 100).toFixed(1)
  const glowColor = getGlowColor(pokemon.id)

  const copyCA = () => {
    if (currentMint) {
      navigator.clipboard.writeText(currentMint)
      setCopiedCA(true)
      setTimeout(() => setCopiedCA(false), 2000)
    }
  }

  // Glow intensity based on progress - starts early!
  const getGlowIntensity = () => {
    if (progress >= 0.95) return 80
    if (progress >= 0.8) return 60
    if (progress >= 0.6) return 45
    if (progress >= 0.4) return 35
    if (progress >= 0.2) return 25
    if (progress >= 0.1) return 15
    return 5
  }

  // Pokemon size grows with progress
  const getPokemonSize = () => {
    const baseSize = 200
    const maxGrowth = 80 // Can grow up to 80px bigger
    return baseSize + (progress * maxGrowth)
  }

  return (
    <main className="min-h-screen text-white">
      {/* Pokemon World Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/pokemon-in-the-wild.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-black/60" />

      {/* Audio Player */}
      <audio
        ref={audioRef}
        src="/Pokémon Theme Song.mp3"
        loop
        preload="auto"
        autoPlay
      />

      {/* Music Controls - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-pokemon-dark/90 backdrop-blur-sm border border-pokemon-yellow/30 rounded-full px-3 py-2">
        {/* Play/Pause Button */}
        <motion.button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-pokemon-yellow flex items-center justify-center text-pokemon-dark hover:bg-pokemon-electric transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 appearance-none bg-pokemon-darker rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-pokemon-yellow
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-pokemon-yellow
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:border-0"
            style={{
              background: `linear-gradient(to right, #FFCB05 0%, #FFCB05 ${volume * 100}%, #0f0f1a ${volume * 100}%, #0f0f1a 100%)`
            }}
          />
        </div>
      </div>

      {/* Evolution Animation Overlay */}
      <AnimatePresence>
        {mitosisActive && (
          <EvolutionAnimation
            generation={generation}
            onComplete={() => setMitosisActive(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Hero Section - Pokemon Evolution */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

          {/* Header Image */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Image
              src="/Pokechain-by-Claude-1-14-2026.png"
              alt="Pokechain by Claude"
              width={400}
              height={80}
              priority
            />
          </motion.div>

          {/* Simple One-Liner */}
          <motion.p
            className="text-pokemon-lightBlue/80 text-center text-lg md:text-xl mb-6 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Watch this Pokemon evolve when the bar fills up.
            {nextPokemon && nextPokemon.id !== pokemon.id && (
              <span className="block mt-2 text-pokemon-yellow">
                Top 100 holders get <span className="font-bold">{nextPokemon.name}</span> airdropped automatically!
              </span>
            )}
          </motion.p>

          {/* Big Pokemon Display */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glow ring behind Pokemon - always visible, grows with progress */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: getPokemonSize() + 100,
                height: getPokemonSize() + 100,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${glowColor}${Math.floor(20 + progress * 60).toString(16)} 0%, ${glowColor}20 40%, transparent 70%)`,
                filter: `blur(${getGlowIntensity()}px)`,
              }}
              animate={
                killZone
                  ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                  : { scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }
              }
              transition={{ duration: killZone ? 0.3 : 2, repeat: Infinity }}
            />

            {/* Pokemon Sprite - grows with progress */}
            <motion.div
              className={`relative ${killZone ? 'ready-shake' : ''}`}
              animate={{
                filter: `drop-shadow(0 0 ${getGlowIntensity()}px ${glowColor})`,
                scale: 1 + (progress * 0.3), // Grows up to 30% bigger
              }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={pokemon.animatedSprite || pokemon.sprite}
                alt={pokemon.name}
                width={200}
                height={200}
                className="pixelated"
                style={{ imageRendering: 'pixelated' }}
                unoptimized
              />
            </motion.div>
          </motion.div>

          {/* Pokemon Name */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-pokemon-yellow mb-2"
            style={{ textShadow: `0 0 30px ${glowColor}` }}
          >
            {pokemon.name}
          </motion.h1>

          {/* Evolution Stage */}
          <p className="text-pokemon-blue mb-8">
            Evolution #{generation}
          </p>

          {/* Big Progress Bar */}
          <div className="w-full max-w-lg mb-4">
            <div className="xp-bar h-10 rounded-lg overflow-hidden relative">
              <motion.div
                className="xp-bar-fill h-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Percentage overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-pokemon-dark text-lg drop-shadow">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Market Cap */}
          <p className="text-pokemon-lightBlue/70 text-sm mb-4">
            ${marketCap.toLocaleString()} / $69,000
          </p>

          {/* Evolution Warning */}
          <AnimatePresence>
            {killZone && (
              <motion.div
                className="bg-pokemon-yellow/20 border-2 border-pokemon-yellow rounded-xl px-6 py-3 mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: [1, 1.02, 1] }}
                exit={{ opacity: 0 }}
                transition={{ scale: { duration: 0.5, repeat: Infinity } }}
              >
                <span className="text-pokemon-yellow font-bold text-lg">
                  ⚡ {pokemon.name} is about to evolve! ⚡
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Evolution Preview */}
          {nextPokemon && nextPokemon.id !== pokemon.id && (
            <motion.div
              className="flex items-center gap-4 bg-pokemon-dark/50 border border-pokemon-blue/30 rounded-xl px-6 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-pokemon-lightBlue">Evolves into:</span>
              <Image
                src={nextPokemon.animatedSprite || nextPokemon.sprite}
                alt={nextPokemon.name}
                width={64}
                height={64}
                className="pixelated"
                style={{ imageRendering: 'pixelated' }}
                unoptimized
              />
              <span className="text-pokemon-yellow font-bold text-lg">{nextPokemon.name}</span>
            </motion.div>
          )}

          {/* Buy Button */}
          {currentMint && (
            <motion.a
              href={`https://pump.fun/${currentMint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 bg-pokemon-yellow hover:bg-pokemon-electric text-pokemon-dark font-bold py-3 px-8 rounded-xl transition-all hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Buy on Pump.fun
            </motion.a>
          )}

          {/* Contract Address (CA) Display */}
          {currentMint && (
            <motion.div
              className="mt-6 bg-pokemon-dark/80 border border-pokemon-blue/30 rounded-xl px-4 py-3 max-w-lg w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-pokemon-lightBlue text-xs uppercase tracking-wider mb-1">
                    PokeDex ID (CA)
                  </div>
                  <code className="text-white text-sm font-mono break-all select-all">
                    {currentMint}
                  </code>
                </div>
                <motion.button
                  onClick={copyCA}
                  className="bg-pokemon-yellow/20 hover:bg-pokemon-yellow/30 text-pokemon-yellow px-4 py-2 rounded-lg text-xs uppercase tracking-wider border border-pokemon-yellow/30 transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copiedCA ? 'Caught!' : 'Copy'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Connection Status */}
          <div className={`mt-6 flex items-center gap-2 text-xs ${connected ? 'text-pokemon-yellow/50' : 'text-pokemon-red/50'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-pokemon-yellow/50' : 'bg-pokemon-red/50'}`} />
            {connected ? 'Live' : 'Connecting...'}
          </div>
        </div>

        {/* Bottom Section - Trainer Leaderboard & Event Log */}
        <div className="px-4 pb-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HolderLeaderboard
              holders={holders}
              lastUpdate={holderLastUpdate}
            />
            <EventLog events={events} />
          </div>
        </div>

      </div>
    </main>
  )
}
