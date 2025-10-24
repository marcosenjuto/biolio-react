import { useEffect, useState } from 'react'
import { useChemistryStore, reactionCategories } from '@/store/chemistryStore'
import ExpandableReactionCard from '@/components/chemistry/ExpandableReactionCard'
import FilterPanel from '@/components/chemistry/FilterPanel'
import FilterPreview from '@/components/chemistry/FilterPreview'
import Button from '@/components/ui/Button'

// Functional groups list
const functionalGroups = [
  { id: 'all', name: 'All Groups' },
  { id: 'alcohol', name: 'Alcohol' },
  { id: 'aldehyde', name: 'Aldehyde' },
  { id: 'ketone', name: 'Ketone' },
  { id: 'carboxylic-acid', name: 'Carboxylic Acid' },
  { id: 'ester', name: 'Ester' },
  { id: 'ether', name: 'Ether' },
  { id: 'amine', name: 'Amine' },
  { id: 'amide', name: 'Amide' },
  { id: 'alkene', name: 'Alkene' },
  { id: 'alkyne', name: 'Alkyne' },
  { id: 'aromatic', name: 'Aromatic' },
  { id: 'halide', name: 'Halide' },
  { id: 'nitrile', name: 'Nitrile' },
  { id: 'nitro', name: 'Nitro' },
]

function LibraryPage() {
  const {
    filteredReactions,
    selectedReaction,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
    setSelectedReaction,
  } = useChemistryStore()

  const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewerType, setViewerType] = useState<'rdkit' | 'kekule' | 'simple' | 'ketcher'>('rdkit')

  useEffect(() => {
    // Apply filters on mount
    useChemistryStore.getState().applyFilters()
  }, [])

  const handleReactionClick = (reactionId: string) => {
    const reaction = useChemistryStore.getState().getReactionById(reactionId)
    if (reaction) {
      // Toggle: if clicking the same reaction, close it
      if (selectedReaction?.id === reactionId) {
        setSelectedReaction(null)
      } else {
        setSelectedReaction(reaction)
      }
    }
  }

  const handleCloseDetail = () => {
    setSelectedReaction(null)
  }

  return (
    <div className="library-page page min-h-screen bg-gray-50">
      <div className="library-container max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="library-header mb-2">
          <h1 className="library-title text-4xl font-bold text-gray-900 mb-2">
            Library
          </h1>
{/*           <p className="library-subtitle text-lg text-gray-600">
            Explore {filteredReactions.length} organic reactions with molecular visualization
          </p> */}
        </div>

        {/* Filters Section - Always Visible */}
        <div className="library-filters bg-white rounded-lg shadow-sm mb-4 p-3">
          <FilterPreview
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => setIsFilterOpen(true)}
            activeFiltersCount={
              (selectedCategory !== 'all' ? 1 : 0) + 
              (selectedFunctionalGroup !== 'all' ? 1 : 0)
            }
            selectedCategory={selectedCategory}
            selectedFunctionalGroup={selectedFunctionalGroup}
            onCategoryChange={setSelectedCategory}
            onFunctionalGroupChange={setSelectedFunctionalGroup}
            reactionCategories={reactionCategories}
            functionalGroups={functionalGroups}
          />
        </div>

        {/* Filter Modal */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
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
          reactionCategories={reactionCategories}
          functionalGroups={functionalGroups}
        />

        {/* Results Count */}
        <div className="results-count mb-4">
          <p className="count-text text-sm text-gray-600">
            Showing <span className="count-number font-semibold">{filteredReactions.length}</span> reaction
            {filteredReactions.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${reactionCategories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Reactions Grid */}
        <div className="reactions-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReactions.map((reaction) => (
            <ExpandableReactionCard
              key={reaction.id}
              reaction={reaction}
              isExpanded={selectedReaction?.id === reaction.id}
              onToggle={() => handleReactionClick(reaction.id)}
              onClose={handleCloseDetail}
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
