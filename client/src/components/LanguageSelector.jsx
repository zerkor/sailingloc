import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
  { code: 'ru', label: 'RU' },
  { code: 'ar', label: 'AR' },
];

const LanguageSelector = ({ compact = false }) => {
  const { i18n, t } = useTranslation();
  const activeLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').split('-')[0];

  return (
    <div
      className={`language-selector ${compact ? 'language-selector--compact' : ''}`}
      aria-label={t('navbar.language')}
      role="group"
    >
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={activeLanguage === language.code ? 'is-active' : ''}
          onClick={() => i18n.changeLanguage(language.code)}
          aria-pressed={activeLanguage === language.code}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
