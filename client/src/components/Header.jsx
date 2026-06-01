import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logoutUser } = useAuth();
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
    `relative text-sm font-medium transition-colors duration-200
     after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[1.5px]
     after:bg-cyan-500 after:transition-transform after:duration-300 ${
      isActive
        ? 'text-white after:scale-x-100'
        : 'text-white/60 hover:text-white after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/[0.08]"
      style={{ background: 'rgba(7,25,46,0.97)', backdropFilter: 'blur(20px)' }}
    >
      <nav className="container-max px-4 sm:px-6 lg:px-14">
        <div className="flex items-center justify-between h-[76px]">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: 24, fontWeight: 700, letterSpacing: '.5px' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-9">
            <NavLink to="/boats" className={navLinkClass}>Bateaux</NavLink>
            {user?.role === 'owner' && (
              <NavLink to="/owner/dashboard" className={navLinkClass}>Mon espace</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>Administration</NavLink>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white
                             bg-white/10 hover:bg-white/15 border border-white/15 rounded-full px-4 py-2 transition-all"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#00C6E0', color: '#07192E' }}
                  >
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <span>{user.firstName}</span>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-navy-900/10 py-1.5 z-50"
                       style={{ boxShadow: '0 12px 48px rgba(7,25,46,0.14)' }}>
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-navy-900 hover:bg-[#EDF1F5] transition-colors" onClick={() => setDropdownOpen(false)}>Mon profil</Link>
                    {user.role === 'tenant' && <Link to="/my-bookings"     className="block px-4 py-2.5 text-sm text-navy-900 hover:bg-[#EDF1F5] transition-colors" onClick={() => setDropdownOpen(false)}>Mes réservations</Link>}
                    {user.role === 'owner'  && <Link to="/owner/dashboard" className="block px-4 py-2.5 text-sm text-navy-900 hover:bg-[#EDF1F5] transition-colors" onClick={() => setDropdownOpen(false)}>Tableau de bord</Link>}
                    {user.role === 'admin'  && <Link to="/admin/dashboard" className="block px-4 py-2.5 text-sm text-navy-900 hover:bg-[#EDF1F5] transition-colors" onClick={() => setDropdownOpen(false)}>Administration</Link>}
                    <hr className="my-1.5 border-navy-900/10" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/70 hover:text-white border border-white/20
                             hover:border-white/50 px-5 py-2 rounded-full transition-all duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90"
                  style={{ background: '#00C6E0', color: '#07192E' }}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-[22px] h-[2px] bg-white rounded-sm transition-all duration-200 origin-left ${menuOpen ? 'rotate-45' : ''}`} />
            <span className={`block w-[22px] h-[2px] bg-white rounded-sm transition-all duration-200 ${menuOpen ? 'opacity-0 -translate-x-2' : ''}`} />
            <span className={`block w-[22px] h-[2px] bg-white rounded-sm transition-all duration-200 origin-left ${menuOpen ? '-rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-5 border-t border-white/10 pt-4 space-y-0.5">
            <Link to="/boats" className="block px-3 py-3 text-sm font-medium text-white/80 hover:text-white rounded-xl hover:bg-white/5" onClick={() => setMenuOpen(false)}>Bateaux</Link>
            {user?.role === 'owner' && <Link to="/owner/dashboard" className="block px-3 py-3 text-sm font-medium text-white/80 hover:text-white rounded-xl hover:bg-white/5" onClick={() => setMenuOpen(false)}>Mon espace</Link>}
            {user?.role === 'admin' && <Link to="/admin/dashboard" className="block px-3 py-3 text-sm font-medium text-white/80 hover:text-white rounded-xl hover:bg-white/5" onClick={() => setMenuOpen(false)}>Administration</Link>}
            <div className="pt-2 border-t border-white/10 mt-2">
              {user ? (
                <>
                  <Link to="/profile" className="block px-3 py-3 text-sm text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Mon profil</Link>
                  {user.role === 'tenant' && <Link to="/my-bookings" className="block px-3 py-3 text-sm text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>Mes réservations</Link>}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-3 text-sm text-red-400">Déconnexion</button>
                </>
              ) : (
                <div className="flex gap-3 px-2 pt-3">
                  <Link to="/login"    className="flex-1 text-center text-sm font-medium text-white border border-white/20 py-2.5 rounded-full hover:bg-white/10" onClick={() => setMenuOpen(false)}>Connexion</Link>
                  <Link to="/register" className="flex-1 text-center text-sm font-bold py-2.5 rounded-full" style={{ background: '#00C6E0', color: '#07192E' }} onClick={() => setMenuOpen(false)}>S'inscrire</Link>
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
