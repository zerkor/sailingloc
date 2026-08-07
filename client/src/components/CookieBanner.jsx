import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings2, ShieldCheck } from 'lucide-react';

const defaultPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem('sailingloc_cookie_preferences');
    if (!saved) setVisible(true);
  }, []);

  const savePreferences = (nextPreferences) => {
    localStorage.setItem(
      'sailingloc_cookie_preferences',
      JSON.stringify({
        ...nextPreferences,
        savedAt: new Date().toISOString(),
      })
    );
    setVisible(false);
  };

  const toggle = (key) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => {
          const saved = localStorage.getItem('sailingloc_cookie_preferences');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setPreferences({
                essential: true,
                analytics: Boolean(parsed.analytics),
                marketing: Boolean(parsed.marketing),
              });
            } catch {
              setPreferences(defaultPreferences);
            }
          }
          setCustomizing(true);
          setVisible(true);
        }}
        className="cookie-floating-button"
        aria-label="Gérer les préférences cookies"
      >
        <Cookie size={15} /> Cookies
      </button>
    );
  }

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-modal="true"
      aria-label="Préférences cookies"
    >
      <div className="cookie-consent__panel">
        <div className="cookie-consent__header">
          <div className="cookie-consent__icon" aria-hidden="true">
            <ShieldCheck size={22} />
          </div>
          <div className="cookie-consent__copy">
            <strong>Gestion des cookies</strong>
            <p>
              Nous utilisons des cookies essentiels au fonctionnement du site. Les cookies de mesure d'audience et
              marketing restent désactivés sans votre accord. Consultez notre{' '}
              <Link to="/legal/cookies">
                politique des cookies
              </Link>
              .
            </p>
          </div>
          <div className="cookie-consent__actions">
            <button
              type="button"
              onClick={() => savePreferences(defaultPreferences)}
              className="cookie-consent__button cookie-consent__button--ghost"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => setCustomizing((prev) => !prev)}
              className="cookie-consent__button cookie-consent__button--outline"
              aria-expanded={customizing}
            >
              <Settings2 size={15} /> Personnaliser
            </button>
            <button
              type="button"
              onClick={() => savePreferences({ essential: true, analytics: true, marketing: true })}
              className="cookie-consent__button cookie-consent__button--primary"
            >
              Accepter
            </button>
          </div>
        </div>

        {customizing && (
          <div className="cookie-consent__preferences">
            {[
              ['essential', 'Essentiels', 'Toujours actifs'],
              ['analytics', "Mesure d'audience", 'Statistiques anonymisées'],
              ['marketing', 'Marketing', 'Offres personnalisées'],
            ].map(([key, label, helper]) => (
              <label key={key} className="cookie-consent__preference">
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  disabled={key === 'essential'}
                  onChange={() => toggle(key)}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{helper}</small>
                </span>
              </label>
            ))}
            <div className="cookie-consent__save">
              <button
                type="button"
                onClick={() => savePreferences(preferences)}
                className="cookie-consent__button cookie-consent__button--light"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
