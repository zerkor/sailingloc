import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarDays, Euro, FileCheck2, MessageSquareText, Sailboat, ShieldCheck, Users } from 'lucide-react';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch {
      setStats(null);
      setError('Impossible de charger les statistiques admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <LoadingSpinner text="Chargement..." />;

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <AlertTriangle className="mx-auto mb-3" color="#dc2626" />
        <p className="text-sm font-semibold mb-4" style={{ color: '#07192E' }}>{error}</p>
        <button onClick={fetchStats} className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: '#00C6E0', color: '#07192E' }}>Réessayer</button>
      </div>
    );
  }

  const quickLinks = [
    { label: 'Utilisateurs', link: '/admin/users', icon: Users },
    { label: 'Bateaux', link: '/admin/boats', icon: Sailboat },
    { label: 'Réservations', link: '/admin/bookings', icon: CalendarDays },
    { label: 'Avis', link: '/admin/reviews', icon: MessageSquareText },
    { label: 'Documents', link: '/admin/documents', icon: FileCheck2 },
    { label: 'Paiements', link: '/admin/payments', icon: Euro },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>Tableau de bord</h1>
        <p className="text-sm mt-1" style={{ color: '#8896A8' }}>Vue d'ensemble de la plateforme SailingLoc</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard title="Utilisateurs" value={stats?.totalUsers ?? 0} icon={Users} color="navy" />
        <DashboardCard title="Locataires" value={stats?.totalTenants ?? 0} icon={Users} color="ocean" />
        <DashboardCard title="Propriétaires" value={stats?.totalOwners ?? 0} icon={Users} color="green" />
        <DashboardCard title="Bateaux" value={stats?.totalBoats ?? 0} icon={Sailboat} color="ocean" />
        <DashboardCard title="Bateaux approuvés" value={stats?.approvedBoats ?? 0} icon={ShieldCheck} color="green" />
        <DashboardCard title="Réservations" value={stats?.totalBookings ?? 0} icon={CalendarDays} color="green" />
        <DashboardCard title="Réservations en attente" value={stats?.pendingBookings ?? 0} icon={CalendarDays} color="yellow" />
        <DashboardCard title="Confirmées" value={stats?.confirmedBookings ?? 0} icon={CalendarDays} color="cyan" />
        <DashboardCard title="Terminées" value={stats?.completedBookings ?? 0} icon={CalendarDays} color="green" />
        <DashboardCard title="Annulées" value={stats?.cancelledBookings ?? 0} icon={CalendarDays} color="red" />
        <DashboardCard title="Revenus payés" value={formatPrice(stats?.totalRevenue ?? 0)} icon={Euro} color="cyan" subtitle="Paiements réussis" />
        <DashboardCard title="Frais de service" value={formatPrice(stats?.totalServiceFees ?? 0)} icon={Euro} color="cyan" subtitle="Commission plateforme" />
        <DashboardCard title="Remboursé" value={formatPrice(stats?.refundedAmount ?? 0)} icon={Euro} color="red" subtitle="Paiements refunded" />
        <DashboardCard title="Bateaux en attente" value={stats?.pendingBoats ?? 0} icon={ShieldCheck} color="yellow" subtitle="À approuver" />
        <DashboardCard title="Avis en attente" value={stats?.pendingReviews ?? 0} icon={MessageSquareText} color="red" subtitle="À modérer" />
        <DashboardCard title="Documents en attente" value={stats?.pendingDocuments ?? 0} icon={FileCheck2} color="yellow" subtitle="Pièces propriétaire" />
        <DashboardCard title="Signalements ouverts" value={stats?.openReports ?? 0} icon={AlertTriangle} color="red" subtitle="À traiter" />
      </div>

      {(stats?.pendingBoats > 0 || stats?.pendingReviews > 0 || stats?.pendingDocuments > 0 || stats?.openReports > 0) && (
        <div className="p-4 rounded-2xl flex flex-wrap items-center gap-4" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: '#C9A84C' }}><AlertTriangle size={16} /> Actions requises</span>
          {stats?.pendingBoats > 0 && <Link to="/admin/boats" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#07192E' }}>{stats.pendingBoats} bateau(x) à approuver <ArrowRight size={14} /></Link>}
          {stats?.pendingReviews > 0 && <Link to="/admin/reviews" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#07192E' }}>{stats.pendingReviews} avis à modérer <ArrowRight size={14} /></Link>}
          {stats?.pendingDocuments > 0 && <Link to="/admin/documents" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#07192E' }}>{stats.pendingDocuments} document(s) à vérifier <ArrowRight size={14} /></Link>}
          {stats?.openReports > 0 && <Link to="/admin/reports" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#07192E' }}>{stats.openReports} signalement(s) <ArrowRight size={14} /></Link>}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <h2 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>Accès rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickLinks.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.link} to={item.link} className="flex flex-col items-center p-5 rounded-2xl transition-all hover:-translate-y-0.5" style={{ background: '#EDF1F5' }}>
                <Icon size={28} className="mb-2" strokeWidth={2.1} />
                <span className="text-sm font-semibold text-center" style={{ color: '#07192E' }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
