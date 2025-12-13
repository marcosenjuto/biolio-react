import type { BioblioReaction } from '@/types/chemistry'
import reactionsData from './reactions-bioblio.json'

/**
 * Load reactions from BioblioReaction JSON data
 * This data follows the BioblioReaction model with full typing
 */

// Load reactions directly from the BioblioReaction JSON file
// Cast with unknown first to handle the structural differences in JSON
const loadedReactions = reactionsData.reactions as unknown as BioblioReaction[]

// Export the reactions database as BioblioReaction type
export const reactionsDatabase: BioblioReaction[] = loadedReactions

// ========== REACTION CATEGORIES ==========
// Load categories from JSON and add reaction counts dynamically
export const reactionCategories = reactionsData.categories.map(cat => ({
  ...cat,
  reactionCount: cat.id === 'all' 
    ? reactionsDatabase.length 
    : reactionsDatabase.filter(r => {
        const category: string | string[] = r.category as any
        if (Array.isArray(category)) {
          return category.some((c: string) => c.toLowerCase() === cat.id.toLowerCase())
        }
        // Handle legacy string category
        if (typeof category === 'string') {
          return category.toLowerCase() === cat.id.toLowerCase()  
        }
        return false
      }).length
}))
