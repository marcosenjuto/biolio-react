import * as React from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export function Select({ children, value, onValueChange, className = "", ...props }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`appearance-none bg-white border border-gray-300 rounded-full px-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer hover:bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  isActive?: boolean
}

export function SelectTrigger({ children, className = "", isActive = false }: SelectTriggerProps) {
  const activeStyles = isActive
    ? "bg-primary-500 text-white border-primary-500"
    : "bg-white text-gray-700 border-gray-300"

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${activeStyles}`}>
        {children}
      </div>
      <svg 
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${isActive ? 'text-white' : 'text-gray-400'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>
}
