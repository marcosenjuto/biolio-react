import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const hoverClasses = hover ? 'hover:shadow-md transition-all duration-200' : ''
  
  return (
    <div 
      className={` rounded-lg p-0 md:p-4 ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
