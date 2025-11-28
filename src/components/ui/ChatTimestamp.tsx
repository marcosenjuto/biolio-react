import { cn } from '@/utils/helpers'

interface ChatTimestampProps {
  timestamp: Date
  className?: string
}

export function ChatTimestamp({ timestamp, className }: ChatTimestampProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear()
                    
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear()

    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })

    if (isToday) {
      return `Hoy ${time}`
    }
    
    if (isYesterday) {
      return `Ayer ${time}`
    }

    return date.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
  }

  return (
    <span className={cn("text-xs whitespace-nowrap", className)}>
      {formatTime(timestamp)}
    </span>
  )
}
