// Chemistry-related types
export interface ChemicalCompound {
  id: string
  name: string
  formula?: string
  smiles: string
  inchi?: string
  inchiKey?: string
  molecularWeight?: number
  pubChemCID?: number
  chebiId?: string
  sdfData?: string // 3D structure data in SDF format
}

export interface Reagent {
  compound: ChemicalCompound
  stoichiometry?: number
  conditions?: string // e.g., "xs", "cat", "1 equiv"
}

export interface Reaction {
  id: string
  name: string
  description: string
  category: string // e.g., "Oxidation", "Reduction", "Addition"
  reactants: Reagent[]
  products: Reagent[]
  conditions?: string[]
  smarts?: string // SMARTS pattern for the reaction
  temperature?: string
  solvent?: string
  yield?: number
  references?: string[]
  tags?: string[]
}

export interface ReactionCategory {
  id: string
  name: string
  description: string
  reactionCount: number
}

export interface ChemicalSearchResult {
  compound: ChemicalCompound
  source: 'pubchem' | 'chebi' | 'local'
  relevance?: number
}

export type ReactionFilter = {
  category?: string
  tags?: string[]
  searchTerm?: string
}
