import { useEffect, useState } from 'react';
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
import api from '../services/api';

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

const LinkList = ({ onClick, newContactMessages = 0 }) => (
  <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Navigation administration">
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
          <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
          <span className="min-w-0 flex-1">{link.label}</span>
          {link.to === '/admin/contact-messages' && newContactMessages > 0 && (
            <span
              className="grid min-w-5 h-5 place-items-center rounded-full px-1.5 text-[11px] font-black"
              style={{ background: '#FEE2E2', color: '#A61B1B' }}
              aria-label={`${newContactMessages} nouveau message contact`}
            >
              {newContactMessages > 9 ? '9+' : newContactMessages}
            </span>
          )}
        </NavLink>
      );
    })}
  </nav>
);

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);
  const [newContactMessages, setNewContactMessages] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refreshContactBadge = () => {
      api
        .get('/admin/stats')
        .then(({ data }) => {
          if (mounted) setNewContactMessages(data?.newContactMessages || 0);
        })
        .catch(() => {
          if (mounted) setNewContactMessages(0);
        });
    };

    refreshContactBadge();
    window.addEventListener('sailingloc:admin-stats-refresh', refreshContactBadge);
    return () => {
      mounted = false;
      window.removeEventListener('sailingloc:admin-stats-refresh', refreshContactBadge);
    };
  }, []);

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
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-white bg-white/10"
          aria-label="Menu admin"
          aria-expanded={open}
          aria-controls="admin-mobile-navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div id="admin-mobile-navigation" className="lg:hidden" style={{ background: '#07192E' }}>
          <LinkList onClick={() => setOpen(false)} newContactMessages={newContactMessages} />
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
        <LinkList newContactMessages={newContactMessages} />
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
