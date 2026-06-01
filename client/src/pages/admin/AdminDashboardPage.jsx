import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';

const AdminDashboardPage = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Chargement..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8896A8' }}>Vue d'ensemble de la plateforme SailingLoc</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Utilisateurs"          value={stats?.totalUsers    ?? 0} icon="👥" color="navy"   />
        <DashboardCard title="Bateaux"               value={stats?.totalBoats    ?? 0} icon="⛵" color="ocean"  />
        <DashboardCard title="Réservations"          value={stats?.totalBookings ?? 0} icon="📅" color="green"  />
        <DashboardCard title="Commission plateforme (10%)" value={formatPrice(stats?.simulatedRevenue ?? 0)} icon="💶" color="cyan" subtitle="Sur paiements confirmés" />
        <DashboardCard title="Bateaux en attente"    value={stats?.pendingBoats  ?? 0} icon="⏳" color="yellow" subtitle="À approuver" />
        <DashboardCard title="Avis en attente"       value={stats?.pendingReviews ?? 0} icon="⭐" color="red"   subtitle="À modérer" />
      </div>

      {/* Alert actions */}
      {(stats?.pendingBoats > 0 || stats?.pendingReviews > 0) && (
        <div className="p-4 rounded-2xl flex flex-wrap items-center gap-4"
             style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>⚠️ Actions requises</span>
          {stats?.pendingBoats > 0 && (
            <Link to="/admin/boats" className="text-sm font-medium hover:underline" style={{ color: '#07192E' }}>
              {stats.pendingBoats} bateau(x) à approuver →
            </Link>
          )}
          {stats?.pendingReviews > 0 && (
            <Link to="/admin/reviews" className="text-sm font-medium hover:underline" style={{ color: '#07192E' }}>
              {stats.pendingReviews} avis à modérer →
            </Link>
          )}
        </div>
      )}

      {/* Quick access */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <h2 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
          Accès rapides
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Utilisateurs', link: '/admin/users',    icon: '👥' },
            { label: 'Bateaux',      link: '/admin/boats',    icon: '⛵' },
            { label: 'Réservations', link: '/admin/bookings', icon: '📅' },
            { label: 'Avis',         link: '/admin/reviews',  icon: '⭐' },
          ].map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="flex flex-col items-center p-5 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ background: '#EDF1F5', border: '2px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C6E0'; e.currentTarget.style.background = 'rgba(0,198,224,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#EDF1F5'; }}
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-sm font-semibold" style={{ color: '#07192E' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
