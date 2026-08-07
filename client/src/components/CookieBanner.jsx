import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';

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
        className="fixed bottom-4 left-4 z-50 rounded-full border border-cyan-400/30 bg-navy-900 px-4 py-2 text-xs font-bold text-white shadow-xl transition-colors hover:bg-navy-800"
        aria-label="Gerer les preferences cookies"
      >
        Cookies
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900 text-white shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Preferences cookies"
    >
      <div className="container-max px-4 py-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 text-sm text-navy-200">
            <p>
              Nous utilisons des cookies essentiels au fonctionnement du site. Les cookies de mesure d'audience et
              marketing restent desactives sans votre accord. Consultez notre{' '}
              <Link to="/legal/cookies" className="text-cyan-300 hover:underline">
                politique des cookies
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <button
              onClick={() => savePreferences(defaultPreferences)}
              className="px-4 py-2 text-sm border border-navy-600 text-navy-200 hover:border-navy-400 rounded-lg transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={() => setCustomizing((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-cyan-400/40 text-cyan-200 hover:border-cyan-300 rounded-lg transition-colors"
            >
              <Settings2 size={15} /> Personnaliser
            </button>
            <button
              onClick={() => savePreferences({ essential: true, analytics: true, marketing: true })}
              className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-300 text-navy-900 rounded-lg transition-colors font-bold"
            >
              Accepter
            </button>
          </div>
        </div>

        {customizing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4">
            {[
              ['essential', 'Essentiels', 'Toujours actifs'],
              ['analytics', 'Mesure audience', 'Statistiques anonymisees'],
              ['marketing', 'Marketing', 'Offres personnalisees'],
            ].map(([key, label, helper]) => (
              <label key={key} className="flex items-start gap-3 rounded-lg border border-white/10 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  disabled={key === 'essential'}
                  onChange={() => toggle(key)}
                  className="mt-1"
                />
                <span>
                  <strong className="block text-white">{label}</strong>
                  <span className="text-navy-200">{helper}</span>
                </span>
              </label>
            ))}
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={() => savePreferences(preferences)}
                className="px-4 py-2 text-sm bg-white text-navy-900 rounded-lg font-bold"
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
