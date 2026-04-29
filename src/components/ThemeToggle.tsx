import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useI18n } from '../i18n/LanguageContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { language } = useI18n()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl transition-all duration-300 hover:bg-[var(--surface-2)]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={language === 'en' ? 'Change theme' : 'Промени тема'}
    >
      <div className="relative w-6 h-6">
        {/* Sun icon for light mode */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-[var(--ink-soft)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ rotate: 0, opacity: theme === 'dark' ? 0 : 1 }}
          animate={{ rotate: theme === 'dark' ? -180 : 0, opacity: theme === 'dark' ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <circle cx="12" cy="12" r="5" strokeWidth={2} strokeLinecap="round" />
          <path
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </motion.svg>

        {/* Moon icon for dark mode */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-[var(--ink-soft)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ rotate: 0, opacity: theme === 'light' ? 0 : 1 }}
          animate={{ rotate: theme === 'light' ? 180 : 0, opacity: theme === 'light' ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeWidth={2}
            strokeLinecap="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </motion.svg>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--forest)]/10 to-[var(--sky)]/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  )
}
