import Combobox from '@/components/ui/Combobox'
import { useState, useEffect } from 'react'

interface FilterPreviewProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onFilterClick: () => void
  activeFiltersCount: number
  selectedCategory: string
  selectedFunctionalGroup: string
  viewerType: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'
  onCategoryChange: (value: string) => void
  onFunctionalGroupChange: (value: string) => void
  onViewerTypeChange: (value: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol') => void
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
  viewerType,
  onCategoryChange,
  onFunctionalGroupChange,
  onViewerTypeChange,
  reactionCategories,
  functionalGroups,
}: FilterPreviewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Collapse when scrolling down, expand when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsCollapsed(true)
      } else if (currentScrollY < lastScrollY) {
        setIsCollapsed(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <div className="library-filters bg-white rounded-lg shadow-sm mb-4 p-0 transition-all duration-300"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        transform: isCollapsed ? 'translateY(-60px)' : 'translateY(0px)',
        overflow: 'hidden'
      }}>
      <div
        className="filter-preview bg-white sticky top-0 z-50 shadow-sm "
        style={{
          // maxHeight: isCollapsed ? '70px' : '200px',
          // transform: isCollapsed ? 'translateY(-70px)' : 'translateY(0px)',
          overflow: 'hidden'
        }}
      >
        {/* Top Row: Search Bar + Filter Button - Hidden when collapsed */}
        <div
          className="transition-all duration-300"
          style={{
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? 'translateY(0px)' : 'translateY(0px)',
            overflow: 'hidden'
          }}
        >
          <div className="flex items-center gap-2 p-3 pb-1">
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
        </div>

        {/* Bottom Row: Horizontal Scrollable Filter Dropdowns */}
        <div className="filter-dropdowns-wrapper overflow-x-auto p-2 scrollbar-hide" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="filter-dropdowns flex items-center gap-2 pb-1" style={{ width: 'max-content' }}>
            {/* Category Dropdown */}
            <Combobox
              options={reactionCategories.map(cat => ({ value: cat.id, label: cat.name }))}
              value={selectedCategory}
              onValueChange={onCategoryChange}
              placeholder="Category"
              searchPlaceholder="Search categories..."
              isActive={selectedCategory !== 'all'}
              className="flex-shrink-0 min-w-[140px]"
            />

            {/* Functional Group Dropdown */}
            <Combobox
              options={functionalGroups.map(group => ({ value: group.id, label: group.name }))}
              value={selectedFunctionalGroup}
              onValueChange={onFunctionalGroupChange}
              placeholder="Functional Group"
              searchPlaceholder="Search groups..."
              isActive={selectedFunctionalGroup !== 'all'}
              className="flex-shrink-0 min-w-[160px]"
            />

            {/* Molecule Viewer Dropdown */}
            <Combobox
              options={[
                { value: 'rdkit', label: 'RDKit' },
                { value: '3dmol', label: '3Dmol.js' },
                { value: 'ketcher', label: 'Ketcher' },
                { value: 'kekule', label: 'Kekule.js' },
                { value: 'simple', label: 'Simple' }
              ]}
              value={viewerType}
              onValueChange={(value) => onViewerTypeChange(value as 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol')}
              placeholder="Viewer"
              searchPlaceholder="Search viewers..."
              className="flex-shrink-0 min-w-[140px]"
            />

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
    </div>
  )
}

export default FilterPreview
