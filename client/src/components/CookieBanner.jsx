import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookies_accepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900 text-white shadow-2xl">
      <div className="container-max px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-navy-200">
          <p>
            Nous utilisons des cookies pour améliorer votre expérience. En continuant à naviguer, vous acceptez notre{' '}
            <Link to="/legal/cookies" className="text-ocean-300 hover:underline">politique des cookies</Link>.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-navy-600 text-navy-300 hover:border-navy-400 rounded-lg transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-colors font-medium"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
