import { NavLink, Link } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/admin/users',     label: 'Utilisateurs',    icon: '👥' },
  { to: '/admin/boats',     label: 'Bateaux',          icon: '⛵' },
  { to: '/admin/bookings',  label: 'Réservations',     icon: '📅' },
  { to: '/admin/reviews',   label: 'Avis',             icon: '⭐' },
];

const AdminSidebar = () => (
  <aside
    className="w-64 flex-shrink-0 flex flex-col min-h-screen"
    style={{ background: '#07192E', borderRight: '1px solid rgba(255,255,255,0.06)' }}
  >
    {/* Brand */}
    <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Link to="/">
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>
          Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
        </span>
      </Link>
      <p className="text-xs mt-1 font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Administration
      </p>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'text-navy-900 font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`
          }
          style={({ isActive }) => isActive ? { background: '#00C6E0', color: '#07192E' } : {}}
        >
          <span className="text-base">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} SailingLoc</p>
    </div>
  </aside>
);

export default AdminSidebar;
