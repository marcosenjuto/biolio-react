import { useEffect, useState, useRef } from 'react'

// RDKit types declaration
declare global {
  interface Window {
    initRDKitModule: () => Promise<any>
    RDKitModule: any
  }
}

interface RDKitMoleculeViewerProps {
  smiles: string
  width?: number | string
  height?: number | string
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
  bondLength = 35 // Consistent bond size (adjust as needed: 30-50)
}: RDKitMoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [svgContent, setSvgContent] = useState<string>('')
  const [measuredDimensions, setMeasuredDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (typeof width === 'number' && typeof height === 'number') {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>

    const measureDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        // Apply the scaling logic that was previously in ReactionViewer
        // RDKit works well with standard dimensions (approx 60% width, 40% height of container)
        const calculatedWidth = Math.round(w * 0.60)
        const calculatedHeight = Math.round(w * 0.40)
        
        // If height is provided as prop, use it, otherwise use calculated height
        const h = typeof height === 'number' ? height : calculatedHeight
        
        setMeasuredDimensions({ width: calculatedWidth, height: h })
      }
    }

    const debouncedMeasure = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(measureDimensions, 300)
    }

    // Initial measurement
    measureDimensions()

    const resizeObserver = new ResizeObserver(debouncedMeasure)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', debouncedMeasure)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', debouncedMeasure)
    }
  }, [width, height])

  useEffect(() => {
    let mounted = true

    const loadRDKit = async () => {
      // console.log('[RDKit] Starting to load RDKit')

      // If RDKit is already loaded, use it
      if (rdkitModule) {
        // console.log('[RDKit] Already loaded')
        return rdkitModule
      }

      // If loading is in progress, wait for it
      if (rdkitLoadPromise) {
        // console.log('[RDKit] Load in progress, waiting...')
        return await rdkitLoadPromise
      }

      // Start loading
      rdkitLoadPromise = new Promise(async (resolve, reject) => {
        try {
          // Add RDKit script
          if (!document.querySelector('script[src*="RDKit_minimal"]')) {
            // console.log('[RDKit] Adding script tag')
            const rdkitScript = document.createElement('script')
            rdkitScript.src = 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js'
            rdkitScript.async = true

            rdkitScript.onload = async () => {
              // console.log('[RDKit] Script loaded, initializing module')
              try {
                if (window.initRDKitModule) {
                  rdkitModule = await window.initRDKitModule()
                  // console.log('[RDKit] Module initialized:', rdkitModule)
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
            // console.log('[RDKit] Using existing module')
            rdkitModule = window.RDKitModule
            resolve(rdkitModule)
          } else if (window.initRDKitModule) {
            // console.log('[RDKit] Initializing existing init function')
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
        // console.log('[RDKit] Starting render for SMILES:', smiles)
        setIsLoading(true)
        setError(null)

        // Load RDKit if needed
        const RDKit = await loadRDKit()
        // console.log('[RDKit] Module ready:', !!RDKit)

        if (!mounted) {
          // console.log('[RDKit] Component unmounted')
          return
        }

        // Parse SMILES
        // console.log('[RDKit] Parsing SMILES...')
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

        // console.log('[RDKit] Molecule parsed successfully')

        // Determine dimensions to use for generation
        // Use -1 to let RDKit calculate dimensions based on bondLength
        // This ensures consistent bond sizes across different molecules
        const renderWidth = -1
        const renderHeight = -1
        
        // Use a slightly larger bond length for the natural size mode to avoid "tiny" molecules
        // If the prop is the default 35, we bump it up to 50 for better visibility
        const effectiveBondLength = bondLength === 35 ? 50 : bondLength

        // Generate SVG with consistent bond sizes and custom atom colors
        const drawingOptions = {
          width: renderWidth,
          height: renderHeight,
          bondLineWidth: 2,
          bondLength: effectiveBondLength,
          addAtomIndices: false,
          addStereoAnnotation: true,
          // fixedScale: 0.3, // Use fixed scale instead of fixedBondLength
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

        // console.log('[RDKit] SVG generated, length:', svg.length)

        // Clean up molecule object
        mol.delete()

        if (!mounted) return

        // Replace black carbon bonds with gray-900
        let modifiedSvg = svg.replace(/#000000/g, '#111827')

        // Remove the background rect that makes the SVG larger than needed
        modifiedSvg = modifiedSvg.replace(/<rect\s+style='opacity:1\.0;fill:#FFFFFF;stroke:none'[^>]*><\/rect>/, '')

        // Set SVG content directly
        setSvgContent(modifiedSvg)
        setIsLoading(false)
        // console.log('[RDKit] Render complete!')

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
  }, [smiles, width, height, bondLength, measuredDimensions])

  return (
    <div
      ref={containerRef}
      className={`rdkit-molecule-viewer ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : (measuredDimensions ? `${measuredDimensions.height}px` : height),
        maxWidth: typeof width === 'number' ? `${width}px` : '100%',
        maxHeight: typeof height === 'number' ? `${height}px` : '100%',
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
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
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
