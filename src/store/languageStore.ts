import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, Translations } from '@/types/language';
import { translations } from '@/data/translations';

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      t: translations.en,
      setLanguage: (language: Language) =>
        set({ language, t: translations[language] }),
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language];
        }
      },
    }
  )
);
