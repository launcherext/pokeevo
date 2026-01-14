// Pokemon Evolution Chain Data
// Sprites from PokeAPI: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/

export interface PokemonData {
  id: number;
  name: string;
  stage: number; // 1=base, 2=mid, 3=final
  sprite: string;
  animatedSprite?: string;
}

export interface EvolutionChain {
  id: number;
  pokemon: PokemonData[];
}

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const ANIMATED_BASE = `${SPRITE_BASE}/versions/generation-v/black-white/animated`;

// Helper to generate sprite URLs
const sprite = (id: number) => `${SPRITE_BASE}/${id}.png`;
const animated = (id: number) => `${ANIMATED_BASE}/${id}.gif`;

// Pichu -> Pikachu -> Raichu Evolution Chain
// This is the only evolution chain - it repeats infinitely
export const EVOLUTION_CHAINS: EvolutionChain[] = [
  {
    id: 1,
    pokemon: [
      { id: 172, name: 'Pichu', stage: 1, sprite: sprite(172), animatedSprite: animated(172) },
      { id: 25, name: 'Pikachu', stage: 2, sprite: sprite(25), animatedSprite: animated(25) },
      { id: 26, name: 'Raichu', stage: 3, sprite: sprite(26), animatedSprite: animated(26) },
    ],
  },
];

/**
 * Get the Pokemon for a given generation
 * Generation 1: Pichu, Generation 2: Pikachu, Generation 3: Raichu
 * Then it cycles back: Generation 4: Pichu, etc.
 */
export function getPokemonForGeneration(generation: number): {
  current: PokemonData;
  next: PokemonData | null;
  chain: EvolutionChain;
  chainIndex: number;
  stageIndex: number;
} {
  // Calculate which chain and which stage
  const chainIndex = Math.floor((generation - 1) / 3) % EVOLUTION_CHAINS.length;
  const stageIndex = (generation - 1) % 3;

  const chain = EVOLUTION_CHAINS[chainIndex];
  const current = chain.pokemon[stageIndex];

  // Get next evolution (if not at final stage)
  const next = stageIndex < 2 ? chain.pokemon[stageIndex + 1] : null;

  return {
    current,
    next,
    chain,
    chainIndex,
    stageIndex,
  };
}

/**
 * Get the evolution stage name
 */
export function getEvolutionStageName(stageIndex: number): string {
  const stages = ['Base Form', 'First Evolution', 'Final Form'];
  return stages[stageIndex] || 'Unknown';
}

/**
 * Check if this is the final evolution in the chain
 */
export function isFinalEvolution(generation: number): boolean {
  const stageIndex = (generation - 1) % 3;
  return stageIndex === 2;
}

/**
 * Get glow color based on Pokemon - All electric type yellow theme
 */
export function getGlowColor(pokemonId: number): string {
  // Pichu - lighter yellow
  if (pokemonId === 172) return '#FFF176';
  // Pikachu - classic yellow
  if (pokemonId === 25) return '#FFCB05';
  // Raichu - orange-gold
  if (pokemonId === 26) return '#F8A030';
  // Default - electric yellow
  return '#FFCB05';
}
