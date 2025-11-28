import { useEffect, useRef, useState } from 'react'

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
  compoundName?: string // Compound name for fetching from PubChem
  width?: number | string
  height?: number | string
  className?: string
  spin?: boolean
  spinSpeed?: number
  zoom?: number
  use3DGeneration?: boolean // Use RDKit's real 3D generation instead of PubChem
  onSdfDataFetched?: (sdfData: string) => void // Callback to save SDF data
}

// Global loading promises
let mol3dLoadPromise: Promise<void> | null = null

function Molecule3DViewer({
  smiles,
  molString,
  compoundName,
  width = 400,
  height = 400,
  className = '',
  spin = false, // Changed default to false for better UX in lists
  spinSpeed = 0.1,
  zoom = 1.2,
  use3DGeneration = true, // Use RDKit's real 3D generation
  onSdfDataFetched
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

    const convertSMILEStoMOL = async (smilesString: string): Promise<string> => {
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
        
        // Priority: 1. molString, 2. compoundName (fetch from PubChem), 3. smiles (with RDKit 3D gen or PubChem convert)
        if (!moleculeData && compoundName) {
          console.log('[3DMol] Fetching by compound name:', compoundName)
          moleculeData = await fetchSDFFromPubChem(compoundName)
        } else if (!moleculeData && smiles) {
          if (use3DGeneration) {
            console.log('[3DMol] Generating real 3D structure with RDKit...')
            moleculeData = await generateReal3DFromSMILES(smiles)
          } else {
            console.log('[3DMol] Converting SMILES to MOL format...')
            moleculeData = await convertSMILEStoMOL(smiles)
          }
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
  }, [smiles, molString, compoundName, spin, spinSpeed, use3DGeneration, onSdfDataFetched])
  
  return (
    <div
      className={`molecule-3d-viewer ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: error ? 'auto' : (typeof height === 'number' ? `${height}px` : height),
        borderRadius: '0.375rem',
        backgroundColor: 'transparent',
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
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          display: error ? 'none' : 'block'
        }}
      />
    </div>
  )
}

export default Molecule3DViewer
