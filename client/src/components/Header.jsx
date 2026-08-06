import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';

const navLinks = [
  { to: '/', labelKey: 'navbar.home' },
  { to: '/boats', labelKey: 'navbar.boats' },
  { to: '/categories', labelKey: 'navbar.categories' },
  { to: '/products', labelKey: 'navbar.products' },
  { to: '/contact', labelKey: 'navbar.contact' },
];

const Header = () => {
  const { user, logoutUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[1.5px] after:bg-cyan-500 after:transition-transform after:duration-300 ${
      isActive
        ? 'text-white after:scale-x-100'
        : 'text-white/60 hover:text-white after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/[0.08]"
      style={{ background: 'rgba(7,25,46,0.97)', backdropFilter: 'blur(20px)' }}
    >
      <nav className="container-max px-4 sm:px-6 lg:px-14" aria-label={t('navbar.navigation')}>
        <div className="flex h-[64px] items-center justify-between lg:h-[76px]">
          <Link to="/" className="flex-shrink-0">
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '.5px',
              }}
            >
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex xl:gap-7">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
                {t(link.labelKey)}
              </NavLink>
            ))}
            {user?.role === 'owner' && (
              <NavLink to="/owner/dashboard" className={navLinkClass}>
                {t('navbar.ownerSpace')}
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                {t('navbar.admin')}
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSelector />
            <button
              type="button"
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-xl border border-white/10 bg-white/[0.04]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t('navbar.menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <span
                className={`block h-[2px] w-[22px] origin-left rounded-sm bg-white transition-all duration-200 ${menuOpen ? 'rotate-45' : ''}`}
              />
              <span
                className={`block h-[2px] w-[22px] rounded-sm bg-white transition-all duration-200 ${menuOpen ? '-translate-x-2 opacity-0' : ''}`}
              />
              <span
                className={`block h-[2px] w-[22px] origin-left rounded-sm bg-white transition-all duration-200 ${menuOpen ? '-rotate-45' : ''}`}
              />
            </button>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSelector />
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/15 hover:text-white"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  aria-controls="user-menu"
                  aria-label={`${t('navbar.profile')} ${user.firstName || ''}`}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: '#00C6E0', color: '#07192E' }}
                  >
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </div>
                  <span>{user.firstName}</span>
                  <svg className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    id="user-menu"
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-navy-900/10 bg-white py-1.5"
                    style={{ boxShadow: '0 12px 48px rgba(7,25,46,0.14)' }}
                  >
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-navy-900 transition-colors hover:bg-[#EDF1F5]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t('navbar.profile')}
                    </Link>
                    {user.role === 'tenant' && (
                      <Link
                        to="/my-bookings"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-navy-900 transition-colors hover:bg-[#EDF1F5]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {t('navbar.bookings')}
                      </Link>
                    )}
                    {user.role === 'owner' && (
                      <Link
                        to="/owner/dashboard"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-navy-900 transition-colors hover:bg-[#EDF1F5]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {t('navbar.dashboard')}
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-navy-900 transition-colors hover:bg-[#EDF1F5]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {t('navbar.admin')}
                      </Link>
                    )}
                    <hr className="my-1.5 border-navy-900/10" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/50 hover:text-white"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 hover:opacity-90"
                  style={{ background: '#00C6E0', color: '#07192E' }}
                >
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-navigation" className="space-y-1 border-t border-white/10 pb-5 pt-4 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-white/80 hover:bg-white/8 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {user?.role === 'owner' && (
              <Link
                to="/owner/dashboard"
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-white/80 hover:bg-white/8 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t('navbar.ownerSpace')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-white/80 hover:bg-white/8 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t('navbar.admin')}
              </Link>
            )}
            <div className="mt-2 border-t border-white/10 pt-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-3 text-sm text-white/70 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('navbar.profile')}
                  </Link>
                  {user.role === 'tenant' && (
                    <Link
                      to="/my-bookings"
                      className="block px-3 py-3 text-sm text-white/70 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('navbar.bookings')}
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="block w-full px-3 py-3 text-left text-sm text-red-400">
                    {t('navbar.logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-3 px-2 pt-3 sm:grid-cols-2">
                  <Link
                    to="/login"
                    className="rounded-full border border-white/20 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('navbar.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full py-2.5 text-center text-sm font-bold"
                    style={{ background: '#00C6E0', color: '#07192E' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('navbar.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
