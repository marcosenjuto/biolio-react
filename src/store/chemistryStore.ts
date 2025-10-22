import { create } from 'zustand'
import type { Reaction, ReactionFilter } from '@/types/chemistry'
import { reactionsDatabase, reactionCategories } from '@/data/reactionsDatabase'

interface ChemistryState {
  reactions: Reaction[]
  filteredReactions: Reaction[]
  selectedReaction: Reaction | null
  filter: ReactionFilter
  searchTerm: string
  selectedCategory: string
  isLoading: boolean
  
  // Actions
  setFilter: (filter: ReactionFilter) => void
  setSearchTerm: (term: string) => void
  setSelectedCategory: (category: string) => void
  setSelectedReaction: (reaction: Reaction | null) => void
  applyFilters: () => void
  getReactionById: (id: string) => Reaction | undefined
  getReactionsByCategory: (category: string) => Reaction[]
  getReactionsByTag: (tag: string) => Reaction[]
}

export const useChemistryStore = create<ChemistryState>((set, get) => ({
  reactions: reactionsDatabase,
  filteredReactions: reactionsDatabase,
  selectedReaction: null,
  filter: {},
  searchTerm: '',
  selectedCategory: 'all',
  isLoading: false,

  setFilter: (filter) => {
    set({ filter })
    get().applyFilters()
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term })
    get().applyFilters()
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category })
    get().applyFilters()
  },

  setSelectedReaction: (reaction) => set({ selectedReaction: reaction }),

  applyFilters: () => {
    const { reactions, searchTerm, selectedCategory, filter } = get()
    
    let filtered = [...reactions]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(r => 
        r.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        r.reactants.some(reagent => reagent.compound.name.toLowerCase().includes(term)) ||
        r.products.some(reagent => reagent.compound.name.toLowerCase().includes(term))
      )
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(r =>
        filter.tags?.some(tag => r.tags?.includes(tag))
      )
    }

    set({ filteredReactions: filtered })
  },

  getReactionById: (id) => {
    return get().reactions.find(r => r.id === id)
  },

  getReactionsByCategory: (category) => {
    return get().reactions.filter(r => r.category.toLowerCase() === category.toLowerCase())
  },

  getReactionsByTag: (tag) => {
    return get().reactions.filter(r => r.tags?.includes(tag))
  },
}))

export { reactionCategories }
