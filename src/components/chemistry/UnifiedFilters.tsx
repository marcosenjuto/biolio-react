import { useState, useEffect, useRef } from 'react'
import Combobox from '@/components/ui/Combobox'
import Button from '@/components/ui/Button'
import functionalGroupsData from '@/data/functional_groups_reference.json'
import { useLanguageStore } from '@/store/languageStore'

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
  const { t } = useLanguageStore()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)
  const lastScrollYRef = useRef(0)
  const isTransitioningRef = useRef(false)

  const reactionCategories = [
    { id: 'all', name: t.filters.allReactions },
    { id: 'oxidation', name: t.filters.categories.oxidation },
    { id: 'reduction', name: t.filters.categories.reduction },
    { id: 'addition', name: t.filters.categories.addition },
    { id: 'substitution', name: t.filters.categories.substitution },
    { id: 'condensation', name: t.filters.categories.condensation },
    { id: 'grignard', name: t.filters.categories.grignard }
  ]

  const functionalGroups = [
    { id: 'all', name: t.filters.allGroups, formula: '' },
    ...functionalGroupsData.map((group: any) => ({
      id: group.id,
      name: group.name,
      formula: group.formula
    }))
  ]

  const viewerTypes = [
    { value: 'rdkit', label: t.filters.viewers.rdkit, description: t.filters.viewers.rdkitDesc },
    { value: '3dmol', label: t.filters.viewers.threeDmol, description: t.filters.viewers.threeDmolDesc },
    { value: 'simple', label: t.filters.viewers.formula, description: t.filters.viewers.formulaDesc }
  ]

  // Count active filters
  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedFunctionalGroup !== 'all' ? 1 : 0)

  // Optimized scroll handler - prevent infinite loops from layout shifts
  useEffect(() => {
    const SCROLL_THRESHOLD = 50
    const HIDE_AFTER = 100

    const handleScroll = () => {
      // Ignore scroll events during transition
      if (isTransitioningRef.current) {
        // console.log('[Scroll] Ignoring - transitioning')
        return
      }

      const currentScrollY = window.scrollY
      const scrollDiff = currentScrollY - lastScrollYRef.current

      // Require significant scroll movement
      if (Math.abs(scrollDiff) < SCROLL_THRESHOLD) {
        // console.log('[Scroll] Below threshold, ignoring')
        return
      }

      const isScrollingDown = scrollDiff > 0
      const isScrollingUp = scrollDiff < 0

      // Only change state if direction changed and conditions are met
      if (isScrollingDown && isSearchBarVisible && currentScrollY > HIDE_AFTER) {
        // console.log('[Scroll] HIDING search bar')
        isTransitioningRef.current = true
        setIsSearchBarVisible(false)
        lastScrollYRef.current = currentScrollY
        
        // Reset transition flag after animation completes
        setTimeout(() => {
          isTransitioningRef.current = false
        }, 350) // Slightly longer than CSS transition (300ms)
        
      } else if (isScrollingUp && !isSearchBarVisible) {
        // console.log('[Scroll] SHOWING search bar')
        isTransitioningRef.current = true
        setIsSearchBarVisible(true)
        lastScrollYRef.current = currentScrollY
        
        // Reset transition flag after animation completes
        setTimeout(() => {
          isTransitioningRef.current = false
        }, 350)
        
      } else {
        // Update reference for continued scrolling in same direction
        lastScrollYRef.current = currentScrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isSearchBarVisible])

  const handleClearAll = () => {
    onClearFilters()
    setIsPanelOpen(false)
  }

  return (
    <>
      {/* Filter Preview - Sticky at top */}
      <div 
        className="filter-container bg-white rounded-lg shadow-sm mb-4 p-0 sticky top-0 left-0 z-50"
        style={{
          width: '100vw'
        }}
      >
        {/* Search Bar Section */}
        <div 
          className="filters-searchbar-section transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isSearchBarVisible ? '200px' : '0px',
            opacity: isSearchBarVisible ? 1 : 0,
            overflow: 'hidden'
          }}
        >
          <div className="filters-searchbar flex items-center gap-2 p-3 pb-1">
            {/* Search Input */}
            <div className="filters-search-input-wrapper search-input-wrapper flex-1">
              <div className="relative search-input-shell">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t.filters.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="searchbar-input w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="filters-toggle-button relative px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline text-gray-700 font-medium">
                {isPanelOpen ? t.filters.hide : t.filters.show}
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
        <div className="filters-pill-scroll overflow-x-auto py-1.5 px-2 scrollbar-hide" style={{ width: '100%' }}>
          <div className="filters-pill-row flex items-center gap-2" style={{ width: 'max-content' }}>
            {/* Category Combobox */}
            <Combobox
              options={reactionCategories.map(cat => ({ value: cat.id, label: cat.name }))}
              value={selectedCategory}
              onValueChange={onCategoryChange}
              placeholder={t.filters.category}
              searchPlaceholder={t.filters.searchCategories}
              isActive={selectedCategory !== 'all'}
              className="filters-category-combobox flex-shrink-0 min-w-[130px]"
            />

            {/* Functional Group Combobox */}
            <Combobox
              options={functionalGroups.map(group => ({ 
                value: group.id, 
                label: group.name,
                description: group.formula 
              }))}
              value={selectedFunctionalGroup}
              onValueChange={onFunctionalGroupChange}
              placeholder={t.filters.functionalGroup}
              searchPlaceholder={t.filters.searchGroups}
              isActive={selectedFunctionalGroup !== 'all'}
              className="filters-functional-group-combobox flex-shrink-0 min-w-[130px]"
            />

            {/* Viewer Type Combobox */}
            <Combobox
              options={viewerTypes.map(v => ({ value: v.value, label: v.label }))}
              value={viewerType}
              onValueChange={(value) => onViewerTypeChange(value as typeof viewerType)}
              placeholder={t.filters.viewer}
              searchPlaceholder={t.filters.searchViewers}
              className="filters-viewer-type-combobox flex-shrink-0 min-w-[100px]"
            />

            {/* Expand/Collapse All Toggle */}
            <button
              onClick={() => onExpandAllChange(!expandAll)}
              className={`filters-expand-toggle flex-shrink-0 px-4 py-2 border rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                expandAll
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={expandAll ? t.filters.collapseAll : t.filters.expandAll}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {expandAll ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
              <span className="hidden sm:inline">
                {expandAll ? t.filters.collapseAll : t.filters.expandAll}
              </span>
            </button>

            {/* Named Reactions Button */}
            <button className="filters-named-reactions-button flex-shrink-0 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
              {t.filters.namedReactions}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        <div
          className={`filters-expanded-panel transition-all duration-300 border-t border-gray-200 ${
            isPanelOpen ? 'max-h-[600px] overflow-auto' : 'max-h-0 overflow-hidden'
          }`}
        >
          <div className="filters-expanded-content p-6 space-y-6 bg-gray-50">
            {/* Category Filter */}
            <div className="filter-section filters-category-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.filters.reactionCategory}
              </label>
              <Combobox
                options={reactionCategories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={selectedCategory}
                onValueChange={onCategoryChange}
                placeholder={t.filters.selectCategory}
                searchPlaceholder={t.filters.searchCategories}
                isActive={selectedCategory !== 'all'}
              />
            </div>

            {/* Functional Group Filter */}
            <div className="filter-section filters-functional-group-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.filters.functionalGroup}
              </label>
              <Combobox
                options={functionalGroups.map(group => ({ 
                  value: group.id, 
                  label: group.name,
                  description: group.formula 
                }))}
                value={selectedFunctionalGroup}
                onValueChange={onFunctionalGroupChange}
                placeholder={t.filters.selectGroup}
                searchPlaceholder={t.filters.searchGroups}
                isActive={selectedFunctionalGroup !== 'all'}
              />
            </div>

            {/* Viewer Type Selector */}
            <div className="filter-section filters-viewer-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.filters.moleculeViewer}
              </label>
              <Combobox
                options={viewerTypes.map(v => ({ value: v.value, label: v.label }))}
                value={viewerType}
                onValueChange={(value) => onViewerTypeChange(value as typeof viewerType)}
                placeholder={t.filters.selectViewer}
                searchPlaceholder={t.filters.searchViewers}
              />
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                {viewerTypes.map(viewer => (
                  <p key={viewer.value}>
                    <strong>{viewer.label.split(' ')[0]}:</strong> {viewer.description}
                  </p>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="filters-action-row flex items-center justify-between pt-4 border-t border-gray-300">
              <Button onClick={handleClearAll} variant="outline">
                {t.filters.clearAll}
              </Button>
              <Button onClick={() => setIsPanelOpen(false)} variant="primary">
                {t.filters.applyFilters}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UnifiedFilters
