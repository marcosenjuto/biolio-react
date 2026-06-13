import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChemistryStore } from '@/store/chemistryStore'
import type { Molecule } from '@/types/molecule-model'
import moleculesData from '@/data/molecules.json'
import ExpandableReactionCard from '@/components/chemistry/ExpandableReactionCard'
import UnifiedFilters from '@/components/chemistry/UnifiedFilters'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FunctionalGroupsList from '@/components/chemistry/FunctionalGroupsList'
import UnifiedMoleculeViewer from '@/components/chemistry/UnifiedMoleculeViewer'

import { useLanguageStore } from '@/store/languageStore'

function LibraryPage() {
  const { t } = useLanguageStore()
  const navigate = useNavigate()
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
  const [showReactions, setShowReactions] = useState(true)
  const [showFunctionalGroups, setShowFunctionalGroups] = useState(false)
  const [showMolecules, setShowMolecules] = useState(false)

  const allMolecules = moleculesData as Molecule[]

  // Filter molecules based on search term and functional group
  const filteredMolecules = allMolecules.filter(molecule => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()

      // Search in names
      const nameMatch = molecule.names?.some(name =>
        name.value.toLowerCase().includes(searchLower)
      )

      // Search in molecular formula
      const formulaMatch = molecule.structure?.molecularFormula?.toLowerCase().includes(searchLower)

      // Search in SMILES
      const smilesMatch = molecule.structure?.smiles?.toLowerCase().includes(searchLower)

      // Search in CID
      const cidMatch = molecule.cid?.toString().includes(searchTerm)

      if (!nameMatch && !formulaMatch && !smilesMatch && !cidMatch) {
        return false
      }
    }

    // Functional group filter
    if (selectedFunctionalGroup !== 'all') {
      if (!molecule.functionalGroups || molecule.functionalGroups.length === 0) {
        return false
      }

      const hasFunctionalGroup = molecule.functionalGroups.some(fg => {
        if (typeof fg === 'string') {
          return fg === selectedFunctionalGroup
        }
        return fg.id === selectedFunctionalGroup
      })

      if (!hasFunctionalGroup) {
        return false
      }
    }

    return true
  })

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
    <div className="library-page page bg-gray-50">
      <div className="library-container max-w-full w-full absolute mx-auto">
        {/* Header */}
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

        {/* <div className="spacer-100 h-28"></div> */}

        <div className="library-header mb-2 px-2">
          <h1 className="library-title text-4xl font-bold text-gray-900 mb-2">
            {t.library.title}
          </h1>
          {/*           <p className="library-subtitle text-lg text-gray-600">
            {t.library.subtitle}
          </p> */}
        </div>

        {/* Functional Groups Section */}
        <div className="mb-2 px-2">
          <div
            className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-200 sticky top-[48px] z-30 bg-gray-50"
            onClick={() => setShowFunctionalGroups(!showFunctionalGroups)}
          >
            <h2 className="text-xl font-bold text-gray-800">{t.library.functionalGroups}</h2>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${showFunctionalGroups ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className={showFunctionalGroups ? 'block' : 'h-0 overflow-hidden invisible'}>
            <FunctionalGroupsList
              className="mb-8"
              searchTerm={searchTerm}
              selectedGroupId={selectedFunctionalGroup}
              onSelectGroup={(id) => setSelectedFunctionalGroup(id === selectedFunctionalGroup ? 'all' : id)}
            />
          </div>
        </div>

        {/* Molecules Section */}
        <div className="mb-2 px-2">
          <div
            className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-200 sticky top-[48px] z-30 bg-gray-50"
            onClick={() => setShowMolecules(!showMolecules)}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">{t.library.molecules}</h2>
              <span className="text-sm text-gray-500 font-normal">
                ({filteredMolecules.length} {filteredMolecules.length !== 1 ? t.library.molecules_plural : t.library.molecule})
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${showMolecules ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className={showMolecules ? 'block' : 'hidden'}>
            {filteredMolecules.length > 0 ? (
              <div className="molecules-grid grid xxs:grid-cols-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
                {filteredMolecules.map((molecule) => {
                  const primaryName = molecule.names?.find(n => n.type === 'iupac')?.value ||
                    molecule.names?.find(n => n.type === 'common')?.value ||
                    molecule.id

                  return (
                    <Card
                      key={molecule.id}
                      className="molecule-card cursor-pointer text-center hover:shadow-lg transition-shadow"

                    >
                      <div className="pt-2">
                        <div className="molecule-viewer-container text-center rounded flex items-center justify-center" >
                          <UnifiedMoleculeViewer
                            smiles={molecule.structure?.smiles || ''}
                            sdfData={molecule.structure?.structure3D?.data}
                            width="100%"
                            height="auto"
                            viewerType={viewerType}
                            bondLength={40}
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 truncate" title={primaryName}
                          onClick={() => navigate(`/molecule/${molecule.id}`)}>
                          {primaryName}
                        </h3>
                        {molecule.structure?.molecularFormula && (
                          <p className="text-xs text-gray-500 font-mono">
                            {molecule.structure.molecularFormula}
                          </p>
                        )}
                        {molecule.molecular?.weight && (
                          <p className="text-xs text-gray-500">
                            {molecule.molecular.weight.toFixed(2)} g/mol
                          </p>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
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
                <h3 className="no-results-title mt-2 text-sm font-medium text-gray-900">{t.library.noMoleculesFound}</h3>
                <p className="no-results-message mt-1 text-sm text-gray-500">
                  {t.library.tryAdjustingMolecules}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reactions Section */}
        <div className="mb-2 px-2">
          <div
            className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-200 sticky top-[48px] z-30 bg-gray-50"
            onClick={() => setShowReactions(!showReactions)}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">{t.library.reactions}</h2>
              <span className="text-sm text-gray-500 font-normal">
                ({filteredReactions.length} {filteredReactions.length !== 1 ? t.library.reactions_plural : t.library.reaction})
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${showReactions ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className={showReactions ? 'block' : 'hidden'}>
            {/* Results Count */}
            {/*               <div className="results-count mb-4">
                <p className="count-text text-sm text-gray-600">
                  {searchTerm && `Searching for "${searchTerm}"`}
                  {searchTerm && selectedCategory !== 'all' && ' in '}
                  {selectedCategory !== 'all' && `${REACTION_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div> */}

            {/* Reactions Grid */}
            <div className="reactions-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                <h3 className="no-results-title mt-2 text-sm font-medium text-gray-900">{t.library.noReactionsFound}</h3>
                <p className="no-results-message mt-1 text-sm text-gray-500">
                  {t.library.tryAdjusting}
                </p>
                <div className="no-results-action mt-6">
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                    }}
                    className="clear-filters-button"
                  >
                    {t.common.clearFilters}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="spacer-100 h-28"></div>
        <div className="spacer-100 h-28"></div>

      </div>
    </div>
  )
}

export default LibraryPage
