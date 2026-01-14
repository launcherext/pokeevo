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

// 12 iconic evolution chains
export const EVOLUTION_CHAINS: EvolutionChain[] = [
  {
    id: 1,
    pokemon: [
      { id: 4, name: 'Charmander', stage: 1, sprite: sprite(4), animatedSprite: animated(4) },
      { id: 5, name: 'Charmeleon', stage: 2, sprite: sprite(5), animatedSprite: animated(5) },
      { id: 6, name: 'Charizard', stage: 3, sprite: sprite(6), animatedSprite: animated(6) },
    ],
  },
  {
    id: 2,
    pokemon: [
      { id: 1, name: 'Bulbasaur', stage: 1, sprite: sprite(1), animatedSprite: animated(1) },
      { id: 2, name: 'Ivysaur', stage: 2, sprite: sprite(2), animatedSprite: animated(2) },
      { id: 3, name: 'Venusaur', stage: 3, sprite: sprite(3), animatedSprite: animated(3) },
    ],
  },
  {
    id: 3,
    pokemon: [
      { id: 7, name: 'Squirtle', stage: 1, sprite: sprite(7), animatedSprite: animated(7) },
      { id: 8, name: 'Wartortle', stage: 2, sprite: sprite(8), animatedSprite: animated(8) },
      { id: 9, name: 'Blastoise', stage: 3, sprite: sprite(9), animatedSprite: animated(9) },
    ],
  },
  {
    id: 4,
    pokemon: [
      { id: 25, name: 'Pikachu', stage: 1, sprite: sprite(25), animatedSprite: animated(25) },
      { id: 26, name: 'Raichu', stage: 2, sprite: sprite(26), animatedSprite: animated(26) },
      { id: 26, name: 'Raichu', stage: 3, sprite: sprite(26), animatedSprite: animated(26) }, // Pikachu only has 2 stages
    ],
  },
  {
    id: 5,
    pokemon: [
      { id: 133, name: 'Eevee', stage: 1, sprite: sprite(133), animatedSprite: animated(133) },
      { id: 135, name: 'Jolteon', stage: 2, sprite: sprite(135), animatedSprite: animated(135) }, // Electric Eevee
      { id: 135, name: 'Jolteon', stage: 3, sprite: sprite(135), animatedSprite: animated(135) },
    ],
  },
  {
    id: 6,
    pokemon: [
      { id: 129, name: 'Magikarp', stage: 1, sprite: sprite(129), animatedSprite: animated(129) },
      { id: 130, name: 'Gyarados', stage: 2, sprite: sprite(130), animatedSprite: animated(130) },
      { id: 130, name: 'Gyarados', stage: 3, sprite: sprite(130), animatedSprite: animated(130) },
    ],
  },
  {
    id: 7,
    pokemon: [
      { id: 147, name: 'Dratini', stage: 1, sprite: sprite(147), animatedSprite: animated(147) },
      { id: 148, name: 'Dragonair', stage: 2, sprite: sprite(148), animatedSprite: animated(148) },
      { id: 149, name: 'Dragonite', stage: 3, sprite: sprite(149), animatedSprite: animated(149) },
    ],
  },
  {
    id: 8,
    pokemon: [
      { id: 92, name: 'Gastly', stage: 1, sprite: sprite(92), animatedSprite: animated(92) },
      { id: 93, name: 'Haunter', stage: 2, sprite: sprite(93), animatedSprite: animated(93) },
      { id: 94, name: 'Gengar', stage: 3, sprite: sprite(94), animatedSprite: animated(94) },
    ],
  },
  {
    id: 9,
    pokemon: [
      { id: 63, name: 'Abra', stage: 1, sprite: sprite(63), animatedSprite: animated(63) },
      { id: 64, name: 'Kadabra', stage: 2, sprite: sprite(64), animatedSprite: animated(64) },
      { id: 65, name: 'Alakazam', stage: 3, sprite: sprite(65), animatedSprite: animated(65) },
    ],
  },
  {
    id: 10,
    pokemon: [
      { id: 66, name: 'Machop', stage: 1, sprite: sprite(66), animatedSprite: animated(66) },
      { id: 67, name: 'Machoke', stage: 2, sprite: sprite(67), animatedSprite: animated(67) },
      { id: 68, name: 'Machamp', stage: 3, sprite: sprite(68), animatedSprite: animated(68) },
    ],
  },
  {
    id: 11,
    pokemon: [
      { id: 74, name: 'Geodude', stage: 1, sprite: sprite(74), animatedSprite: animated(74) },
      { id: 75, name: 'Graveler', stage: 2, sprite: sprite(75), animatedSprite: animated(75) },
      { id: 76, name: 'Golem', stage: 3, sprite: sprite(76), animatedSprite: animated(76) },
    ],
  },
  {
    id: 12,
    pokemon: [
      { id: 246, name: 'Larvitar', stage: 1, sprite: sprite(246), animatedSprite: animated(246) },
      { id: 247, name: 'Pupitar', stage: 2, sprite: sprite(247), animatedSprite: animated(247) },
      { id: 248, name: 'Tyranitar', stage: 3, sprite: sprite(248), animatedSprite: animated(248) },
    ],
  },
];

/**
 * Get the Pokemon for a given generation
 * Generation 1-3: First chain (Charmander -> Charmeleon -> Charizard)
 * Generation 4-6: Second chain (Bulbasaur -> Ivysaur -> Venusaur)
 * etc.
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
 * Get glow color based on Pokemon type (simplified for visual effect)
 */
export function getGlowColor(pokemonId: number): string {
  // Electric types - yellow
  if ([25, 26, 135].includes(pokemonId)) return '#FFCB05';
  // Fire types - orange
  if ([4, 5, 6].includes(pokemonId)) return '#F08030';
  // Water types - blue
  if ([7, 8, 9, 130].includes(pokemonId)) return '#6890F0';
  // Grass types - green
  if ([1, 2, 3].includes(pokemonId)) return '#78C850';
  // Ghost types - purple
  if ([92, 93, 94].includes(pokemonId)) return '#705898';
  // Psychic types - pink
  if ([63, 64, 65].includes(pokemonId)) return '#F85888';
  // Dragon types - indigo
  if ([147, 148, 149].includes(pokemonId)) return '#7038F8';
  // Rock types - brown
  if ([74, 75, 76, 246, 247, 248].includes(pokemonId)) return '#B8A038';
  // Fighting types - red
  if ([66, 67, 68].includes(pokemonId)) return '#C03028';
  // Default - Pikachu yellow
  return '#FFCB05';
}
