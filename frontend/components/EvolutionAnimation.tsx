'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPokemonForGeneration, getGlowColor } from '@/lib/pokemon';

interface Props {
  generation: number;
  onComplete?: () => void;
}

type AnimationPhase = 'intro' | 'evolving' | 'reveal' | 'complete';

export default function EvolutionAnimation({ generation, onComplete }: Props) {
  const [phase, setPhase] = useState<AnimationPhase>('intro');
  const [flashCount, setFlashCount] = useState(0);

  // Get Pokemon for previous and current generation
  const oldGen = generation > 1 ? generation - 1 : 1;
  const { current: oldPokemon } = getPokemonForGeneration(oldGen);
  const { current: newPokemon, chainIndex } = getPokemonForGeneration(generation);

  // Check if this is a new chain (every 3 generations)
  const isNewChain = (generation - 1) % 3 === 0 && generation > 1;

  const glowColor = getGlowColor(newPokemon.id);

  // Animation sequence timing
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Intro (0-1s)
    timers.push(setTimeout(() => setPhase('evolving'), 1000));

    // Phase 2: Evolving flashes (1-3s)
    for (let i = 0; i < 8; i++) {
      timers.push(
        setTimeout(() => setFlashCount((prev) => prev + 1), 1000 + i * 250)
      );
    }

    // Phase 3: Reveal (3-4s)
    timers.push(setTimeout(() => setPhase('reveal'), 3000));

    // Phase 4: Complete (4-5s)
    timers.push(setTimeout(() => setPhase('complete'), 4000));

    // Call onComplete after animation
    timers.push(setTimeout(() => onComplete?.(), 5000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a3e 50%, #0a0a2a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Evolution sparkle particles */}
      <AnimatePresence>
        {(phase === 'evolving' || phase === 'reveal') && (
          <>
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 2,
                  repeat: phase === 'evolving' ? Infinity : 0,
                  repeatDelay: Math.random(),
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={glowColor}
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Evolution Container */}
      <div className="relative flex flex-col items-center">
        {/* "What? Pokemon is evolving!" text */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              className="absolute -top-24 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                What? <span className="text-pokemon-yellow">{oldPokemon.name}</span> is evolving!
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pokemon Sprite Container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Old Pokemon (during intro and evolving) */}
          <AnimatePresence>
            {(phase === 'intro' || phase === 'evolving') && (
              <motion.div
                className="absolute"
                initial={{ scale: 1 }}
                animate={
                  phase === 'evolving'
                    ? {
                        scale: [1, 1.2, 1, 1.2, 1],
                        filter:
                          flashCount % 2 === 0
                            ? 'brightness(1)'
                            : 'brightness(10) saturate(0)',
                      }
                    : {}
                }
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Image
                  src={oldPokemon.animatedSprite || oldPokemon.sprite}
                  alt={oldPokemon.name}
                  width={200}
                  height={200}
                  className="pixelated"
                  style={{
                    imageRendering: 'pixelated',
                    filter:
                      phase === 'evolving' && flashCount % 2 !== 0
                        ? 'brightness(10) saturate(0)'
                        : `drop-shadow(0 0 30px ${glowColor})`,
                  }}
                  unoptimized
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Pokemon (reveal phase) */}
          <AnimatePresence>
            {(phase === 'reveal' || phase === 'complete') && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
              >
                <Image
                  src={newPokemon.animatedSprite || newPokemon.sprite}
                  alt={newPokemon.name}
                  width={220}
                  height={220}
                  className="pixelated"
                  style={{
                    imageRendering: 'pixelated',
                    filter: `drop-shadow(0 0 40px ${glowColor})`,
                  }}
                  unoptimized
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow ring effect during evolution */}
          <AnimatePresence>
            {phase === 'evolving' && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`ring-${i}`}
                    className="absolute rounded-full border-4"
                    style={{ borderColor: glowColor }}
                    initial={{ width: 100, height: 100, opacity: 0 }}
                    animate={{
                      width: [100, 400],
                      height: [100, 400],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Congratulations text */}
        <AnimatePresence>
          {(phase === 'reveal' || phase === 'complete') && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Congratulations!
              </h2>
              <p className="text-xl md:text-2xl text-pokemon-lightBlue mb-2">
                Your <span className="text-pokemon-yellow">{oldPokemon.name}</span>{' '}
                evolved into
              </p>
              <motion.p
                className="text-4xl md:text-6xl font-bold text-pokemon-yellow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                style={{ textShadow: `0 0 30px ${glowColor}` }}
              >
                {newPokemon.name}!
              </motion.p>

              {isNewChain && (
                <motion.p
                  className="mt-4 text-lg text-pokemon-blue"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  A new evolution chain begins!
                </motion.p>
              )}

              <motion.div
                className="mt-8 text-pokemon-lightBlue text-lg uppercase tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Evolution Stage #{generation}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full screen flash effect */}
      <AnimatePresence>
        {phase === 'evolving' && flashCount > 0 && flashCount % 2 === 0 && (
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* Final reveal flash */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: glowColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.3, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
