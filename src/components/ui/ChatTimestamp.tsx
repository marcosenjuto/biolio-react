import { cn } from '@/utils/helpers'
import { useLanguageStore } from '@/store/languageStore'

const localeMap: Record<string, string> = {
  en: 'en-US', es: 'es-ES', it: 'it-IT', de: 'de-DE',
  pt: 'pt-BR', fr: 'fr-FR', zh: 'zh-CN', ar: 'ar-SA'
}

interface ChatTimestampProps {
  timestamp: Date
  className?: string
}

export function ChatTimestamp({ timestamp, className }: ChatTimestampProps) {
  const { t, language } = useLanguageStore()
  const locale = localeMap[language] || 'en-US'

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

    const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

    if (isToday) {
      return `${t.timestamps.today} ${time}`
    }
    
    if (isYesterday) {
      return `${t.timestamps.yesterday} ${time}`
    }

    return date.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
  }

  return (
    <span className={cn("text-xs whitespace-nowrap", className)}>
      {formatTime(timestamp)}
    </span>
  )
}
