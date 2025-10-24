import { Select, SelectItem } from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  selectedFunctionalGroup: string
  viewerType: 'rdkit' | 'kekule' | 'simple' | 'ketcher'
  onCategoryChange: (value: string) => void
  onFunctionalGroupChange: (value: string) => void
  onViewerTypeChange: (value: 'rdkit' | 'kekule' | 'simple' | 'ketcher') => void
  onClearFilters: () => void
  reactionCategories: Array<{ id: string; name: string }>
  functionalGroups: Array<{ id: string; name: string }>
}

function FilterPanel({
  isOpen,
  onClose,
  selectedCategory,
  selectedFunctionalGroup,
  viewerType,
  onCategoryChange,
  onFunctionalGroupChange,
  onViewerTypeChange,
  onClearFilters,
  reactionCategories,
  functionalGroups,
}: FilterPanelProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-x-0 top-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full z-50 animate-slideUp">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl h-full sm:h-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">Filter Options</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-6 space-y-6">
            {/* Category Filter */}
            <div className="filter-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Reaction Category
              </label>
              <div className="relative">
                <Select
                  value={selectedCategory}
                  onValueChange={onCategoryChange}
                  style={{
                    width: '100%',
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
            </div>

            {/* Functional Group Filter */}
            <div className="filter-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Functional Group
              </label>
              <div className="relative">
                <Select
                  value={selectedFunctionalGroup}
                  onValueChange={onFunctionalGroupChange}
                  style={{
                    width: '100%',
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
            </div>

            {/* Viewer Type Selector */}
            <div className="filter-section">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Molecule Viewer
              </label>
              <div className="relative">
                <Select
                  value={viewerType}
                  onValueChange={(value) => onViewerTypeChange(value as 'rdkit' | 'kekule' | 'simple' | 'ketcher')}
                  style={{
                    width: '100%',
                    backgroundColor: 'white',
                    color: '#374151',
                    borderColor: '#d1d5db'
                  }}
                >
                  <SelectItem value="rdkit">RDKit (Recommended)</SelectItem>
                  <SelectItem value="ketcher">Ketcher (Interactive)</SelectItem>
                  <SelectItem value="kekule">Kekule.js (Limited SMILES)</SelectItem>
                  <SelectItem value="simple">Simple Canvas</SelectItem>
                </Select>
                <svg 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <strong>RDKit:</strong> Best for accurate SMILES rendering.<br/>
                <strong>Ketcher:</strong> Interactive viewer with full molecule editor.<br/>
                <strong>Kekule.js:</strong> Limited SMILES support, may fail on complex structures.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <Button
              onClick={onClearFilters}
              variant="outline"
            >
              Clear All
            </Button>
            <Button
              onClick={onClose}
              variant="primary"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FilterPanel
