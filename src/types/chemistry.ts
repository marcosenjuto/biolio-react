export * from './atom-model'
export * from './molecule-model'
export * from './protein-model'
export * from './reaction-model'

// Use BioblioReaction as the main Reaction type
export type { BioblioReaction as Reaction } from './reaction-model'

export interface ReactionCategory {
  id: string
  name: string
  description: string
  reactionCount: number
}

export interface ChemicalSearchResult {
  compound: import('./molecule-model').Molecule
  source: 'pubchem' | 'chebi' | 'local'
  relevance?: number
}

export type ReactionFilter = {
  category?: string
  tags?: string[]
  searchTerm?: string
}
