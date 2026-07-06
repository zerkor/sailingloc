import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: '#07192E' }} className="text-white">
      <div className="container-max px-4 sm:px-6 lg:px-14 pt-16 pb-8">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 260 }}>
              La première plateforme de location de voiliers et bateaux entre particuliers en France et en Europe.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-wide">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Accueil',               to: '/' },
                { label: 'Nos bateaux',            to: '/boats' },
                { label: 'Se connecter',           to: '/login' },
                { label: 'Devenir propriétaire',   to: '/register' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm transition-colors hover:text-cyan-500" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-wide">Légal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Mentions légales',             to: '/legal/mentions-legales' },
                { label: 'CGU',                          to: '/legal/cgu' },
                { label: 'CGV',                          to: '/legal/cgv' },
                { label: 'Politique de confidentialité', to: '/legal/privacy' },
                { label: 'Politique des cookies',        to: '/legal/cookies' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm transition-colors hover:text-cyan-500" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-2.5">
              {[
                'support@sailingloc.fr',
                '+33 1 23 45 67 89',
                'FAQ',
                'Lun–Ven · 9h–18h',
              ].map((item) => (
                <li key={item} className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} SailingLoc · Tous droits réservés
          </span>
          <span className="text-xs" style={{ color: '#00C6E0' }}>
            Projet realise par l'equipe SailingLoc
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
