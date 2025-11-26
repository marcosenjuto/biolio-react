import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'

// 3Dmol.js types
declare global {
  interface Window {
    $3Dmol: any
  }
}

interface Protein3DViewerProps {
  pdbId?: string // PDB ID like "1UBQ"
  pdbData?: string // Raw PDB file content
  width?: number
  height?: number
  className?: string
  style?: 'cartoon' | 'stick' | 'sphere' | 'line' | 'cross'
  colorScheme?: 'spectrum' | 'chain' | 'secondary' | 'amino' | 'shapely' | 'singleColor'
  spin?: boolean
  spinSpeed?: number
  showSurface?: boolean
  backgroundColor?: string
}

let mol3dLoadPromise: Promise<void> | null = null

function Protein3DViewer({
  pdbId,
  pdbData,
  width = 600,
  height = 600,
  className = '',
  style = 'cartoon',
  colorScheme = 'spectrum',
  spin = false,
  spinSpeed = 0.5,
  showSurface = false,
  backgroundColor = '0xffffff'
}: Protein3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStyle, setCurrentStyle] = useState(style)
  const [currentColorScheme, setCurrentColorScheme] = useState(colorScheme)
  const [showingSurface, setShowingSurface] = useState(showSurface)
  const [spinning, setSpinning] = useState(spin)

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
        console.log('[Protein3D] Loading 3Dmol.js')

        const script = document.createElement('script')
        script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js'
        script.async = true

        script.onload = () => {
          console.log('[Protein3D] Library loaded')
          resolve()
        }

        script.onerror = (err) => {
          console.error('[Protein3D] Failed to load:', err)
          reject(new Error('Failed to load 3Dmol.js'))
        }

        document.body.appendChild(script)
      } catch (err) {
        reject(err)
      }
    })

    await mol3dLoadPromise
  }

  const fetchPDBData = async (id: string): Promise<string> => {
    try {
      console.log('[Protein3D] Fetching PDB data for:', id)
      
      // Check localStorage cache
      const cacheKey = `pdb_${id.toLowerCase()}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        console.log('[Protein3D] Using cached PDB data for', id)
        return cached
      }

      const url = `https://files.rcsb.org/download/${id.toUpperCase()}.pdb`
      console.log('[Protein3D] Fetching from:', url)
      
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`PDB fetch failed: ${response.status}`)
      }

      const pdbText = await response.text()
      
      if (!pdbText || pdbText.length < 100) {
        throw new Error('Invalid PDB data received')
      }

      console.log('[Protein3D] Successfully fetched PDB data')
      
      // Cache in localStorage
      try {
        localStorage.setItem(cacheKey, pdbText)
        console.log('[Protein3D] Cached PDB data for', id)
      } catch (e) {
        console.warn('[Protein3D] Failed to cache PDB:', e)
      }
      
      return pdbText
    } catch (err) {
      console.error('[Protein3D] PDB fetch error:', err)
      throw err
    }
  }

  const applyStyle = (viewer: any, styleName: string, colorSchemeName: string) => {
    viewer.setStyle({}, {}) // Clear styles

    const colorSchemeConfig = colorSchemeName === 'singleColor' 
      ? { color: 'spectrum' } 
      : { colorscheme: colorSchemeName }

    switch (styleName) {
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { ...colorSchemeConfig, thickness: 0.5 } })
        break
      case 'stick':
        viewer.setStyle({}, { stick: { ...colorSchemeConfig, radius: 0.2 } })
        break
      case 'sphere':
        viewer.setStyle({}, { sphere: { ...colorSchemeConfig, scale: 0.3 } })
        break
      case 'line':
        viewer.setStyle({}, { line: { ...colorSchemeConfig } })
        break
      case 'cross':
        viewer.setStyle({}, { cross: { ...colorSchemeConfig, radius: 0.1 } })
        break
      default:
        viewer.setStyle({}, { cartoon: { ...colorSchemeConfig } })
    }

    if (showingSurface) {
      viewer.addSurface(window.$3Dmol.SurfaceType.VDW, { opacity: 0.7, color: 'white' })
    }

    viewer.render()
  }

  useEffect(() => {
    let mounted = true
    let animationId: number

    const renderProtein = async () => {
      try {
        console.log('[Protein3D] Starting render')
        setIsLoading(true)
        setError(null)

        await load3Dmol()

        if (!mounted || !containerRef.current) return

        await new Promise(resolve => setTimeout(resolve, 100))

        if (!window.$3Dmol) {
          throw new Error('3Dmol.js not loaded')
        }

        // Get PDB data
        let proteinData = pdbData
        
        if (!proteinData && pdbId) {
          console.log('[Protein3D] Fetching PDB by ID:', pdbId)
          proteinData = await fetchPDBData(pdbId)
        }

        if (!proteinData) {
          throw new Error('No PDB data provided')
        }

        // Clear previous viewer
        if (viewerRef.current) {
          viewerRef.current.clear()
        }

        // Create 3Dmol viewer
        const config = {
          backgroundColor: backgroundColor,
          antialias: true
        }

        const viewer = window.$3Dmol.createViewer(containerRef.current, config)
        viewerRef.current = viewer

        // Add protein
        viewer.addModel(proteinData, 'pdb')
        
        // Apply style
        applyStyle(viewer, currentStyle, currentColorScheme)

        // Zoom to fit
        viewer.zoomTo()
        viewer.render()

        console.log('[Protein3D] Protein rendered successfully')

        // Spin animation
        if (spinning && mounted) {
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
        console.error('[Protein3D] Render error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render protein structure')
          setIsLoading(false)
        }
      }
    }

    renderProtein()

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
  }, [pdbId, pdbData, backgroundColor])

  useEffect(() => {
    if (viewerRef.current) {
      applyStyle(viewerRef.current, currentStyle, currentColorScheme)
    }
  }, [currentStyle, currentColorScheme, showingSurface])

  useEffect(() => {
    let animationId: number

    if (spinning && viewerRef.current) {
      const animate = () => {
        if (!viewerRef.current) return

        viewerRef.current.rotate(spinSpeed, 'y')
        viewerRef.current.render()
        animationId = requestAnimationFrame(animate)
      }

      animate()
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [spinning, spinSpeed])

  const handleStyleChange = (newStyle: string) => {
    setCurrentStyle(newStyle as typeof style)
  }

  const handleColorSchemeChange = (newScheme: string) => {
    setCurrentColorScheme(newScheme as typeof colorScheme)
  }

  const toggleSurface = () => {
    setShowingSurface(!showingSurface)
  }

  const toggleSpin = () => {
    setSpinning(!spinning)
  }

  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo()
      viewerRef.current.render()
    }
  }

  return (
    <div className={`protein-3d-viewer ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Style:</label>
          <select
            value={currentStyle}
            onChange={(e) => handleStyleChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            <option value="cartoon">Cartoon</option>
            <option value="stick">Stick</option>
            <option value="sphere">Sphere</option>
            <option value="line">Line</option>
            <option value="cross">Cross</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Color:</label>
          <select
            value={currentColorScheme}
            onChange={(e) => handleColorSchemeChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            <option value="spectrum">Spectrum</option>
            <option value="chain">Chain</option>
            <option value="secondary">Secondary Structure</option>
            <option value="amino">Amino Acid</option>
            <option value="shapely">Shapely</option>
          </select>
        </div>

        <Button
          onClick={toggleSurface}
          className="px-3 py-1 text-sm"
          disabled={isLoading}
        >
          {showingSurface ? 'Hide' : 'Show'} Surface
        </Button>

        <Button
          onClick={toggleSpin}
          className="px-3 py-1 text-sm"
          disabled={isLoading}
        >
          {spinning ? 'Stop' : 'Start'} Spin
        </Button>

        <Button
          onClick={resetView}
          className="px-3 py-1 text-sm"
          disabled={isLoading}
        >
          Reset View
        </Button>
      </div>

      {/* Viewer */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-gray-400 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <div>Loading protein structure...</div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-red-500 text-sm p-4 text-center max-w-md">
              <div className="font-semibold mb-2">Unable to render protein structure</div>
              <div className="text-xs mb-2">{error}</div>
              {pdbId && (
                <div className="text-xs opacity-75 font-mono">PDB ID: {pdbId}</div>
              )}
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            display: error ? 'none' : 'block'
          }}
        />
      </div>

      {/* Info */}
      {pdbId && !error && !isLoading && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <span className="font-medium">PDB ID:</span> {pdbId.toUpperCase()}
          <a
            href={`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 text-primary-600 hover:text-primary-700 underline"
          >
            View on RCSB PDB
          </a>
        </div>
      )}
    </div>
  )
}

export default Protein3DViewer
