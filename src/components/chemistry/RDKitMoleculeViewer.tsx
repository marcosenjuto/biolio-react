import { useEffect, useState } from 'react'

// RDKit types declaration
declare global {
  interface Window {
    initRDKitModule: () => Promise<any>
    RDKitModule: any
  }
}

interface RDKitMoleculeViewerProps {
  smiles: string
  width?: number
  height?: number
  className?: string
  bondLength?: number // Fixed bond length for consistent molecule sizes
}

// Track if RDKit is loaded globally
let rdkitModule: any = null
let rdkitLoadPromise: Promise<any> | null = null

function RDKitMoleculeViewer({ 
  smiles, 
  width = 300, 
  height = 200, 
  className = '',
  bondLength = 40 // Consistent bond size (adjust as needed: 30-50)
}: RDKitMoleculeViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [svgContent, setSvgContent] = useState<string>('')

  useEffect(() => {
    let mounted = true

    const loadRDKit = async () => {
      console.log('[RDKit] Starting to load RDKit')
      
      // If RDKit is already loaded, use it
      if (rdkitModule) {
        console.log('[RDKit] Already loaded')
        return rdkitModule
      }

      // If loading is in progress, wait for it
      if (rdkitLoadPromise) {
        console.log('[RDKit] Load in progress, waiting...')
        return await rdkitLoadPromise
      }

      // Start loading
      rdkitLoadPromise = new Promise(async (resolve, reject) => {
        try {
          // Add RDKit script
          if (!document.querySelector('script[src*="RDKit_minimal"]')) {
            console.log('[RDKit] Adding script tag')
            const rdkitScript = document.createElement('script')
            rdkitScript.src = 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js'
            rdkitScript.async = true
            
            rdkitScript.onload = async () => {
              console.log('[RDKit] Script loaded, initializing module')
              try {
                if (window.initRDKitModule) {
                  rdkitModule = await window.initRDKitModule()
                  console.log('[RDKit] Module initialized:', rdkitModule)
                  resolve(rdkitModule)
                } else {
                  throw new Error('initRDKitModule not found')
                }
              } catch (err) {
                console.error('[RDKit] Module initialization failed:', err)
                reject(err)
              }
            }
            
            rdkitScript.onerror = (err) => {
              console.error('[RDKit] Script load failed:', err)
              reject(new Error('Failed to load RDKit.js'))
            }
            
            document.body.appendChild(rdkitScript)
          } else if (window.RDKitModule) {
            console.log('[RDKit] Using existing module')
            rdkitModule = window.RDKitModule
            resolve(rdkitModule)
          } else if (window.initRDKitModule) {
            console.log('[RDKit] Initializing existing init function')
            rdkitModule = await window.initRDKitModule()
            resolve(rdkitModule)
          }
        } catch (err) {
          console.error('[RDKit] Load error:', err)
          reject(err)
        }
      })

      return await rdkitLoadPromise
    }

    const renderMolecule = async () => {
      try {
        console.log('[RDKit] Starting render for SMILES:', smiles)
        setIsLoading(true)
        setError(null)

        // Load RDKit if needed
        const RDKit = await loadRDKit()
        console.log('[RDKit] Module ready:', !!RDKit)

        if (!mounted) {
          console.log('[RDKit] Component unmounted')
          return
        }

        // Parse SMILES
        console.log('[RDKit] Parsing SMILES...')
        let mol
        try {
          mol = RDKit.get_mol(smiles)
        } catch (parseErr) {
          console.error('[RDKit] SMILES parse error:', parseErr)
          throw new Error(`Cannot parse SMILES: ${smiles}`)
        }
        
        if (!mol) {
          console.error('[RDKit] Null molecule returned')
          throw new Error(`Cannot create molecule from: ${smiles}`)
        }
        
        if (!mol.is_valid()) {
          console.error('[RDKit] Invalid molecule structure')
          mol.delete()
          throw new Error(`Invalid molecule structure: ${smiles}`)
        }

        console.log('[RDKit] Molecule parsed successfully')

        // Generate SVG with consistent bond sizes
        const svg = mol.get_svg_with_highlights(JSON.stringify({
          width: width,
          height: height,
          bondLineWidth: 2,
          addAtomIndices: false,
          addStereoAnnotation: true,
          fixedBondLength: bondLength, // All bonds will have this size for consistency
        }))

        console.log('[RDKit] SVG generated, length:', svg.length)

        // Clean up molecule object
        mol.delete()

        if (!mounted) return

        // Set SVG content directly
        setSvgContent(svg)
        setIsLoading(false)
        console.log('[RDKit] Render complete!')

      } catch (err) {
        console.error('[RDKit] Render error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render molecule')
          setIsLoading(false)
        }
      }
    }

    renderMolecule()

    return () => {
      mounted = false
    }
  }, [smiles, width, height, bondLength])

  return (
    <div 
      className={`rdkit-molecule-viewer ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        borderRadius: '0.375rem',
        backgroundColor: 'transparent', // Transparent background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '0',
        margin: '0 auto'
      }}
    >
      {isLoading && (
        <div className="rdkit-loading text-gray-400 text-sm absolute">Loading...</div>
      )}
      {error && (
        <div className="rdkit-error text-red-500 text-xs p-2 text-center absolute">
          <div className="error-title font-semibold mb-1">Unable to render</div>
          <div className="error-smiles text-xs opacity-75 font-mono">{smiles}</div>
        </div>
      )}
      {!error && svgContent && (
        <div 
          className="rdkit-svg"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      )}
    </div>
  )
}

export default RDKitMoleculeViewer
