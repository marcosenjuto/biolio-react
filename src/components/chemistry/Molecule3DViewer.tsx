import { useEffect, useRef, useState } from 'react'

// 3Dmol.js types
declare global {
  interface Window {
    $3Dmol: any
  }
}

interface Molecule3DViewerProps {
  smiles?: string
  molString?: string
  width?: number
  height?: number
  className?: string
  spin?: boolean
  spinSpeed?: number
}

// Global loading promise
let mol3dLoadPromise: Promise<void> | null = null

function Molecule3DViewer({ 
  smiles,
  molString,
  width = 400, 
  height = 400, 
  className = '',
  spin = true,
  spinSpeed = 0.1
}: Molecule3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let animationId: number

    const load3Dmol = async () => {
      if (window.$3Dmol) {
        return
      }

      if (mol3dLoadPromise) {
        await mol3dLoadPromise
        return
      }

      mol3dLoadPromise = new Promise((resolve, reject) => {
        try {
          console.log('[3DMol] Loading 3Dmol.js')
          
          const script = document.createElement('script')
          script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js'
          script.async = true
          
          script.onload = () => {
            console.log('[3DMol] Library loaded')
            resolve()
          }
          
          script.onerror = (err) => {
            console.error('[3DMol] Failed to load:', err)
            reject(new Error('Failed to load 3Dmol.js'))
          }
          
          document.body.appendChild(script)
        } catch (err) {
          reject(err)
        }
      })

      await mol3dLoadPromise
    }

    const convertSMILEStoMOL = async (smilesString: string): Promise<string> => {
      try {
        // Use PubChem to convert SMILES to 3D structure
        const response = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smilesString)}/SDF`,
          {
            method: 'GET',
            headers: {
              'Accept': 'chemical/x-mdl-sdfile'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to convert SMILES to 3D structure')
        }
        
        const sdfData = await response.text()
        return sdfData
      } catch (err) {
        console.error('[3DMol] SMILES conversion error:', err)
        throw err
      }
    }

    const renderMolecule = async () => {
      try {
        console.log('[3DMol] Starting render')
        setIsLoading(true)
        setError(null)

        await load3Dmol()

        if (!mounted || !containerRef.current) return

        // Wait for library to be ready
        await new Promise(resolve => setTimeout(resolve, 100))

        if (!window.$3Dmol) {
          throw new Error('3Dmol.js not loaded')
        }

        // Get or convert molecule data
        let moleculeData = molString
        if (!moleculeData && smiles) {
          console.log('[3DMol] Converting SMILES to MOL format...')
          moleculeData = await convertSMILEStoMOL(smiles)
        }

        if (!moleculeData) {
          throw new Error('No molecule data provided')
        }

        // Clear previous viewer
        if (viewerRef.current) {
          viewerRef.current.clear()
        }

        // Create 3Dmol viewer
        const config = { 
          backgroundColor: 'white',
          antialias: true
        }
        
        const viewer = window.$3Dmol.createViewer(containerRef.current, config)
        viewerRef.current = viewer

        // Add molecule
        viewer.addModel(moleculeData, 'sdf')
        viewer.setStyle({}, {
          stick: {
            colorscheme: 'default',
            radius: 0.15
          },
          sphere: {
            scale: 0.25,
            colorscheme: 'Jmol'
          }
        })
        
        viewer.zoomTo()
        viewer.render()

        console.log('[3DMol] Molecule rendered')

        // Spin animation
        if (spin && mounted) {
          const animate = () => {
            if (!mounted || !viewerRef.current) return
            
            viewer.rotate(spinSpeed, 'y')
            viewer.render()
            animationId = requestAnimationFrame(animate)
          }
          
          animate()
        }

        if (mounted) {
          setIsLoading(false)
        }

      } catch (err) {
        console.error('[3DMol] Render error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render 3D molecule')
          setIsLoading(false)
        }
      }
    }

    renderMolecule()

    return () => {
      mounted = false
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (viewerRef.current) {
        try {
          viewerRef.current.clear()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [smiles, molString, spin, spinSpeed])

  return (
    <div 
      className={`molecule-3d-viewer ${className}`}
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
        overflow: 'hidden'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-gray-400 text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              <div>Loading 3D structure...</div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-red-500 text-xs p-4 text-center max-w-xs">
            <div className="font-semibold mb-2">Unable to render 3D structure</div>
            <div className="text-xs mb-2">{error}</div>
            {smiles && (
              <div className="text-xs opacity-75 font-mono break-all">{smiles}</div>
            )}
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: error ? 'none' : 'block'
        }}
      />
    </div>
  )
}

export default Molecule3DViewer
