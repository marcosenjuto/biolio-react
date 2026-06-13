import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguageStore } from '@/store/languageStore'

interface FullscreenMoleculeViewerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  compoundName?: string
}

export function FullscreenMoleculeViewer({ 
  isOpen, 
  onClose, 
  children,
  compoundName 
}: FullscreenMoleculeViewerProps) {
  const { t } = useLanguageStore()
  if (!isOpen) return null

  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
      {/* Header / Toolbar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[110] bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="text-white font-medium text-lg drop-shadow-md pointer-events-auto">
          {compoundName || t.chemistry.moleculeViewer}
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
           {/* Like Button */}
           <button 
             className="text-white/90 hover:text-pink-400 hover:bg-white/10 transition-all p-2 rounded-full backdrop-blur-sm"
             title={t.chemistry.like}
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
             </svg>
           </button>
           
           {/* Share Button */}
           <button 
             className="text-white/90 hover:text-blue-400 hover:bg-white/10 transition-all p-2 rounded-full backdrop-blur-sm"
             title={t.chemistry.share}
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
             </svg>
           </button>

           {/* Close Button */}
           <button 
             onClick={onClose}
             className="text-white/90 hover:text-white hover:bg-white/20 transition-all p-2 rounded-full backdrop-blur-sm ml-2"
             title={t.chemistry.exitFullscreen}
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative w-full h-full bg-white overflow-hidden">
        {children}
      </div>
    </div>,
    document.body
  )
}
