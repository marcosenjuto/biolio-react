import { Select, SelectItem } from '@/components/ui/Select'

interface FilterPreviewProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onFilterClick: () => void
  activeFiltersCount: number
  selectedCategory: string
  selectedFunctionalGroup: string
  onCategoryChange: (value: string) => void
  onFunctionalGroupChange: (value: string) => void
  reactionCategories: Array<{ id: string; name: string }>
  functionalGroups: Array<{ id: string; name: string }>
}

function FilterPreview({
  searchTerm,
  onSearchChange,
  onFilterClick,
  activeFiltersCount,
  selectedCategory,
  selectedFunctionalGroup,
  onCategoryChange,
  onFunctionalGroupChange,
  reactionCategories,
  functionalGroups,
}: FilterPreviewProps) {
  return (
    <div className="filter-preview space-y-2">
      {/* Top Row: Search Bar + Filter Button */}
      <div className="flex items-center gap-2">
        {/* Search Bar - Always Visible */}
        <div className="search-input-wrapper flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, reactant..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button 
          onClick={onFilterClick}
          className="filter-toggle-button relative px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="hidden sm:inline text-gray-700 font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Row: Horizontal Scrollable Filter Dropdowns */}
      <div className="filter-dropdowns-wrapper overflow-x-auto scrollbar-hide" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="filter-dropdowns flex items-center gap-2 pb-1" style={{ width: 'max-content' }}>
          {/* Category Dropdown */}
          <div className="relative flex-shrink-0">
            <Select
              value={selectedCategory}
              onValueChange={onCategoryChange}
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
            <svg 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" 
              style={{ color: selectedCategory !== 'all' ? 'white' : '#9ca3af' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Functional Group Dropdown */}
          <div className="relative flex-shrink-0">
            <Select
              value={selectedFunctionalGroup}
              onValueChange={onFunctionalGroupChange}
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
            <svg 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" 
              style={{ color: selectedFunctionalGroup !== 'all' ? 'white' : '#9ca3af' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
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
  )
}

export default FilterPreview
