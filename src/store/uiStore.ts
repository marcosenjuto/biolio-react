import { create } from 'zustand'

interface UIState {
  isMobileMenuOpen: boolean
  theme: 'light' | 'dark'
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  theme: 'light',
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setTheme: (theme) => set({ theme }),
}))
