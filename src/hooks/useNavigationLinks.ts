import { useLanguageStore } from '@/store/languageStore'

export function useNavigationLinks() {
  const { t } = useLanguageStore()

  return [
    { path: '/', label: t.navigation.home },
    { path: '/profile', label: t.navigation.profile },
    { path: '/library', label: t.navigation.chemistry },
    { path: '/ai-chat', label: t.navigation.biopilot },
  ]
}
