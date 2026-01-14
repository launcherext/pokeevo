'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import PokemonSprite from './PokemonSprite';
import { getPokemonForGeneration, getEvolutionStageName } from '@/lib/pokemon';

interface Props {
  progress: number;
  marketCap: number;
  generation: number;
  killZone: boolean;
}

export default function EvolutionProgress({ progress, marketCap, generation, killZone }: Props) {
  const percentage = (progress * 100).toFixed(2);
  const isNearComplete = progress >= 0.95;

  // Get current and next Pokemon based on generation
  const { current, next, stageIndex } = useMemo(
    () => getPokemonForGeneration(generation),
    [generation]
  );

  // Determine evolution status text
  const getStatusText = () => {
    if (progress >= 0.99) return 'EVOLUTION IMMINENT!';
    if (progress >= 0.9) return 'Almost there...';
    if (progress >= 0.75) return 'Power building...';
    if (progress >= 0.5) return 'Getting stronger!';
    return 'Gaining experience...';
  };

  return (
    <div className="pokemon-card p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-pokemon-yellow mb-2 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Evolution Power
          </h2>
          <p className="text-sm text-pokemon-lightBlue">
            {getEvolutionStageName(stageIndex)} - {getStatusText()}
          </p>
        </div>
        <div className="text-right">
          <div
            className={`text-4xl font-bold tracking-tighter ${
              killZone ? 'text-pokemon-yellow animate-pulse' : 'text-white'
            }`}
            style={killZone ? { textShadow: '0 0 20px rgba(255, 203, 5, 0.8)' } : {}}
          >
            {percentage}%
          </div>
          <div className="text-xs text-pokemon-blue uppercase tracking-widest mt-1">
            Target 99.5%
          </div>
        </div>
      </div>

      {/* Pokemon Evolution Display */}
      <div className="flex items-center justify-center gap-8 mb-8 py-4">
        {/* Current Pokemon */}
        <div className="flex flex-col items-center">
          <PokemonSprite
            pokemon={current}
            progress={progress}
            size={120}
            showName
            isEvolving={killZone}
          />
        </div>

        {/* Arrow / Progress Indicator */}
        <div className="flex flex-col items-center">
          <motion.div
            className="text-4xl"
            animate={{
              x: [0, 10, 0],
              opacity: progress >= 0.5 ? [0.5, 1, 0.5] : 0.3,
            }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span style={{ color: progress >= 0.75 ? '#FFCB05' : '#3B4CCA' }}>
              {progress >= 0.99 ? '>>>' : progress >= 0.75 ? '>>' : '>'}
            </span>
          </motion.div>
        </div>

        {/* Next Evolution (if exists) */}
        {next && next.id !== current.id ? (
          <div className="flex flex-col items-center opacity-50">
            <PokemonSprite
              pokemon={next}
              progress={0}
              size={120}
              showName
              isSilhouette={progress < 0.75}
            />
            {progress < 0.75 && (
              <span className="mt-2 text-xs text-pokemon-blue">???</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center opacity-50">
            <div className="w-[120px] h-[120px] flex items-center justify-center">
              <span className="text-4xl text-pokemon-yellow">?</span>
            </div>
            <span className="mt-2 text-sm text-pokemon-blue">Next Chain</span>
          </div>
        )}
      </div>

      {/* XP Style Progress Bar */}
      <div className="relative mb-8">
        <div className="xp-bar h-8 rounded-lg overflow-hidden">
          <motion.div
            className="xp-bar-fill h-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>

          {/* Threshold Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-pokemon-red z-10"
            style={{ left: '99.5%' }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-pokemon-red font-bold whitespace-nowrap">
              EVOLVE
            </div>
          </div>
        </div>

        {/* Power Level Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-pixel text-xs text-pokemon-dark drop-shadow-lg">
            PWR: {percentage}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-pokemon-darker/50 rounded-xl p-4 border border-pokemon-blue/30">
          <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-1">
            Market Cap
          </div>
          <div className="text-xl font-medium text-white">
            ${marketCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-pokemon-darker/50 rounded-xl p-4 border border-pokemon-blue/30">
          <div className="text-pokemon-lightBlue text-xs uppercase tracking-widest mb-1">
            Target Cap
          </div>
          <div className="text-xl font-medium text-pokemon-yellow">$69,000</div>
        </div>
      </div>

      {/* Evolution Imminent Warning */}
      {killZone && (
        <motion.div
          className="mt-6 bg-pokemon-yellow/10 border-2 border-pokemon-yellow/50 rounded-xl p-4"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.02, 1],
            borderColor: [
              'rgba(255, 203, 5, 0.5)',
              'rgba(255, 203, 5, 1)',
              'rgba(255, 203, 5, 0.5)',
            ],
          }}
          transition={{
            scale: { duration: 0.5, repeat: Infinity },
            borderColor: { duration: 0.5, repeat: Infinity },
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⚡
            </motion.div>
            <div>
              <div className="font-bold text-pokemon-yellow text-lg">
                What? {current.name} is evolving!
              </div>
              <div className="text-sm text-pokemon-lightBlue">
                Preparing evolution sequence...
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
