import { useLanguageStore } from '@/store/languageStore'
import type { Language } from '@/types/language'

const languageOptions: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
]

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguageStore()

  const current = languageOptions.find((o) => o.value === language)

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className={`appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer hover:bg-white ${
          compact ? 'pl-7 pr-6 py-1.5 text-xs' : 'pl-8 pr-8 py-2'
        }`}
        title={current?.label}
      >
        {languageOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
      <span className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${compact ? 'text-sm' : 'text-base'}`}>
        {current?.flag}
      </span>
      <svg
        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
