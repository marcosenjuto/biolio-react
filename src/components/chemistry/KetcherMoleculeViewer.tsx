import { useEffect, useState, lazy, Suspense, useMemo } from 'react'
import type { Ketcher, StructServiceProvider } from 'ketcher-core'
import RDKitMoleculeViewer from './RDKitMoleculeViewer'

/**
 * KetcherMoleculeViewer - Full Ketcher chemical editor component
 * 
 * WARNING: Ketcher is a HEAVY editor component designed for editing, not viewing.
 * - Do NOT use this for displaying multiple molecules (e.g., in a list or grid)
 * - Use RDKitMoleculeViewer or SimpleMoleculeViewer for viewing multiple molecules
 * - Only use Ketcher when you need editing capabilities or for single molecule display
 * 
 * Having multiple Ketcher instances on the same page will cause:
 * - Performance degradation
 * - Initialization conflicts
 * - High memory usage
 */

// Lazy load Ketcher components to avoid loading issues
const KetcherEditor = lazy(() => 
  import('ketcher-react').then(module => {
    // Handle both named and default exports
    const EditorComponent = module.Editor || module.default?.Editor || module.default
    return { default: EditorComponent }
  })
)

// Dynamically import CSS
const loadKetcherCSS = async () => {
  try {
    await import('ketcher-react/dist/index.css')
  } catch (err) {
    console.warn('Failed to load Ketcher CSS:', err)
  }
}

interface KetcherMoleculeViewerProps {
  smiles: string
  width?: number
  height?: number
  className?: string
}

function KetcherMoleculeViewer({
  smiles,
  width = 600,
  height = 400,
  className = ''
}: KetcherMoleculeViewerProps) {
  const [structServiceProvider, setStructServiceProvider] = useState<StructServiceProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate a unique ID for this Ketcher instance
  const instanceId = useMemo(() => {
    // Create hash from SMILES + random ID
    const hash = smiles.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0)
    return `ketcher-${Math.abs(hash)}-${Math.random().toString(36).substr(2, 9)}`
  }, [smiles])

  // Initialize struct service provider and CSS
  useEffect(() => {
    const initProvider = async () => {
      try {
        console.log(`[Ketcher ${instanceId}] Initializing standalone service provider`)
        
        // Load CSS
        await loadKetcherCSS()
        
        // Dynamically import StandaloneStructServiceProvider
        const { StandaloneStructServiceProvider } = await import('ketcher-standalone')
        const provider = new StandaloneStructServiceProvider()
        setStructServiceProvider(provider as unknown as StructServiceProvider)
        setIsLoading(false)
        console.log(`[Ketcher ${instanceId}] Service provider initialized successfully`)
      } catch (err) {
        console.error(`[Ketcher ${instanceId}] Failed to initialize:`, err)
        setError(err instanceof Error ? err.message : 'Failed to initialize Ketcher')
        setIsLoading(false)
      }
    }
    
    initProvider()
  }, [instanceId])

  const handleInit = async (ketcherInstance: Ketcher) => {
    console.log(`[Ketcher ${instanceId}] Editor initialized for:`, smiles.substring(0, 20))
    
    // Load molecule immediately after initialization
    if (smiles) {
      try {
        console.log(`[Ketcher ${instanceId}] Loading SMILES:`, smiles.substring(0, 30) + '...')
        // Wait for Ketcher to be fully ready
        await new Promise(resolve => setTimeout(resolve, 300))
        await ketcherInstance.setMolecule(smiles)
        console.log(`[Ketcher ${instanceId}] Molecule loaded successfully`)
      } catch (err) {
        console.error(`[Ketcher ${instanceId}] Failed to load molecule:`, err)
        // Don't set error state, just log
      }
    }
  }

  const handleError = (message: string) => {
    console.error(`[Ketcher ${instanceId}] Error:`, message)
    // Don't set error for initialization issues, only for critical failures
    if (message.includes('Failed to initialize')) {
      setError(message)
    }
  }

  // Show error fallback
  if (error) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 bg-yellow-50 border border-yellow-200 text-yellow-800 px-2 py-1 text-xs z-10">
          Ketcher error: {error} - Usando visor alternativo
        </div>
        <div className="pt-8">
          <RDKitMoleculeViewer
            smiles={smiles}
            width={width}
            height={height - 32}
            className={className}
            bondLength={35}
          />
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading || !structServiceProvider) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-gray-500 text-sm">Cargando editor Ketcher...</div>
      </div>
    )
  }

  return (
    <div
      id={instanceId}
      className={`ketcher-molecule-viewer ketcher-readonly ${className} border border-gray-300 rounded-lg overflow-hidden relative`}
      style={{
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <style>{`
        #${instanceId} .Ketcher-root {
          /* Hide the toolbar for read-only mode */
        }
        #${instanceId} [class*="toolbar"] {
          display: none !important;
        }
        #${instanceId} [class*="TopToolbar"] {
          display: none !important;
        }
        #${instanceId} [class*="LeftToolbar"] {
          display: none !important;
        }
        #${instanceId} [class*="RightToolbar"] {
          display: none !important;
        }
        #${instanceId} .ketcher-canvas-editor {
          /* Make canvas non-interactive */
          pointer-events: none;
        }
      `}</style>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-sm">Cargando editor...</div>
        </div>
      }>
        <KetcherEditor
          staticResourcesUrl=""
          structServiceProvider={structServiceProvider}
          errorHandler={handleError}
          onInit={handleInit}
        />
      </Suspense>
    </div>
  )
}

export default KetcherMoleculeViewer
