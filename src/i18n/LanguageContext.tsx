import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  LANGUAGE_STORAGE_KEY,
  dictionary,
  type Language,
  type TranslationKey,
} from './translations'

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const readInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'bg'
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === 'en' || stored === 'bg' ? stored : 'bg'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage)

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'bg' ? 'en' : 'bg')
  }, [language, setLanguage])

  useEffect(() => {
    document.documentElement.lang = language
    document.title =
      language === 'en'
        ? 'Discover Bulgaria | Regions and destinations'
        : 'Открий България | Области и дестинации'
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey) => dictionary[language][key],
    }),
    [language, setLanguage, toggleLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useI18n must be used within LanguageProvider')
  return value
}
