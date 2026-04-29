import { languageNames } from '../i18n/translations'
import { useI18n } from '../i18n/LanguageContext'

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useI18n()
  const nextLanguage = language === 'bg' ? 'en' : 'bg'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-3 text-xs font-bold text-[var(--forest-deep)] shadow-sm transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
      aria-label={language === 'bg' ? t('switchToEnglish') : t('switchToBulgarian')}
      title={t('language')}
    >
      {languageNames[nextLanguage]}
    </button>
  )
}
