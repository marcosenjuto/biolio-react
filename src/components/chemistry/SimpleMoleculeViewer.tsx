import { useEffect, useRef, useState } from 'react'

interface SimpleMoleculeViewerProps {
  smiles: string
  width?: number
  height?: number
  className?: string
}

/**
 * Simple molecule viewer using canvas to draw basic structures
 * Fallback when Kekule.js fails or for simple display
 */
function SimpleMoleculeViewer({ smiles, width = 300, height = 200, className = '' }: SimpleMoleculeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      // Account for device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Set up canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      // Draw border
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, width, height)
      
      // Draw SMILES text
      ctx.fillStyle = '#374151'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Wrap text if too long
      const maxWidth = width - 20
      const words = smiles.match(/.{1,30}/g) || [smiles]
      const lineHeight = 16
      const startY = (height - (words.length * lineHeight)) / 2
      
      words.forEach((word, i) => {
        ctx.fillText(word, width / 2, startY + (i * lineHeight))
      })
      
      // Draw label
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText('SMILES notation', width / 2, height - 10)
      
      setError(null)
    } catch (err) {
      setError('Failed to render')
      console.error('Canvas error:', err)
    }
  }, [smiles, width, height])

  return (
    <div className={`simple-molecule-viewer ${className}`} style={{ width: `${width}px`, height: `${height}px` }}>
      {error ? (
        <div className="simple-viewer-error flex items-center justify-center h-full text-red-500 text-xs p-2">
          {error}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="simple-viewer-canvas rounded-lg"
          style={{
            width: `${width}px`,
            height: `${height}px`
          }}
        />
      )}
    </div>
  )
}

export default SimpleMoleculeViewer
