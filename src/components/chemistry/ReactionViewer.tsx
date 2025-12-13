import type { Reaction } from '@/types/chemistry'
import type { Molecule } from '@/types/molecule-model'
import { useState, useEffect, useRef } from 'react'
import RDKitMoleculeViewer from './RDKitMoleculeViewer'
import MoleculeViewer from './MoleculeViewer'
import SimpleMoleculeViewer from './SimpleMoleculeViewer'
import KetcherMoleculeViewer from './KetcherMoleculeViewer'
import Molecule3DViewer from './Molecule3DViewer'
import Card from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import ReactionDoubleArrow from '@/assets/icon/reaction-double-arow.svg'

interface ReactionViewerProps {
  reaction: Reaction
  viewerType?: 'rdkit' | 'kekule' | 'simple' | 'ketcher' | '3dmol'
  isBuilderMode?: boolean
  availableMolecules?: Molecule[]
  onReactionChange?: (reaction: Reaction) => void
}

function ReactionViewer({ 
  reaction, 
  viewerType = 'rdkit',
  isBuilderMode = false,
  availableMolecules = [],
  onReactionChange
}: ReactionViewerProps) {
  const reactantsRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(160)

  // Helper function to extract SMILES from compound (supports both old and new formats)
  const getSmiles = (compound: any): string => {
    if (!compound) return ''
    // BioblioReaction format: smiles at top level
    if (compound.smiles) return compound.smiles
    // Old format: structure.smiles
    if (compound.structure?.smiles) return compound.structure.smiles
    return ''
  }

  // Helper function to extract name from compound (supports both old and new formats)
  const getName = (compound: any): string => {
    if (!compound) return ''
    // BioblioReaction format: simple name
    if (compound.name) return compound.name
    // Old format: names.common[0] or names.iupac
    if (compound.names) {
      if (Array.isArray(compound.names)) {
        const commonName = compound.names.find((n: any) => n.type === 'common')
        const iupacName = compound.names.find((n: any) => n.type === 'iupac')
        return commonName?.value || iupacName?.value || ''
      }
      if (typeof compound.names === 'object') {
        return compound.names.common?.[0] || compound.names.iupac || ''
      }
    }
    return ''
  }

  const handleReagentChange = (type: 'reactant' | 'product', index: number, moleculeId: string) => {
    if (!onReactionChange || !availableMolecules) return

    const selectedMolecule = availableMolecules.find(m => m.id === moleculeId)
    if (!selectedMolecule) return

    const newReaction = { ...reaction }
    // Deep copy arrays to avoid mutation
    if (type === 'reactant') {
      newReaction.reactants = reaction.reactants.map((r, i) => 
        i === index ? { ...r, compound: selectedMolecule } : r
      )
    } else {
      newReaction.products = reaction.products.map((p, i) => 
        i === index ? { ...p, compound: selectedMolecule } : p
      )
    }
    
    onReactionChange(newReaction)
  }

  const MolViewer =
    viewerType === 'rdkit' ? RDKitMoleculeViewer :
      viewerType === 'kekule' ? MoleculeViewer :
        viewerType === 'ketcher' ? KetcherMoleculeViewer :
          viewerType === '3dmol' ? Molecule3DViewer :
            SimpleMoleculeViewer

  // Measure the actual width of the reactants container
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const measureWidth = () => {
      if (reactantsRef.current) {
        const width = reactantsRef.current.offsetWidth
        setContainerWidth(width > 0 ? width : 160)
      }
    }

    const debouncedMeasureWidth = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(measureWidth, 300)
    }

    // Initial measurement
    measureWidth()

    // Create ResizeObserver to track container size changes
    const resizeObserver = new ResizeObserver(debouncedMeasureWidth)
    if (reactantsRef.current) {
      resizeObserver.observe(reactantsRef.current)
    }

    // Also listen to window resize
    window.addEventListener('resize', debouncedMeasureWidth)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', debouncedMeasureWidth)
    }
  }, [])

  // Calculate molecule dimensions based on container width and viewer type
  /* const getMoleculeDimensions = () => {
    const baseWidth = Math.round(containerWidth) // Ensure integer
    let height: number

    // Calculate height based on aspect ratio
    // For most viewers, use 3:4 aspect ratio (height is 75% of width)
    height = Math.round(baseWidth * 0.75) // Ensure integer

    // Adjust dimensions based on viewer type
    switch (viewerType) {
      case '3dmol':
        // 3D viewer needs square aspect ratio for better interaction
        return {
          width: baseWidth,
          height: baseWidth // Square for 3D rotation
        }
      case 'ketcher':
        // Ketcher needs more height for better molecule display
        return {
          width: baseWidth,
          height: Math.round(baseWidth * 0.85) // Ensure integer
        }
      case 'rdkit':
        // RDKit works well with standard dimensions
        return {
          width: Math.round(baseWidth * 0.60),
          height: Math.round(baseWidth * 0.40),
        }
      case 'kekule':
      case 'simple':
      default:
        // Other viewers use standard aspect ratio
        return {
          width: baseWidth,
          height: height
        }
    }
  }

  const { width: moleculeWidth, height: moleculeHeight } = getMoleculeDimensions() */

  const renderMolecule = (smiles: string, className: string) => {
    // Add bondLength prop for RDKitMoleculeViewer to ensure consistent molecule sizes
    const bondLength = 40 // Consistent bond size for all molecules in reactions

    // Wrapper to make viewer fill parent container
    const wrapperStyle = {
      width: '100%',
      height: 'auto',
      // aspectRatio: viewerType === '3dmol' ? '1 / 1' : '4 / 3', // Square for 3D, 4:3 for others
      // maxWidth: `${moleculeWidth}px`,
      margin: 'auto'
    }

    if (viewerType === 'rdkit') {
      return (
        <div style={wrapperStyle}>
          <RDKitMoleculeViewer
            smiles={smiles}
            width="100%"
            height="auto"
            className={className}
            bondLength={bondLength}
          />
        </div>
      )
    }

    if (viewerType === '3dmol') {
      return (
        <div style={wrapperStyle}>
          <Molecule3DViewer
            smiles={smiles}
            width="100%"
            height="auto"
            className={className}
            spin={false} // Disable auto-spin in reaction view for better UX
          />
        </div>
      )
    }

    // Fallback for other viewers that might need explicit dimensions
    // We use the containerWidth tracked by ResizeObserver in this component
    // This is a legacy path for viewers not yet updated to handle dynamic sizing
    const fallbackWidth = Math.round(containerWidth) || 200
    const fallbackHeight = Math.round(fallbackWidth * 0.75)

    return (
      <div style={wrapperStyle}>
        <MolViewer 
          smiles={smiles} 
          width={fallbackWidth} 
          height={fallbackHeight} 
          className={className} 
        />
      </div>
    )
  }

  return (
    <Card className="reaction-viewer-card max-w-full p-0 overflow-hidden relative z-10 shadow-none border-0">
      {/* Reaction Scheme */}
      <div className="reaction-scheme flex items-start justify-between sm:gap-2 md:gap-3 sm:my-3 relative z-10">
        {/* Reactants */}
        <div ref={reactantsRef} className="reactants-section flex-1 min-w-0 relative z-10">
          {/* <h4 className="reactants-title text-xs text-center font-semibold text-gray-700 mt-1 sm:mt-2">Reactants</h4> */}
          <div className="reactants-list space-y-1 sm:space-y-2">
            {reaction.reactants.map((reagent, idx) => (
              <div key={idx} className="reactant-item mb-4 text-center">
                {renderMolecule(
                  getSmiles(reagent.compound),
                  "reactant-molecule"
                )}
                {isBuilderMode ? (
                  <div className="mt-1 px-1 min-w-[120px]">
                    <Combobox
                      options={availableMolecules.map(m => ({ 
                        value: m.id, 
                        label: getName(m),
                        description: m.structure?.molecularFormula || ''
                      }))}
                      value={reagent.compound?.id || ''}
                      onValueChange={(val) => handleReagentChange('reactant', idx, val)}
                      className="w-full text-xs"
                      placeholder="Select..."
                    />
                  </div>
                ) : (
                  <p className="reactant-name relative text-xs mb-0.5 sm:mb-1 font-medium truncate px-1"
                  style={{
                  }}>{getName(reagent.compound)}</p>
                )}
                {reagent.conditions && (
                  <p className="reactant-conditions text-xs text-gray-500 truncate px-1">{reagent.conditions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="reaction-arrow-section flex flex-col items-center h-full justify-center flex-shrink-0 relative z-10"
          style={{
            position: 'absolute',
            width: '100%',
            zIndex: 20,
            pointerEvents: 'none',
            backgroundColor: 'transparent', // Transparent background
          }}>
          <img 
            src={ReactionDoubleArrow}
            alt="reaction arrow"
            className="reaction-arrow xs:w-6 w-8 h-6 sm:w-12 sm:h-8 md:w-16 md:h-10"
          />
          {reaction.conditions && reaction.conditions.length > 0 && (
            <div className="reaction-conditions-label text-center max-w-[60px] sm:max-w-[70px] md:max-w-[80px]">
              {reaction.conditions.slice(0, 2).map((cond, idx) => (
                <div key={idx} className="condition-text text-gray-600 text-[10px] sm:text-xs">{cond}</div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="products-section flex-1 min-w-0 relative z-10">
          {/* <h4 className="products-title text-xs text-center  font-semibold text-gray-700 mt-1 sm:mb-2">Products</h4> */}
          <div className="products-list space-y-1 sm:space-y-2">
            {reaction.products.map((reagent, idx) => (
              <div key={idx} className="product-item mb-4 text-center">
                {renderMolecule(
                  getSmiles(reagent.compound),
                  "product-molecule"
                )}
                {isBuilderMode ? (
                  <div className="mt-1 px-1 min-w-[120px]">
                    <Combobox
                      options={availableMolecules.map(m => ({ 
                        value: m.id, 
                        label: getName(m),
                        description: m.structure?.molecularFormula || ''
                      }))}
                      value={reagent.compound?.id || ''}
                      onValueChange={(val) => handleReagentChange('product', idx, val)}
                      className="w-full text-xs"
                      placeholder="Select..."
                    />
                  </div>
                ) : (
                  <p className="product-name relative text-xs font-medium truncate px-1"
                  style={{
                  }}>{getName(reagent.compound)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {
        (reaction.temperature || (reaction.solvents && reaction.solvents.length > 0) || reaction.yield) && (
          <div className="reaction-conditions-section mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
            <h4 className="conditions-section-title text-xs font-semibold text-gray-700 mb-1 sm:mb-2">Conditions</h4>
            <div className="conditions-grid grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs">
              {reaction.temperature && (
                <div className="temperature-item truncate">
                  <span className="temperature-label text-gray-600">Temp:</span>
                  <span className="temperature-value ml-1 font-medium">{reaction.temperature}</span>
                </div>
              )}
              {reaction.solvents && reaction.solvents.length > 0 && (
                <div className="solvent-item truncate">
                  <span className="solvent-label text-gray-600">Solvent:</span>
                  <span className="solvent-value ml-1 font-medium">
                    {reaction.solvents.map(s => getName(s.compound)).filter(Boolean).join(', ')}
                  </span>
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
        )
      }

      {/* SMARTS Pattern */}
      {
        reaction.smarts && (
          <div className="smarts-section mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
            <h4 className="smarts-title text-xs font-semibold text-gray-700 mb-1">SMARTS</h4>
            <code className="smarts-code block p-1 sm:p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto whitespace-nowrap">
              {reaction.smarts}
            </code>
          </div>
        )
      }
    </Card >
  )
}

export default ReactionViewer
