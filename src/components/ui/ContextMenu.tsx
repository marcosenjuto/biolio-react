import { useEffect, useRef, useState } from 'react'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export interface ContextMenuSection {
  items?: ContextMenuItem[]
  label?: string
}

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  sections: ContextMenuSection[]
  onClose: () => void
}

function ContextMenu({ isOpen, position, sections, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Adjust position to prevent overflow
  useEffect(() => {
    if (isOpen && menuRef.current && !isMobile) {
      const menu = menuRef.current
      const rect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = position.x
      let adjustedY = position.y

      // Adjust horizontal position if menu overflows right edge
      if (position.x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10
      }

      // Adjust vertical position if menu overflows bottom edge
      if (position.y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10
      }

      // Ensure menu doesn't go off left edge
      if (adjustedX < 10) {
        adjustedX = 10
      }

      // Ensure menu doesn't go off top edge
      if (adjustedY < 10) {
        adjustedY = 10
      }

      menu.style.left = `${adjustedX}px`
      menu.style.top = `${adjustedY}px`
    }
  }, [isOpen, position])

  // Close on click outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose()
        }
      }

      // Delay to prevent immediate close from the same click that opened it
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)

      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={onClose}
        />
      )}
      <div
        ref={menuRef}
        className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[180px] max-w-[250px] z-[9999] ${
          isMobile 
            ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-sm' 
            : ''
        }`}
        style={!isMobile ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
        } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.items?.map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                if (!item.disabled) {
                  item.onClick()
                }
              }}
              disabled={item.disabled}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}

          {section.label && (
            <>
              {sectionIndex > 0 && <div className="border-t border-gray-200 my-1"></div>}
              <div className="px-4 py-2 text-xs text-gray-500 font-medium">{section.label}</div>
            </>
          )}

          {!section.label && sectionIndex < sections.length - 1 && (
            <div className="border-t border-gray-200 my-1"></div>
          )}
        </div>
      ))}
    </div>
    </>
  )
}

export default ContextMenu
