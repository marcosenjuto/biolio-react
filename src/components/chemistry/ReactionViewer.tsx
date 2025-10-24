import { lazy, Suspense } from 'react'
import type { Reaction } from '@/types/chemistry'
import RDKitMoleculeViewer from './RDKitMoleculeViewer'
import MoleculeViewer from './MoleculeViewer'
import SimpleMoleculeViewer from './SimpleMoleculeViewer'
import Card from '@/components/ui/Card'

// Lazy load Ketcher to prevent blocking the app on initial load
const KetcherMoleculeViewer = lazy(() => import('./KetcherMoleculeViewer'))

interface ReactionViewerProps {
  reaction: Reaction
  viewerType?: 'rdkit' | 'kekule' | 'simple' | 'ketcher'
}

function ReactionViewer({ reaction, viewerType = 'rdkit' }: ReactionViewerProps) {

  const MolViewer = 
    viewerType === 'rdkit' ? RDKitMoleculeViewer :
    viewerType === 'kekule' ? MoleculeViewer :
    viewerType === 'ketcher' ? KetcherMoleculeViewer :
    SimpleMoleculeViewer
  
  const isKetcher = viewerType === 'ketcher'
  
  const renderMolecule = (smiles: string, width: number, height: number, className: string) => {
    const viewer = <MolViewer smiles={smiles} width={width} height={height} className={className} />
    
    if (isKetcher) {
      return (
        <Suspense fallback={<div className="flex items-center justify-center" style={{ width, height }}>Loading...</div>}>
          {viewer}
        </Suspense>
      )
    }
    
    return viewer
  }

  return (
    <Card className="reaction-viewer-card max-w-full overflow-hidden relative z-10 shadow-none border-0">
      {/* Reaction Scheme */}
      <div className="reaction-scheme flex items-center justify-between gap-1 sm:gap-2 md:gap-3 sm:my-3 relative z-10">
        {/* Reactants */}
        <div className="reactants-section flex-1 min-w-0 relative z-10">
          <h4 className="reactants-title text-xs font-semibold text-gray-700 mb-1 sm:mb-2">Reactants</h4>
          <div className="reactants-list space-y-1 sm:space-y-2">
            {reaction.reactants.map((reagent, idx) => (
              <div key={idx} className="reactant-item text-center">
                {renderMolecule(
                  reagent.compound.smiles,
                  window.innerWidth < 360 ? 80 : 140,
                  window.innerWidth < 360 ? 60 : 100,
                  "reactant-molecule mx-auto"
                )}
                <p className="reactant-name text-xs mt-0.5 sm:mt-1 font-medium truncate px-1">{reagent.compound.name}</p>
                {reagent.conditions && (
                  <p className="reactant-conditions text-xs text-gray-500 truncate px-1">{reagent.conditions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="reaction-arrow-section flex flex-col items-center justify-center flex-shrink-0 relative z-10">
          <svg 
            className="reaction-arrow w-8 h-4 sm:w-12 sm:h-6 md:w-16 md:h-8 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
          {reaction.conditions && reaction.conditions.length > 0 && (
            <div className="reaction-conditions-label text-xs text-center mt-0.5 sm:mt-1 max-w-[60px] sm:max-w-[70px] md:max-w-[80px]">
              {reaction.conditions.slice(0, 2).map((cond, idx) => (
                <div key={idx} className="condition-text text-gray-600 truncate text-[10px] sm:text-xs">{cond}</div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="products-section flex-1 min-w-0 relative z-10">
          <h4 className="products-title text-xs font-semibold text-gray-700 mb-1 sm:mb-2">Products</h4>
          <div className="products-list space-y-1 sm:space-y-2">
            {reaction.products.map((reagent, idx) => (
              <div key={idx} className="product-item text-center">
                {renderMolecule(
                  reagent.compound.smiles,
                  window.innerWidth < 360 ? 80 : 140,
                  window.innerWidth < 360 ? 60 : 100,
                  "product-molecule mx-auto"
                )}
                <p className="product-name text-xs mt-0.5 sm:mt-1 font-medium truncate px-1">{reagent.compound.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(reaction.temperature || reaction.solvent || reaction.yield) && (
        <div className="reaction-conditions-section mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
          <h4 className="conditions-section-title text-xs font-semibold text-gray-700 mb-1 sm:mb-2">Conditions</h4>
          <div className="conditions-grid grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs">
            {reaction.temperature && (
              <div className="temperature-item truncate">
                <span className="temperature-label text-gray-600">Temp:</span>
                <span className="temperature-value ml-1 font-medium">{reaction.temperature}</span>
              </div>
            )}
            {reaction.solvent && (
              <div className="solvent-item truncate">
                <span className="solvent-label text-gray-600">Solvent:</span>
                <span className="solvent-value ml-1 font-medium">{reaction.solvent}</span>
              </div>
            )}
            {reaction.yield && (
              <div className="yield-item truncate">
                <span className="yield-label text-gray-600">Yield:</span>
                <span className="yield-value ml-1 font-medium">{reaction.yield}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMARTS Pattern */}
      {reaction.smarts && (
        <div className="smarts-section mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
          <h4 className="smarts-title text-xs font-semibold text-gray-700 mb-1">SMARTS</h4>
          <code className="smarts-code block p-1 sm:p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto whitespace-nowrap">
            {reaction.smarts}
          </code>
        </div>
      )}
    </Card>
  )
}

export default ReactionViewer
