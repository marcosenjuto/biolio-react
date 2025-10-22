import { useEffect, useRef, useState } from 'react'

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
}

// Track if RDKit is loaded globally
let rdkitModule: any = null
let rdkitLoadPromise: Promise<any> | null = null

function RDKitMoleculeViewer({ smiles, width = 300, height = 200, className = '' }: RDKitMoleculeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

        if (!mounted || !canvasRef.current) {
          console.log('[RDKit] Component unmounted or canvas not ready')
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

        // Generate SVG
        const svg = mol.get_svg_with_highlights(JSON.stringify({
          width: width,
          height: height,
        }))

        console.log('[RDKit] SVG generated, length:', svg.length)

        // Clean up molecule object
        mol.delete()

        if (!mounted || !canvasRef.current) return

        // Draw SVG to canvas
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        // Account for device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // Create image from SVG
        const img = new Image()
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          console.log('[RDKit] Drawing to canvas')
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          URL.revokeObjectURL(url)
          
          if (mounted) {
            setIsLoading(false)
            console.log('[RDKit] Render complete!')
          }
        }

        img.onerror = (err) => {
          console.error('[RDKit] Image load error:', err)
          URL.revokeObjectURL(url)
          throw new Error('Failed to render SVG')
        }

        img.src = url

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
  }, [smiles, width, height])

  return (
    <div 
      className={`rdkit-molecule-viewer ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        backgroundColor: '#ffffff',
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
      <canvas 
        ref={canvasRef}
        className="rdkit-canvas"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: error ? 'none' : 'block'
        }}
      />
    </div>
  )
}

export default RDKitMoleculeViewer
