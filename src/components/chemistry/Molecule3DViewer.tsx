import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FullscreenMoleculeViewer } from './FullscreenMoleculeViewer'

// 3Dmol.js and RDKit types
declare global {
  interface Window {
    $3Dmol: any
    initRDKitModule: () => Promise<any>
  }
}

interface Molecule3DViewerProps {
  smiles?: string
  molString?: string
  sdfData?: string // Pre-loaded SDF data from molecule.structure.structure3D.data
  compoundName?: string // Compound name for fetching from PubChem
  width?: number | string
  height?: number | string
  className?: string
  spin?: boolean
  spinSpeed?: number
  zoom?: number
  use3DGeneration?: boolean // Use RDKit's real 3D generation instead of PubChem
  onSdfDataFetched?: (sdfData: string) => void // Callback to save SDF data
  showAtomLabels?: boolean // Show element symbols on atoms (C, O, N, etc.)
  onNavigateToDetails?: () => void // Navigate to molecule details page
}

// Global loading promises
let mol3dLoadPromise: Promise<void> | null = null

function Molecule3DViewer({
  smiles,
  molString,
  sdfData,
  compoundName,
  width = 400,
  height = 400,
  className = '',
  spin = false, // Changed default to false for better UX in lists
  spinSpeed = 0.1,
  zoom = 1.2,
  use3DGeneration = true, // Use RDKit's real 3D generation
  onSdfDataFetched,
  showAtomLabels = true, // Show element symbols on atoms
  onNavigateToDetails
}: Molecule3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [measuredDimensions, setMeasuredDimensions] = useState<{ width: number; height: number } | null>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [localShowLabels, setLocalShowLabels] = useState(showAtomLabels)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    // checkMobile() // Initial check already done in state initializer
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isFullscreen && typeof width === 'number' && typeof height === 'number') {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>

    const measureDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        // If height is not fixed, calculate it based on aspect ratio (e.g., 1:1 for 3D)
        const h = typeof height === 'number' ? height : w // Square for 3D
        setMeasuredDimensions({ width: w, height: h })
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
  }, [width, height, isFullscreen])

  // Resize viewer when dimensions change
  useEffect(() => {
    if (viewerRef.current) {
      // Small delay to ensure layout is stable after fullscreen transition
      setTimeout(() => {
        if (viewerRef.current) viewerRef.current.resize()
      }, 50)
    }
  }, [measuredDimensions, isFullscreen])

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
        const tryLoadFromCDN = (cdnUrl: string, retryWithNext?: () => void) => {
          console.log('[3DMol] Trying to load from:', cdnUrl)
          
          const script = document.createElement('script')
          script.src = cdnUrl
          script.async = true
          script.crossOrigin = 'anonymous'

          let timeoutId: NodeJS.Timeout

          script.onload = () => {
            clearTimeout(timeoutId)
            console.log('[3DMol] Script loaded from:', cdnUrl)
            
            // Wait for global to be available
            const checkReady = () => {
              if (window.$3Dmol) {
                console.log('[3DMol] Library ready')
                resolve()
              } else {
                setTimeout(checkReady, 50)
              }
            }
            checkReady()
          }

          script.onerror = () => {
            clearTimeout(timeoutId)
            console.error('[3DMol] Failed to load from:', cdnUrl)
            script.remove()
            
            if (retryWithNext) {
              retryWithNext()
            } else {
              mol3dLoadPromise = null
              reject(new Error('Failed to load 3Dmol.js from all CDN sources'))
            }
          }

          // Set timeout for slow loading
          timeoutId = setTimeout(() => {
            console.warn('[3DMol] Loading timeout from:', cdnUrl)
            script.remove()
            if (retryWithNext) {
              retryWithNext()
            } else {
              mol3dLoadPromise = null
              reject(new Error('3Dmol.js load timeout'))
            }
          }, 15000)

          document.head.appendChild(script)
        }

        // Try multiple CDN sources
        const cdnSources = [
          'https://3dmol.org/build/3Dmol-min.js',
          'https://3dmol.csb.pitt.edu/build/3Dmol-min.js',
          'https://cdn.jsdelivr.net/npm/3dmol@latest/build/3Dmol-min.js'
        ]

        let currentIndex = 0
        const tryNext = () => {
          if (currentIndex < cdnSources.length - 1) {
            currentIndex++
            tryLoadFromCDN(cdnSources[currentIndex], tryNext)
          } else {
            tryLoadFromCDN(cdnSources[currentIndex])
          }
        }

        tryLoadFromCDN(cdnSources[0], tryNext)
      })

      await mol3dLoadPromise
    }

    const generateReal3DFromSMILES = async (smilesString: string): Promise<string> => {
      try {
        console.log('[PubChem] Generating real 3D structure from SMILES:', smilesString)
        
        // Check if we have cached SDF for this SMILES
        const cacheKey = `sdf_smiles_${smilesString}`
        const cachedSDF = localStorage.getItem(cacheKey)
        if (cachedSDF) {
          console.log('[PubChem] Using cached SDF for SMILES:', smilesString)
          if (onSdfDataFetched) {
            onSdfDataFetched(cachedSDF)
          }
          return cachedSDF
        }
        
        // Step 1: Get CID from SMILES (check cache first)
        const cidCacheKey = `cid_smiles_${smilesString}`
        let cid: string | null = localStorage.getItem(cidCacheKey)
        
        if (!cid) {
          const cidUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smilesString)}/cids/JSON`
          console.log('[PubChem] Getting CID from SMILES...')
          
          const cidResponse = await fetch(cidUrl)
          if (!cidResponse.ok) {
            throw new Error(`PubChem CID lookup failed: ${cidResponse.status}`)
          }
          
          const cidData = await cidResponse.json()
          cid = cidData.IdentifierList.CID[0].toString()
          
          // Cache CID
          if (cid) {
            localStorage.setItem(cidCacheKey, cid)
            console.log('[PubChem] Cached CID:', cid, 'for SMILES:', smilesString)
          }
        } else {
          console.log('[PubChem] Using cached CID:', cid)
        }
        
        if (!cid) {
          throw new Error('Failed to get CID from PubChem')
        }
        
        // Step 2: Get 3D conformer SDF with REAL geometry
        const conformerUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d`
        console.log('[PubChem] Fetching 3D conformer with real geometry...')
        
        const response = await fetch(conformerUrl, {
          method: 'GET',
          headers: {
            'Accept': 'chemical/x-mdl-sdfile'
          }
        })

        if (!response.ok) {
          throw new Error(`PubChem 3D conformer API error: ${response.status}`)
        }

        const sdf = await response.text()
        
        if (!sdf || sdf.length < 10) {
          throw new Error('Invalid SDF data received')
        }

        console.log('[PubChem] Successfully fetched REAL 3D structure with tetrahedral angles')
        
        // Cache SDF by SMILES
        try {
          localStorage.setItem(cacheKey, sdf)
          console.log('[PubChem] Cached SDF for SMILES:', smilesString)
        } catch (e) {
          console.warn('[PubChem] Failed to cache SDF:', e)
        }
        
        // Also cache by compound name if provided
        if (compoundName) {
          try {
            localStorage.setItem(`sdf_${compoundName}`, sdf)
            localStorage.setItem(`cid_${compoundName}`, cid)
            console.log('[PubChem] Cached SDF and CID for compound:', compoundName)
          } catch (e) {
            console.warn('[PubChem] Failed to cache by compound name:', e)
          }
        }
        
        // Notify parent component
        if (onSdfDataFetched) {
          onSdfDataFetched(sdf)
        }
        
        return sdf
      } catch (err) {
        console.error('[PubChem] 3D generation error:', err)
        throw err
      }
    }

    /* const convertSMILEStoMOL = async (smilesString: string): Promise<string> => {
      try {
        // Clean SMILES string - remove any whitespace
        const cleanSMILES = smilesString.trim()
        
        if (!cleanSMILES || cleanSMILES.length === 0) {
          throw new Error('Invalid SMILES string')
        }

        console.log('[3DMol] Converting SMILES:', cleanSMILES)

        // For complex molecules like PCC: separate and render only organic component
        const fragments = cleanSMILES.split('.')
        
        console.log('[3DMol] All fragments:', fragments)
        
        // Filter out small inorganic fragments and ions
        const organicFragments = fragments.filter(frag => {
          // Remove brackets for length check
          const cleanFrag = frag.replace(/\[|\]/g, '')
          const isOrganic = (
            cleanFrag.length > 3 && // At least 4 atoms
            !frag.includes('[Cl-]') && // Exclude chloride
            !frag.includes('[Cl+]') && // Exclude chloride
            !frag.includes('[Cr') && // Exclude chromium compounds
            !frag.match(/^\[[A-Z][a-z]?[\+\-]\d*\]$/) // Exclude simple ions like [Na+], [Cl-], [O-]
          )
          console.log(`[3DMol] Fragment "${frag}" (${cleanFrag.length} atoms) - organic: ${isOrganic}`)
          return isOrganic
        })
        
        // Get the longest organic fragment (most complex molecule)
        const targetSmiles = organicFragments.length > 0 
          ? organicFragments.sort((a, b) => b.length - a.length)[0]
          : fragments.sort((a, b) => b.length - a.length)[0]
        
        console.log('[3DMol] Using SMILES fragment:', targetSmiles)

        // Use PubChem to convert SMILES to 3D structure
        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(targetSmiles)}/SDF`
        console.log('[3DMol] Fetching from:', url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'chemical/x-mdl-sdfile'
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[3DMol] PubChem error response:', errorText)
          throw new Error(`PubChem API error: ${response.status}`)
        }

        const sdfData = await response.text()
        
        if (!sdfData || sdfData.length < 10) {
          throw new Error('Invalid SDF data received')
        }

        console.log('[3DMol] Successfully converted SMILES to SDF')
        
        // Cache in localStorage
        if (compoundName) {
          try {
            localStorage.setItem(`sdf_${compoundName}`, sdfData)
            console.log('[3DMol] Cached SDF for', compoundName)
          } catch (e) {
            console.warn('[3DMol] Failed to cache SDF:', e)
          }
        }
        
        // Notify parent component
        if (onSdfDataFetched) {
          onSdfDataFetched(sdfData)
        }
        
        return sdfData
      } catch (err) {
        console.error('[3DMol] SMILES conversion error:', err)
        throw err
      }
    }

    const fetchSDFFromPubChem = async (name: string): Promise<string> => {
      try {
        console.log('[3DMol] Fetching SDF by name:', name)
        
        // Check localStorage cache first
        const cached = localStorage.getItem(`sdf_${name}`)
        if (cached) {
          console.log('[3DMol] Using cached SDF for', name)
          return cached
        }

        // Option 1: Search by name
        const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/SDF`
        console.log('[3DMol] Fetching from:', searchUrl)
        
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Accept': 'chemical/x-mdl-sdfile'
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[3DMol] PubChem error response:', errorText)
          throw new Error(`PubChem API error: ${response.status}`)
        }

        const sdfData = await response.text()
        
        if (!sdfData || sdfData.length < 10) {
          throw new Error('Invalid SDF data received')
        }

        console.log('[3DMol] Successfully fetched SDF from PubChem')
        
        // Cache in localStorage
        try {
          localStorage.setItem(`sdf_${name}`, sdfData)
          console.log('[3DMol] Cached SDF for', name)
        } catch (e) {
          console.warn('[3DMol] Failed to cache SDF:', e)
        }
        
        // Notify parent component
        if (onSdfDataFetched) {
          onSdfDataFetched(sdfData)
        }
        
        return sdfData
      } catch (err) {
        console.error('[3DMol] PubChem fetch error:', err)
        throw err
      }
    } */

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
        let moleculeData = molString || sdfData

        console.log('[3DMol] Debugging fetch decision:', { 
          molString: !!molString,
          sdfData: !!sdfData,
          compoundName, 
          smiles, 
          use3DGeneration 
        })
        
        // Priority: 1. molString, 2. sdfData (from molecule.structure.structure3D.data), 3. smiles (fetch from PubChem)
        if (!moleculeData && smiles) {
          if (use3DGeneration) {
            console.log('[3DMol] No pre-loaded SDF, generating 3D structure from SMILES via PubChem...')
            moleculeData = await generateReal3DFromSMILES(smiles)
          }
        } else if (sdfData) {
          console.log('[3DMol] Using pre-loaded SDF data from molecule object')
        }

        if (!moleculeData) {
          throw new Error('No molecule data provided')
        }


        // Clear previous viewer
        if (viewerRef.current) {
          viewerRef.current.clear()
        }

        // Create 3Dmol viewer
        // Note: WebGL doesn't support true transparency, using white background
        const config = {
          backgroundColor: '0xffffff', // White background (hex format for 3Dmol)
          antialias: true
        }

        const viewer = window.$3Dmol.createViewer(containerRef.current, config)
        viewerRef.current = viewer

        // Add molecule
        viewer.addModel(moleculeData, 'sdf')
        
        // Use ball-and-stick style to show REAL 3D geometry
        viewer.setStyle({}, {
          stick: {
            radius: 0.15,
            colorscheme: 'Jmol'
          },
          sphere: {
            scale: 0.3,
            colorscheme: 'Jmol'
          }
        })

        // Add atom labels if requested (only for front-facing atoms)
        if (localShowLabels) {
          const atoms = viewer.getModel().selectedAtoms({})
          atoms.forEach((atom: any) => {
            viewer.addLabel(atom.elem, {
              position: atom,
              fontSize: 16,
              fontColor: 'white',
              backgroundColor: 'black',
              backgroundOpacity: 0,
              // borderRadius: 3,
              // borderThickness: 1,
              alignment: 'center',
            })
          })
        }

        // Zoom with magnification (closer view)
        viewer.zoomTo()
        viewer.zoom(zoom) // Slight zoom for better view
        viewer.render()

        console.log('[3DMol] Molecule rendered with real 3D structure')

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
  }, [smiles, molString, compoundName, spin, spinSpeed, use3DGeneration, onSdfDataFetched, localShowLabels, zoom, isFullscreen])

  // Gesture handlerssdfData, 
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[ContextMenu] Right-click triggered at:', e.clientX, e.clientY)
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
    console.log('[ContextMenu] Menu state set to true')
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    console.log('[ContextMenu] Touch start at:', touch.clientX, touch.clientY)
    longPressTimerRef.current = setTimeout(() => {
      console.log('[ContextMenu] Long press triggered!')
      setContextMenuPos({ x: touch.clientX, y: touch.clientY })
      setShowContextMenu(true)
      console.log('[ContextMenu] Menu state set to true from long press')
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    console.log('[ContextMenu] Touch end, clearing timer')
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleTouchMove = () => {
    // console.log('[ContextMenu] Touch move, canceling long press')
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const closeContextMenu = () => {
    console.log('[ContextMenu] Closing menu')
    setShowContextMenu(false)
  }

  const handleFullscreen = () => {
    console.log('[ContextMenu] Fullscreen clicked')
    setIsFullscreen(true)
    setShowContextMenu(false)
  }

  const exitFullscreen = () => {
    console.log('[ContextMenu] Exit fullscreen')
    setIsFullscreen(false)
  }

  const toggleLabels = () => {
    console.log('[ContextMenu] Toggle labels, current:', localShowLabels)
    setLocalShowLabels(prev => !prev)
    setShowContextMenu(false)
  }

  // Log context menu state changes
  useEffect(() => {
    console.log('[ContextMenu] Menu visibility changed:', showContextMenu, 'Position:', contextMenuPos)
  }, [showContextMenu, contextMenuPos])

  // Close context menu on click outside
  useEffect(() => {
    if (showContextMenu) {
      const handleClickOutside = () => closeContextMenu()
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showContextMenu])

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])
  
  const viewerContent = (
    <>
      <div
        className={`molecule-3d-viewer ${className}`}
        style={{
          width: isFullscreen ? '100%' : (typeof width === 'number' ? `${width}px` : width),
          height: isFullscreen ? '100%' : (error ? 'auto' : (typeof height === 'number' ? `${height}px` : (measuredDimensions ? `${measuredDimensions.height}px` : height))),
          borderRadius: isFullscreen ? '0' : '0.375rem',
          backgroundColor: isFullscreen ? 'white' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
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
          <div className="flex items-center justify-center bg-white z-10 w-full">
            <div className="text-red-500 text-xs p-2 text-center max-w-xs">
              <div className="font-semibold mb-1">Unable to render 3D structure</div>
              <div className="text-xs">{error}</div>
              {smiles && (
                <div className="text-xs opacity-75 font-mono break-all">{smiles}</div>
              )}
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          style={{
            width: isFullscreen ? '100%' : (typeof width === 'number' ? `${width}px` : width),
            height: isFullscreen ? '100%' : (typeof height === 'number' ? `${height}px` : (measuredDimensions ? `${measuredDimensions.height}px` : height)),
            display: error ? 'none' : 'block'
          }}
        />
      </div>

      {/* Context Menu */}
      {showContextMenu && createPortal(
        <>
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={closeContextMenu}
            />
          )}
          <div
            className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[180px] z-[9999] ${
              isMobile 
                ? 'w-[80%] max-w-sm' 
                : ''
            }`}
            style={isMobile ? {
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            } : {
              left: `${contextMenuPos.x}px`,
              top: `${contextMenuPos.y}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <button
            onClick={handleFullscreen}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fullscreen
          </button>
          
          <button
            onClick={toggleLabels}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {localShowLabels ? 'Hide' : 'Show'} Atom Labels
          </button>

          {onNavigateToDetails && (
            <button
              onClick={() => {
                onNavigateToDetails()
                setShowContextMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Molecule Details
            </button>
          )}

          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-xs text-gray-500">
            Visualization Options
          </div>
        </div>
        </>,
        document.body
      )}
    </>
  )

  // Fullscreen wrapper
  if (isFullscreen) {
    return (
      <FullscreenMoleculeViewer 
        isOpen={true} 
        onClose={exitFullscreen}
        compoundName={compoundName}
      >
        {viewerContent}
      </FullscreenMoleculeViewer>
    )
  }
  
  return viewerContent
}

export default Molecule3DViewer
