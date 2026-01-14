'use client'

import { useState } from 'react'
import { getPokemonForGeneration, getEvolutionStageName } from '@/lib/pokemon'

interface Props {
  mint: string
  generation: number
  tokenName?: string
  tokenSymbol?: string
}

export default function TokenInfo({ mint, generation, tokenName: propTokenName, tokenSymbol: propTokenSymbol }: Props) {
  const [copied, setCopied] = useState(false)
  const { current: pokemon, stageIndex } = getPokemonForGeneration(generation)

  const copyToClipboard = () => {
    if (mint) {
      navigator.clipboard.writeText(mint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortMint = mint ? `${mint.slice(0, 4)}...${mint.slice(-4)}` : 'Loading...'
  // Use props if provided, otherwise show loading state
  const tokenName = propTokenName || 'Loading...'
  const tokenSymbol = propTokenSymbol || '...'

  return (
    <div className="pokemon-card p-8 shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-pokemon-yellow tracking-tight flex items-center gap-2">
        <span>🎮</span>
        Active Pokemon
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token details */}
        <div className="space-y-4">
          <div>
            <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-1">Token Name</div>
            <div className="text-lg font-medium text-white">
              {tokenName}
            </div>
          </div>

          <div>
            <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-1">Symbol</div>
            <div className="text-lg font-medium text-white">
              {tokenSymbol}
            </div>
          </div>

          <div>
            <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-1">Evolution Stage</div>
            <div className="text-lg font-medium text-pokemon-yellow">
              #{generation} - {pokemon.name}
            </div>
            <div className="text-sm text-pokemon-blue">{getEvolutionStageName(stageIndex)}</div>
          </div>
        </div>

        {/* Mint address */}
        <div>
          <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-2">PokeDex ID (Contract)</div>
          <div
            className="bg-pokemon-darker/50 border border-pokemon-blue/30 rounded-xl p-4 cursor-pointer hover:bg-pokemon-yellow/5 hover:border-pokemon-yellow/50 transition-all group"
            onClick={copyToClipboard}
          >
            <div className="flex items-center justify-between">
              <code className="text-sm text-white font-mono">
                {shortMint}
              </code>
              <button className="text-pokemon-blue group-hover:text-pokemon-yellow transition-colors text-xs uppercase tracking-wider">
                {copied ? 'Caught!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Links */}
          {mint && (
            <div className="flex gap-2 mt-4">
              <a
                href={`https://solscan.io/token/${mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-pokemon-blue/20 hover:bg-pokemon-blue/30 text-pokemon-lightBlue hover:text-white text-xs py-3 px-4 rounded-lg text-center transition-colors border border-pokemon-blue/30 uppercase tracking-wider"
              >
                Solscan
              </a>
              <a
                href={`https://pump.fun/${mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-pokemon-yellow/20 hover:bg-pokemon-yellow/30 text-pokemon-yellow hover:text-white text-xs py-3 px-4 rounded-lg text-center transition-colors border border-pokemon-yellow/30 uppercase tracking-wider"
              >
                Pump.fun
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
