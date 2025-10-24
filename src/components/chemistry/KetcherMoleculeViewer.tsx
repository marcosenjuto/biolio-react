// Ketcher imports - temporarily disabled until static resources are properly configured
// import { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react'
// import { Editor as KetcherEditor } from 'ketcher-react'
// import { StandaloneStructServiceProvider } from 'ketcher-standalone'
// import 'ketcher-react/dist/index.css'
import RDKitMoleculeViewer from './RDKitMoleculeViewer'

interface KetcherMoleculeViewerProps {
  smiles: string
  width?: number
  height?: number
  className?: string
}

/* Ketcher implementation code - temporarily disabled until static resources are configured

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// Error boundary wrapper to catch Ketcher initialization errors
class KetcherErrorBoundary extends Component<
  { children: ReactNode; smiles: string; width: number; height: number; className: string },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[KetcherErrorBoundary] Caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KetcherErrorBoundary] Component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      console.log('[KetcherErrorBoundary] Rendering fallback')
      // Fallback to RDKit viewer when Ketcher fails
      return (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-yellow-50 border border-yellow-200 text-yellow-800 px-2 py-1 text-xs z-10">
            Ketcher unavailable - using RDKit viewer
          </div>
          <div className="pt-8">
            <RDKitMoleculeViewer
              smiles={this.props.smiles}
              width={this.props.width}
              height={this.props.height - 32}
              className={this.props.className}
            />
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function KetcherMoleculeViewerInner({ 
  smiles, 
  width = 300, 
  height = 200, 
  className = ''
}: KetcherMoleculeViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const ketcherRef = useRef<any>(null)
  const structServiceProvider = useRef<StandaloneStructServiceProvider | null>(null)

  // Initialize struct service provider safely
  useEffect(() => {
    try {
      console.log('[Ketcher] Initializing struct service provider')
      structServiceProvider.current = new StandaloneStructServiceProvider()
      console.log('[Ketcher] Struct service provider initialized')
    } catch (err) {
      console.error('[Ketcher] Failed to initialize struct service provider:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize')
      setIsLoading(false)
    }
  }, [])

  // Load molecule after initialization
  useEffect(() => {
    const loadMolecule = async () => {
      if (!isInitialized || !ketcherRef.current || !smiles) return
      
      try {
        console.log('[Ketcher] Loading SMILES:', smiles)
        setIsLoading(true)
        
        // Wait for Ketcher to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Set the molecule
        await ketcherRef.current.setMolecule(smiles)
        
        setIsLoading(false)
        console.log('[Ketcher] Molecule loaded successfully')
      } catch (err) {
        console.error('[Ketcher] Failed to load molecule:', err)
        setError(err instanceof Error ? err.message : 'Failed to load molecule')
        setIsLoading(false)
      }
    }

    loadMolecule()
  }, [smiles, isInitialized])

  const handleInit = (ketcher: any) => {
    try {
      console.log('[Ketcher] Editor initialized successfully')
      ketcherRef.current = ketcher
      setIsInitialized(true)
      setIsLoading(false)
    } catch (err) {
      console.error('[Ketcher] Error in handleInit:', err)
      setError('Failed to initialize Ketcher editor')
      setIsLoading(false)
    }
  }

  const handleError = (message: string) => {
    console.error('[Ketcher] Ketcher error:', message)
    setError(message)
    setIsLoading(false)
  }

  // If there's an error, show fallback immediately
  if (error) {
    console.log('[Ketcher] Showing error fallback')
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 bg-red-50 border border-red-200 text-red-800 px-2 py-1 text-xs z-10">
          Ketcher error: {error}
        </div>
        <div className="pt-8">
          <RDKitMoleculeViewer
            smiles={smiles}
            width={width}
            height={height - 32}
            className={className}
          />
        </div>
      </div>
    )
  }

  // Only render Ketcher if struct service provider is ready
  if (!structServiceProvider.current) {
    console.log('[Ketcher] Waiting for struct service provider')
    return (
      <div className="flex items-center justify-center border border-gray-300 rounded-lg" 
           style={{ width: `${width}px`, height: `${height}px` }}>
        <div className="text-gray-500 text-sm">Initializing Ketcher...</div>
      </div>
    )
  }

  console.log('[Ketcher] Rendering Ketcher editor')
  return (
    <div 
      className={`ketcher-molecule-viewer ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-gray-500 text-sm">Loading Ketcher...</div>
        </div>
      )}
      <KetcherEditor
        staticResourcesUrl=""
        structServiceProvider={structServiceProvider.current as any}
        errorHandler={handleError}
        onInit={handleInit}
      />
    </div>
  )
}

*/ // End of commented Ketcher code

function KetcherMoleculeViewer(props: KetcherMoleculeViewerProps) {
  console.log('[Ketcher] Rendering KetcherMoleculeViewer wrapper')
  
  // Temporary: Always use RDKit fallback until Ketcher is properly configured
  // Ketcher requires static resources setup that's causing blank pages
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 text-blue-800 px-2 py-1 text-xs z-10">
        Ketcher viewer - Using RDKit fallback (Ketcher configuration pending)
      </div>
      <div className="pt-8">
        <RDKitMoleculeViewer
          smiles={props.smiles}
          width={props.width || 300}
          height={(props.height || 200) - 32}
          className={props.className || ''}
        />
      </div>
    </div>
  )
  
  /* Original Ketcher implementation - commented out until static resources are configured
  return (
    <KetcherErrorBoundary smiles={props.smiles} width={props.width || 300} height={props.height || 200} className={props.className || ''}>
      <KetcherMoleculeViewerInner {...props} />
    </KetcherErrorBoundary>
  )
  */
}

export default KetcherMoleculeViewer
