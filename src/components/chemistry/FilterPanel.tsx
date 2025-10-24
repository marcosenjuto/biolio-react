import Combobox from '@/components/ui/Combobox'
import Button from '@/components/ui/Button'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  selectedFunctionalGroup: string
  viewerType: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'
  onCategoryChange: (value: string) => void
  onFunctionalGroupChange: (value: string) => void
  onViewerTypeChange: (value: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol') => void
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
              <Combobox
                options={reactionCategories.map(cat => ({ value: cat.id, label: cat.name }))}
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
                options={functionalGroups.map(group => ({ value: group.id, label: group.name }))}
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
                options={[
                  { value: 'rdkit', label: 'RDKit (Recommended)' },
                  { value: '3dmol', label: '3Dmol.js (3D Interactive)' },
/*                   { value: 'ketcher', label: 'Ketcher (Editor)' },
                  { value: 'kekule', label: 'Kekule.js (Limited)' }, */
                  { value: 'simple', label: 'Simple Canvas' }
                ]}
                value={viewerType}
                onValueChange={(value) => onViewerTypeChange(value as 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol')}
                placeholder="Select viewer..."
                searchPlaceholder="Search viewers..."
              />
              <p className="text-xs text-gray-500 mt-2">
                <strong>RDKit:</strong> Best for accurate 2D SMILES rendering.<br/>
                <strong>3Dmol.js:</strong> Interactive 3D molecular structures with rotation.<br/>
                {/* <strong>Ketcher:</strong> Full molecule editor (heavy, use sparingly).<br/> */}
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
