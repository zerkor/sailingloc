import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'ar', label: 'AR', name: 'العربية' },
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const activeLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').split('-')[0];
  const activeOption = LANGUAGES.find((language) => language.code === activeLanguage) || LANGUAGES[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleChange = (language) => {
    i18n.changeLanguage(language.code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="language-dropdown">
      <button
        type="button"
        className="language-dropdown__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('navbar.language')} : ${activeOption.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 size={14} aria-hidden="true" />
        <span>{activeOption.label}</span>
        <ChevronDown size={13} aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>

      {open && (
        <div className="language-dropdown__menu" role="menu">
          {LANGUAGES.map((language) => {
            const isActive = language.code === activeOption.code;

            return (
              <button
                key={language.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={isActive ? 'is-active' : ''}
                onClick={() => handleChange(language)}
              >
                <span className="language-dropdown__code">{language.label}</span>
                <span className="language-dropdown__name">{language.name}</span>
                <Check size={14} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
