import { useEffect, useState } from 'react'
import { useChemistryStore, reactionCategories } from '@/store/chemistryStore'
import ExpandableReactionCard from '@/components/chemistry/ExpandableReactionCard'
import Button from '@/components/ui/Button'
import { Select, SelectItem } from '@/components/ui/Select'

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

        {/* Search and Filters */}
        <div className="library-filters bg-white rounded-lg shadow-sm mb-4">
          <div className="filters-top-row flex items-center gap-2  p-3">
            {/* Search */}
            <div className="search-input-wrapper flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, reactant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button className="filter-toggle-button px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline text-gray-700 font-medium">Filters</span>
            </button>
          </div>

          {/* Filter Dropdowns Row - Horizontal Scrollable */}
          <div className="filters-dropdowns-wrapper p-1 overflow-x-auto scrollbar-hide" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="filters-dropdowns flex items-center gap-2 pb-2" style={{ width: 'max-content' }}>
              {/* Category Dropdown */}
              <div className="relative flex-shrink-0">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={{
                    backgroundColor: selectedCategory !== 'all' ? '#0ea5e9' : 'white',
                    color: selectedCategory !== 'all' ? 'white' : '#374151',
                    borderColor: selectedCategory !== 'all' ? '#0ea5e9' : '#d1d5db'
                  }}
                >
                  {reactionCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" 
                  style={{ color: selectedCategory !== 'all' ? 'white' : '#9ca3af' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Functional Group Dropdown */}
              <div className="relative flex-shrink-0">
                <Select
                  value={selectedFunctionalGroup}
                  onValueChange={setSelectedFunctionalGroup}
                  style={{
                    backgroundColor: selectedFunctionalGroup !== 'all' ? '#0ea5e9' : 'white',
                    color: selectedFunctionalGroup !== 'all' ? 'white' : '#374151',
                    borderColor: selectedFunctionalGroup !== 'all' ? '#0ea5e9' : '#d1d5db'
                  }}
                >
                  {functionalGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </Select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" 
                  style={{ color: selectedFunctionalGroup !== 'all' ? 'white' : '#9ca3af' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Named Reactions Button */}
              <button className="filter-button flex-shrink-0 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
                Named Reactions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

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
        <div className="reactions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReactions.map((reaction) => (
            <ExpandableReactionCard
              key={reaction.id}
              reaction={reaction}
              isExpanded={selectedReaction?.id === reaction.id}
              onToggle={() => handleReactionClick(reaction.id)}
              onClose={handleCloseDetail}
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
