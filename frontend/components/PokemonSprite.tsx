'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PokemonData, getGlowColor } from '@/lib/pokemon';

interface PokemonSpriteProps {
  pokemon: PokemonData;
  progress?: number; // 0-1 for glow intensity
  size?: number;
  showName?: boolean;
  isEvolving?: boolean;
  isSilhouette?: boolean;
  className?: string;
}

export default function PokemonSprite({
  pokemon,
  progress = 0,
  size = 96,
  showName = false,
  isEvolving = false,
  isSilhouette = false,
  className = '',
}: PokemonSpriteProps) {
  const [imageError, setImageError] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const glowColor = getGlowColor(pokemon.id);

  // Generate sparkles when progress is high
  useEffect(() => {
    if (progress < 0.75) {
      setSparkles([]);
      return;
    }

    const interval = setInterval(() => {
      const newSparkle = {
        id: Date.now(),
        x: Math.random() * size - size / 2,
        y: Math.random() * size - size / 2,
      };
      setSparkles((prev) => [...prev.slice(-8), newSparkle]);
    }, progress > 0.9 ? 150 : 300);

    return () => clearInterval(interval);
  }, [progress, size]);

  // Determine animation state based on progress
  const getAnimationState = () => {
    if (isEvolving) return 'evolution-pulse';
    if (progress >= 0.99) return 'ready-shake';
    if (progress >= 0.9) return 'animate-glow-intense animate-shake';
    if (progress >= 0.75) return 'animate-glow-pulse';
    if (progress >= 0.5) return 'animate-glow-pulse';
    return 'animate-bob';
  };

  // Calculate glow intensity
  const getGlowStyle = () => {
    if (progress < 0.5) return {};

    const intensity = Math.min((progress - 0.5) * 2, 1); // 0-1 scale from 50-100%
    const blurAmount = 10 + intensity * 30;
    const spreadAmount = intensity * 20;

    return {
      filter: `drop-shadow(0 0 ${blurAmount}px ${glowColor})`,
      ...(progress >= 0.9 && {
        filter: `drop-shadow(0 0 ${blurAmount}px ${glowColor}) brightness(${1 + intensity * 0.3})`,
      }),
    };
  };

  const spriteUrl = imageError ? pokemon.sprite : (pokemon.animatedSprite || pokemon.sprite);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Sparkle particles */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          initial={{ opacity: 0, scale: 0, x: sparkle.x, y: sparkle.y }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: sparkle.y - 40 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ color: glowColor }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}

      {/* Pokemon sprite */}
      <motion.div
        className={`relative ${getAnimationState()}`}
        style={{
          width: size,
          height: size,
          ...getGlowStyle(),
        }}
        animate={
          isEvolving
            ? {
                scale: [1, 1.2, 1, 1.2, 1],
                filter: [
                  'brightness(1)',
                  'brightness(2) saturate(0)',
                  'brightness(1)',
                  'brightness(2) saturate(0)',
                  'brightness(1)',
                ],
              }
            : {}
        }
        transition={
          isEvolving
            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        <Image
          src={spriteUrl}
          alt={pokemon.name}
          width={size}
          height={size}
          className={`pixelated ${isSilhouette ? 'brightness-0' : ''}`}
          style={{
            imageRendering: 'pixelated',
            filter: isSilhouette ? 'brightness(0) invert(1)' : undefined,
          }}
          onError={() => setImageError(true)}
          unoptimized
        />
      </motion.div>

      {/* Pokemon name */}
      {showName && (
        <motion.span
          className="mt-2 text-sm font-pixel text-pokemon-yellow text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textShadow: `0 0 10px ${glowColor}` }}
        >
          {pokemon.name}
        </motion.span>
      )}
    </div>
  );
}
