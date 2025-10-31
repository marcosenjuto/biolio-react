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
  const [svgDimensions, setSvgDimensions] = useState<{ width: number; height: number } | null>(null)

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

        // Generate SVG with consistent bond sizes and custom atom colors
        const drawingOptions = {
          width: width,
          height: height,
          bondLineWidth: 2,
          addAtomIndices: false,
          addStereoAnnotation: true,
          fixedScale: 0.3, // Use fixed scale instead of fixedBondLength
          scaleBondWidth: true,
          useBWAtomPalette: false, // Ensure we use color palette
          backgroundColour: [1.0, 1.0, 1.0, 0.0], // Transparent background (RGBA)
          // Custom atom colors (RGB values 0-1)
          atomColourPalette: {
            6: [0.067, 0.094, 0.153],  // Carbon: gray-900 (#111827)
            7: [0.0, 0.4, 0.8],         // Nitrogen: blue
            8: [0.8, 0.1, 0.1],         // Oxygen: red
            9: [0.0, 0.8, 0.0],         // Fluorine: green
            15: [1.0, 0.5, 0.0],        // Phosphorus: orange
            16: [0.8, 0.8, 0.0],        // Sulfur: yellow
            17: [0.0, 0.8, 0.0],        // Chlorine: green
            35: [0.5, 0.2, 0.0],        // Bromine: brown
            53: [0.5, 0.0, 0.5],        // Iodine: purple
          }
        }

        const svg = mol.get_svg_with_highlights(JSON.stringify(drawingOptions))

        console.log('[RDKit] SVG generated, length:', svg.length)

        // Clean up molecule object
        mol.delete()

        if (!mounted) return

        // Replace black carbon bonds with gray-900
        let modifiedSvg = svg.replace(/#000000/g, '#111827')
        
        // Remove the background rect that makes the SVG larger than needed
        modifiedSvg = modifiedSvg.replace(/<rect\s+style='opacity:1\.0;fill:#FFFFFF;stroke:none'[^>]*><\/rect>/, '')
        
        // Calculate actual bounding box from path elements
        const pathMatches = modifiedSvg.matchAll(/<path[^>]*\sd='([^']+)'/g)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        
        for (const match of pathMatches) {
          const pathData = match[1]
          // Extract all coordinate pairs from path data
          const coords = pathData.match(/[\d.]+/g)
          if (coords) {
            for (let i = 0; i < coords.length; i += 2) {
              const x = parseFloat(coords[i])
              const y = parseFloat(coords[i + 1])
              if (!isNaN(x) && !isNaN(y)) {
                minX = Math.min(minX, x)
                minY = Math.min(minY, y)
                maxX = Math.max(maxX, x)
                maxY = Math.max(maxY, y)
              }
            }
          }
        }
        
        // Also check text elements for atom labels
        const textMatches = modifiedSvg.matchAll(/<text[^>]*\sx='([\d.]+)'[^>]*\sy='([\d.]+)'/g)
        for (const match of textMatches) {
          const x = parseFloat(match[1])
          const y = parseFloat(match[2])
          if (!isNaN(x) && !isNaN(y)) {
            // Add padding for text size (approximate)
            minX = Math.min(minX, x - 10)
            minY = Math.min(minY, y - 10)
            maxX = Math.max(maxX, x + 10)
            maxY = Math.max(maxY, y + 10)
          }
        }
        
        if (minX !== Infinity && maxX !== -Infinity) {
          const contentWidth = maxX - minX + 20 // Add padding
          const contentHeight = maxY - minY + 20
          setSvgDimensions({ width: contentWidth, height: contentHeight })
          console.log('[RDKit] Calculated content dimensions:', contentWidth, 'x', contentHeight)
          
          // Update the viewBox to match the actual content
          modifiedSvg = modifiedSvg.replace(
            /viewBox='[\d.\s]+'/,
            `viewBox='${minX - 10} ${minY - 10} ${contentWidth} ${contentHeight}'`
          )
        }

        // Set SVG content directly
        setSvgContent(modifiedSvg)
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
        width: svgDimensions ? `${svgDimensions.width}px` : `${width}px`,
        height: svgDimensions ? `${svgDimensions.height}px` : `${height}px`,
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
        borderRadius: '0.375rem',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '0',
        margin: 'auto'
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
            width: '100%',
            height: '100%',
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
