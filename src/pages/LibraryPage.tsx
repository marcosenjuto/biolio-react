import { useEffect, useState } from 'react'
import { useChemistryStore } from '@/store/chemistryStore'
import ExpandableReactionCard from '@/components/chemistry/ExpandableReactionCard'
import UnifiedFilters, { REACTION_CATEGORIES } from '@/components/chemistry/UnifiedFilters'
import Button from '@/components/ui/Button'

function LibraryPage() {
  const {
    filteredReactions,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
  } = useChemistryStore()

  const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState('all')
  const [viewerType, setViewerType] = useState<'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'>('rdkit')
  const [expandAll, setExpandAll] = useState(true) // Default to expanded
  const [expandedReactions, setExpandedReactions] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Apply filters on mount
    useChemistryStore.getState().applyFilters()
    
    // Initialize all reactions as expanded
    const allReactionIds = new Set(useChemistryStore.getState().reactions.map(r => r.id))
    setExpandedReactions(allReactionIds)
  }, [])

  // Update expanded reactions when expandAll changes
  useEffect(() => {
    if (expandAll) {
      // Expand all filtered reactions
      const allReactionIds = new Set(filteredReactions.map(r => r.id))
      setExpandedReactions(allReactionIds)
    } else {
      // Collapse all
      setExpandedReactions(new Set())
    }
  }, [expandAll, filteredReactions])

  const handleReactionClick = (reactionId: string) => {
    setExpandedReactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reactionId)) {
        newSet.delete(reactionId)
      } else {
        newSet.add(reactionId)
      }
      return newSet
    })
  }

  return (
    <div className="library-page page min-h-screen bg-gray-50">
      <div className="library-container mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="spacer-100 h-28"></div>
        <div className="library-header mb-2">
          <h1 className="library-title text-4xl font-bold text-gray-900 mb-2">
            Library
          </h1>
{/*           <p className="library-subtitle text-lg text-gray-600">
            Explore {filteredReactions.length} organic reactions with molecular visualization
          </p> */}
        </div>

        {/* Unified Filters - Preview + Collapsible Panel */}
        <UnifiedFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          selectedFunctionalGroup={selectedFunctionalGroup}
          viewerType={viewerType}
          onCategoryChange={setSelectedCategory}
          onFunctionalGroupChange={setSelectedFunctionalGroup}
          onViewerTypeChange={setViewerType}
          onClearFilters={() => {
            setSelectedCategory('all')
            setSelectedFunctionalGroup('all')
          }}
          expandAll={expandAll}
          onExpandAllChange={setExpandAll}
        />

        {/* Results Count */}
        <div className="results-count mb-4">
          <p className="count-text text-sm text-gray-600">
            Showing <span className="count-number font-semibold">{filteredReactions.length}</span> reaction
            {filteredReactions.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${REACTION_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Reactions Grid */}
        <div className="reactions-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReactions.map((reaction) => (
            <ExpandableReactionCard
              key={reaction.id}
              reaction={reaction}
              isExpanded={expandedReactions.has(reaction.id)}
              onToggle={() => handleReactionClick(reaction.id)}
              viewerType={viewerType}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredReactions.length === 0 && (
          <div className="no-results text-center py-12">
            <svg
              className="no-results-icon mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="no-results-title mt-2 text-sm font-medium text-gray-900">No reactions found</h3>
            <p className="no-results-message mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
            <div className="no-results-action mt-6">
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="clear-filters-button"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryPage
