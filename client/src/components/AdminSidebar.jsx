import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  Euro,
  FileCheck2,
  Mail,
  Menu,
  MessageSquareText,
  ScrollText,
  Sailboat,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/boats', label: 'Bateaux', icon: Sailboat },
  { to: '/admin/bookings', label: 'Réservations', icon: CalendarDays },
  { to: '/admin/reviews', label: 'Avis', icon: MessageSquareText },
  { to: '/admin/documents', label: 'Documents', icon: FileCheck2 },
  { to: '/admin/payments', label: 'Paiements', icon: Euro },
  { to: '/admin/reports', label: 'Signalements', icon: ShieldAlert },
  { to: '/admin/contact-messages', label: 'Messages contact', icon: Mail },
  { to: '/admin/email-settings', label: 'Emails', icon: Mail },
  { to: '/admin/action-logs', label: 'Journal admin', icon: ScrollText },
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
          <Icon size={18} strokeWidth={2.1} />
          {link.label}
        </NavLink>
      );
    })}
  </nav>
);

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: '#07192E' }}
      >
        <Link to="/">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
            Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-white bg-white/10"
          aria-label="Menu admin"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden" style={{ background: '#07192E' }}>
          <LinkList onClick={() => setOpen(false)} />
        </div>
      )}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 flex-col min-h-screen"
        style={{ background: '#07192E', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
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
        <LinkList />
        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} SailingLoc
          </p>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
