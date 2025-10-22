import { useEffect, useRef, useState } from 'react'

// Kekule.js types declaration
declare global {
  interface Window {
    Kekule: any
  }
}

interface MoleculeViewerProps {
  smiles: string
  width?: number
  height?: number
  className?: string
}

// Track if Kekule is loaded globally
let kekuleLoaded = false
let kekuleLoadPromise: Promise<void> | null = null

function MoleculeViewer({ smiles, width = 300, height = 200, className = '' }: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadKekule = async () => {
      // If Kekule is already loaded, use it
      if (window.Kekule) {
        kekuleLoaded = true
        return
      }

      // If loading is in progress, wait for it
      if (kekuleLoadPromise) {
        await kekuleLoadPromise
        return
      }

      // Start loading
      kekuleLoadPromise = new Promise((resolve, reject) => {
        try {
          // Add CSS
          if (!document.querySelector('link[href*="kekule.css"]')) {
            const kekuleStyleLink = document.createElement('link')
            kekuleStyleLink.rel = 'stylesheet'
            kekuleStyleLink.href = 'https://unpkg.com/kekule/dist/themes/default/kekule.css'
            document.head.appendChild(kekuleStyleLink)
          }

          // Add JS
          if (!document.querySelector('script[src*="kekule"]')) {
            const kekuleScript = document.createElement('script')
            kekuleScript.src = 'https://unpkg.com/kekule/dist/kekule.min.js'
            kekuleScript.onload = () => {
              kekuleLoaded = true
              resolve()
            }
            kekuleScript.onerror = () => reject(new Error('Failed to load Kekule.js'))
            document.body.appendChild(kekuleScript)
          } else {
            resolve()
          }
        } catch (err) {
          reject(err)
        }
      })

      await kekuleLoadPromise
    }

    const renderMolecule = async () => {
      try {
        console.log('[MoleculeViewer] Starting render for SMILES:', smiles)
        setIsLoading(true)
        setError(null)

        // Load Kekule if needed
        await loadKekule()
        console.log('[MoleculeViewer] Kekule loaded:', !!window.Kekule)

        if (!mounted || !containerRef.current) return

        // Wait a bit for Kekule to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100))

        if (!window.Kekule) {
          throw new Error('Kekule.js not loaded')
        }

        const Kekule = window.Kekule
        console.log('[MoleculeViewer] Kekule object:', Object.keys(Kekule))

        // Clean up previous viewer
        if (viewerRef.current) {
          try {
            viewerRef.current.finalize()
          } catch (e) {
            // Ignore
          }
          viewerRef.current = null
        }

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        // Parse SMILES - use Kekule's SMILES reader directly
        let mol = null
        console.log('[MoleculeViewer] Kekule.IO:', Kekule.IO)
        console.log('[MoleculeViewer] Available readers:', Object.keys(Kekule.IO))
        
        try {
          // Check if SmilesReader exists
          if (!Kekule.IO.SmilesReader) {
            console.error('[MoleculeViewer] SmilesReader not found, trying loadFormatData')
            mol = Kekule.IO.loadFormatData(smiles, 'smi')
          } else {
            // Use the SMILES reader explicitly
            console.log('[MoleculeViewer] Using SmilesReader')
            const reader = new Kekule.IO.SmilesReader()
            mol = reader.readData(smiles)
          }
          console.log('[MoleculeViewer] Parsed molecule:', mol)
        } catch (e) {
          console.error('[MoleculeViewer] SMILES parsing error:', e)
          throw new Error(`Unable to parse SMILES: ${smiles}`)
        }

        if (!mol) {
          throw new Error('Failed to parse SMILES notation')
        }

        if (!mounted || !containerRef.current) return

        // Create viewer
        console.log('[MoleculeViewer] Creating viewer')
        const viewer = new Kekule.ChemWidget.Viewer(containerRef.current)
        viewer.setDimension(`${width}px`, `${height}px`)
        viewer.setChemObj(mol)
        viewer.setRenderType(Kekule.Render.RendererType.R2D)
        
        // Try to set display type, but don't fail if it doesn't work
        try {
          viewer.setMoleculeDisplayType(Kekule.Render.Molecule2DDisplayType.SKELETAL)
        } catch (e) {
          console.warn('[MoleculeViewer] Could not set display type:', e)
        }

        viewerRef.current = viewer
        console.log('[MoleculeViewer] Render complete!')
        setIsLoading(false)
      } catch (err) {
        console.error('Error rendering molecule:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render molecule')
          setIsLoading(false)
        }
      }
    }

    renderMolecule()

    return () => {
      mounted = false
      if (viewerRef.current) {
        try {
          viewerRef.current.finalize()
        } catch (e) {
          // Ignore cleanup errors
        }
        viewerRef.current = null
      }
    }
  }, [smiles, width, height])

  return (
    <div 
      className={`kekule-molecule-viewer ${className}`}
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
        <div className="kekule-loading text-gray-400 text-sm">Loading...</div>
      )}
      {error && (
        <div className="kekule-error text-red-500 text-xs p-2 text-center">
          <div className="error-title font-semibold mb-1">Unable to render</div>
          <div className="error-smiles text-xs opacity-75">{smiles}</div>
        </div>
      )}
      <div 
        ref={containerRef}
        className="kekule-container"
        style={{
          width: '100%',
          height: '100%',
          display: error ? 'none' : 'block'
        }}
      />
    </div>
  )
}

export default MoleculeViewer
