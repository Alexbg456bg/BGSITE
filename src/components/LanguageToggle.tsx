import { languageNames, type Language } from '../i18n/translations'
import { useI18n } from '../i18n/LanguageContext'

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n()
  const options: Language[] = ['bg', 'en']

  return (
    <div
      className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-white/90 p-1 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label={t('language')}
      title={t('language')}
    >
      {options.map((option) => {
        const active = language === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            aria-pressed={active}
            aria-label={
              option === 'bg' ? t('switchToBulgarian') : t('switchToEnglish')
            }
            className={[
              'relative inline-flex h-8 min-w-[2.7rem] items-center justify-center rounded-xl px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition',
              active
                ? 'bg-[var(--forest-deep)] text-white shadow-[0_8px_18px_rgba(15,61,46,0.18)]'
                : 'text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--forest)]',
            ].join(' ')}
          >
            {languageNames[option]}
          </button>
        )
      })}
    </div>
  )
}
