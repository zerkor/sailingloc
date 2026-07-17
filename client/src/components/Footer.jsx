import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  const navigationLinks = [
    { label: t('navbar.home'), to: '/' },
    { label: t('footer.ourBoats'), to: '/boats' },
    { label: t('footer.login'), to: '/login' },
    { label: t('footer.becomeOwner'), to: '/register' },
  ];

  const legalLinks = [
    { label: t('footer.legalNotice'), to: '/legal/mentions-legales' },
    { label: 'CGU', to: '/legal/cgu' },
    { label: 'CGV', to: '/legal/cgv' },
    { label: t('footer.privacy'), to: '/legal/privacy' },
    { label: t('footer.cookies'), to: '/legal/cookies' },
    { label: t('footer.mvpLimits'), to: '/mvp-limitations' },
  ];

  return (
    <footer style={{ background: '#07192E' }} className="text-white">
      <div className="container-max px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-10 xl:px-14">
        <div className="mb-12 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                marginBottom: 14,
              }}
            >
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 280 }}>
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold tracking-wide text-white">{t('footer.navigation')}</h4>
            <ul className="space-y-2.5">
              {navigationLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:text-cyan-300"
                    style={{ color: 'rgba(255,255,255,0.62)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold tracking-wide text-white">{t('footer.legal')}</h4>
            <ul className="space-y-2.5">
              {legalLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:text-cyan-300"
                    style={{ color: 'rgba(255,255,255,0.62)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold tracking-wide text-white">{t('navbar.contact')}</h4>
            <ul className="space-y-2.5">
              {['support@sailingloc.fr', '+33 1 23 45 67 89', 'FAQ', t('footer.hours')].map((item) => (
                <li key={item} className="text-sm" style={{ color: 'rgba(255,255,255,0.62)' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col items-start justify-between gap-3 pt-7 sm:flex-row sm:items-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} SailingLoc · {t('footer.rights')}
          </span>
          <span className="text-xs" style={{ color: '#00C6E0' }}>
            {t('footer.projectBy')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
