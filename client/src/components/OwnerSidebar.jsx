import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, CalendarDays, FileCheck2, Menu, Sailboat, X } from 'lucide-react';

const links = [
  { to: '/owner/dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { to: '/owner/boats', label: 'Mes bateaux', icon: Sailboat },
  { to: '/owner/bookings', label: 'Réservations', icon: CalendarDays },
  { to: '/owner/documents', label: 'Documents', icon: FileCheck2 },
];

const LinkList = ({ onClick }) => (
  <nav className="flex-1 px-3 py-4 space-y-0.5">
    {links.map((link) => {
      const Icon = link.icon;
      return (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`
          }
          style={({ isActive }) => (isActive ? { background: '#00C6E0', color: '#07192E' } : {})}
        >
          <Icon size={18} strokeWidth={2.1} /> {link.label}
        </NavLink>
      );
    })}
  </nav>
);

const OwnerSidebar = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: '#0E2540' }}
      >
        <Link to="/">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
            Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-white bg-white/10"
          aria-label="Menu propriétaire"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden" style={{ background: '#0E2540' }}>
          <LinkList onClick={() => setOpen(false)} />
        </div>
      )}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 flex-col min-h-screen"
        style={{ background: '#0E2540', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>
          <p className="text-xs mt-1 font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Espace propriétaire
          </p>
        </div>
        <LinkList />
        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs hover:text-cyan-400 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <ArrowLeft size={13} /> Retour au site
          </Link>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
