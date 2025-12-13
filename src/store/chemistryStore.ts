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
      filtered = filtered.filter(r => {
        // Handle category as array (BioblioReaction) or string (legacy)
        const category: string | string[] = r.category as any
        if (Array.isArray(category)) {
          return category.some((cat: string) => cat.toLowerCase() === selectedCategory.toLowerCase())
        }
        // Handle legacy string category (should not happen with BioblioReaction)
        if (typeof category === 'string') {
          return category.toLowerCase() === selectedCategory.toLowerCase()
        }
        return false
      })
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r => {
        // Search in name and description
        if (r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)) {
          return true
        }
        
        // Search in tags
        if (r.tags?.some(tag => tag.toLowerCase().includes(term))) {
          return true
        }
        
        // Search in reactants
        if (r.reactants.some(reagent => {
          if (!reagent.compound) return false
          const compound = reagent.compound
          if ('names' in compound) {
            if (Array.isArray(compound.names)) {
              // BioblioReaction format: Names is an array
              return compound.names.some((n: any) => n.value.toLowerCase().includes(term))
            } else if (typeof compound.names === 'object' && !Array.isArray(compound.names)) {
              // Old format (shouldn't happen with BioblioReaction)
              const names = compound.names as any
              return (
                names.common?.some((n: string) => n.toLowerCase().includes(term)) ||
                names.iupac?.toLowerCase().includes(term)
              )
            }
          }
          if ('name' in compound && typeof compound.name === 'string') {
            return compound.name.toLowerCase().includes(term)
          }
          return false
        })) {
          return true
        }
        
        // Search in products
        if (r.products.some(reagent => {
          if (!reagent.compound) return false
          const compound = reagent.compound
          if ('names' in compound) {
            if (Array.isArray(compound.names)) {
              return compound.names.some((n: any) => n.value.toLowerCase().includes(term))
            } else if (typeof compound.names === 'object' && !Array.isArray(compound.names)) {
              const names = compound.names as any
              return (
                names.common?.some((n: string) => n.toLowerCase().includes(term)) ||
                names.iupac?.toLowerCase().includes(term)
              )
            }
          }
          if ('name' in compound && typeof compound.name === 'string') {
            return compound.name.toLowerCase().includes(term)
          }
          return false
        })) {
          return true
        }
        
        return false
      })
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
    return get().reactions.filter(r => {
      const cat: string | string[] = r.category as any
      if (Array.isArray(cat)) {
        return cat.some((c: string) => c.toLowerCase() === category.toLowerCase())
      }
      if (typeof cat === 'string') {
        return cat.toLowerCase() === category.toLowerCase()
      }
      return false
    })
  },

  getReactionsByTag: (tag) => {
    return get().reactions.filter(r => r.tags?.includes(tag))
  },
}))

export { reactionCategories }
