import { useState, useEffect } from 'react'
import Combobox from '@/components/ui/Combobox'
import Button from '@/components/ui/Button'
import functionalGroupsData from '@/data/functional_groups_reference.json'

// Filter options data
export const REACTION_CATEGORIES = [
  { id: 'all', name: 'All Reactions' },
  { id: 'oxidation', name: 'Oxidation' },
  { id: 'reduction', name: 'Reduction' },
  { id: 'addition', name: 'Addition' },
  { id: 'substitution', name: 'Substitution' },
  { id: 'condensation', name: 'Condensation' },
  { id: 'grignard', name: 'Grignard' }
]

// Transform JSON data into the format needed for the combobox
export const FUNCTIONAL_GROUPS = [
  { id: 'all', name: 'All Groups', formula: '' },
  ...functionalGroupsData.map((group: any) => ({
    id: group.id,
    name: group.name,
    formula: group.formula
  }))
]

export const VIEWER_TYPES = [
  { value: 'rdkit', label: '2D RDKit', description: 'Best for accurate 2D SMILES rendering.' },
  { value: '3dmol', label: '3Dmol.js', description: 'Interactive 3D molecular structures with rotation.' },
  { value: 'simple', label: 'Formula', description: 'Basic fallback viewer.' }
] as const

interface UnifiedFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  selectedFunctionalGroup: string
  viewerType: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'
  onCategoryChange: (value: string) => void
  onFunctionalGroupChange: (value: string) => void
  onViewerTypeChange: (value: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol') => void
  onClearFilters: () => void
  expandAll: boolean
  onExpandAllChange: (value: boolean) => void
}

function UnifiedFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  selectedFunctionalGroup,
  viewerType,
  onCategoryChange,
  onFunctionalGroupChange,
  onViewerTypeChange,
  onClearFilters,
  expandAll,
  onExpandAllChange
}: UnifiedFiltersProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Count active filters
  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedFunctionalGroup !== 'all' ? 1 : 0)

  // Handle scroll to collapse/expand preview
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

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

  const handleClearAll = () => {
    onClearFilters()
    setIsPanelOpen(false)
  }

  return (
    <>
      {/* Filter Preview - Sticky at top */}
      <div 
        className="filter-container bg-white rounded-lg shadow-sm mb-4 p-0 transition-all duration-300 z-50"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
        //   transform: isCollapsed ? 'translateY(-60px)' : 'translateY(0px)'
        }}
      >
        {/* Search Bar Section */}
        <div
          className="transition-all duration-300"
          style={{
            opacity: isCollapsed ? 0 : 1,
            maxHeight: isCollapsed ? '0px' : '100px',
            overflow: 'hidden'
          }}
        >
          <div className="flex items-center gap-2 p-3 pb-1">
            {/* Search Input */}
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="relative px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline text-gray-700 font-medium">
                {isPanelOpen ? 'Hide' : 'Filters'}
              </span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills Section */}
        <div className="overflow-x-auto p-2 scrollbar-hide" style={{ width: '100%' }}>
          <div className="flex items-center gap-2 pb-1" style={{ width: 'max-content' }}>
            {/* Category Combobox */}
            <Combobox
              options={REACTION_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))}
              value={selectedCategory}
              onValueChange={onCategoryChange}
              placeholder="Category"
              searchPlaceholder="Search categories..."
              isActive={selectedCategory !== 'all'}
              className="flex-shrink-0 min-w-[130px]"
            />

            {/* Functional Group Combobox */}
            <Combobox
              options={FUNCTIONAL_GROUPS.map(group => ({ 
                value: group.id, 
                label: group.name,
                description: group.formula 
              }))}
              value={selectedFunctionalGroup}
              onValueChange={onFunctionalGroupChange}
              placeholder="Functional Group"
              searchPlaceholder="Search groups..."
              isActive={selectedFunctionalGroup !== 'all'}
              className="flex-shrink-0 min-w-[130px]"
            />

            {/* Viewer Type Combobox */}
            <Combobox
              options={VIEWER_TYPES.map(v => ({ value: v.value, label: v.label }))}
              value={viewerType}
              onValueChange={(value) => onViewerTypeChange(value as typeof viewerType)}
              placeholder="Viewer"
              searchPlaceholder="Search viewers..."
              className="flex-shrink-0 min-w-[100px]"
            />

            {/* Expand/Collapse All Toggle */}
            <button
              onClick={() => onExpandAllChange(!expandAll)}
              className={`flex-shrink-0 px-4 py-2 border rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                expandAll
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={expandAll ? 'Collapse all reactions' : 'Expand all reactions'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {expandAll ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
              <span className="hidden sm:inline">
                {expandAll ? 'Collapse' : 'Expand'} All
              </span>
            </button>

            {/* Named Reactions Button */}
            <button className="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
              Named Reactions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        <div
          className="transition-all duration-300 overflow-hidden border-t border-gray-200"
          style={{
            maxHeight: isPanelOpen ? '600px' : '0px',
            position: 'relative',
            top: '-60px'

          }}
        >
          <div className="p-6 space-y-6 bg-gray-50">
            {/* Category Filter */}
            <div className="filter-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Reaction Category
              </label>
              <Combobox
                options={REACTION_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))}
                value={selectedCategory}
                onValueChange={onCategoryChange}
                placeholder="Select category..."
                searchPlaceholder="Search categories..."
                isActive={selectedCategory !== 'all'}
              />
            </div>

            {/* Functional Group Filter */}
            <div className="filter-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Functional Group
              </label>
              <Combobox
                options={FUNCTIONAL_GROUPS.map(group => ({ 
                  value: group.id, 
                  label: group.name,
                  description: group.formula 
                }))}
                value={selectedFunctionalGroup}
                onValueChange={onFunctionalGroupChange}
                placeholder="Select functional group..."
                searchPlaceholder="Search groups..."
                isActive={selectedFunctionalGroup !== 'all'}
              />
            </div>

            {/* Viewer Type Selector */}
            <div className="filter-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Molecule Viewer
              </label>
              <Combobox
                options={VIEWER_TYPES.map(v => ({ value: v.value, label: v.label }))}
                value={viewerType}
                onValueChange={(value) => onViewerTypeChange(value as typeof viewerType)}
                placeholder="Select viewer..."
                searchPlaceholder="Search viewers..."
              />
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                {VIEWER_TYPES.map(viewer => (
                  <p key={viewer.value}>
                    <strong>{viewer.label.split(' ')[0]}:</strong> {viewer.description}
                  </p>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-300">
              <Button onClick={handleClearAll} variant="outline">
                Clear All
              </Button>
              <Button onClick={() => setIsPanelOpen(false)} variant="primary">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      {/* <div style={{ height: isPanelOpen ? '700px' : '140px' }} className="transition-all duration-300" /> */}
    </>
  )
}

export default UnifiedFilters
