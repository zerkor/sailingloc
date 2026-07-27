import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Euro,
  FileCheck2,
  History,
  Mail,
  MessageSquareText,
  Sailboat,
  ShieldCheck,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';

const Section = ({ title, children }) => (
  <section className="admin-kpi-section">
    <h2>{title}</h2>
    <div className="admin-kpi-grid">{children}</div>
  </section>
);

const ActionRow = ({ to, icon: Icon, label, count, danger = false }) => (
  <Link to={to} className={`admin-action-row ${danger && count > 0 ? 'is-danger' : ''}`}>
    <span className="admin-action-row__icon">
      <Icon size={17} />
    </span>
    <span>{label}</span>
    <strong>{count ?? 0}</strong>
    <ArrowRight size={15} />
  </Link>
);

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date()),
    []
  );

  if (loading) return <LoadingSpinner text="Chargement..." />;

  if (error) {
    return (
      <div className="admin-error-card">
        <AlertTriangle className="mx-auto mb-3" color="#A61B1B" />
        <p>{error}</p>
        <button type="button" onClick={fetchStats}>
          Réessayer
        </button>
      </div>
    );
  }

  const quickLinks = [
    { label: 'Utilisateurs', helper: 'Comptes et rôles', link: '/admin/users', icon: Users },
    { label: 'Bateaux', helper: 'Annonces et validation', link: '/admin/boats', icon: Sailboat },
    { label: 'Réservations', helper: 'Suivi des locations', link: '/admin/bookings', icon: CalendarDays },
    { label: 'Avis', helper: 'Modération client', link: '/admin/reviews', icon: MessageSquareText },
    { label: 'Documents', helper: 'Pièces propriétaires', link: '/admin/documents', icon: FileCheck2 },
    { label: 'Paiements', helper: 'Revenus et remboursements', link: '/admin/payments', icon: Euro },
    { label: 'Signalements', helper: 'Litiges à traiter', link: '/admin/reports', icon: AlertTriangle },
    { label: 'Emails', helper: 'Tests transactionnels', link: '/admin/emails', icon: Mail },
    { label: 'Journal admin', helper: 'Historique des actions', link: '/admin/action-logs', icon: History },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-top">
        <div>
          <span className="admin-eyebrow">Pilotage plateforme</span>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de la plateforme SailingLoc</p>
          <small>Dernière actualisation : {updatedAt}</small>
        </div>

        <aside className="admin-actions-panel">
          <div className="admin-actions-panel__head">
            <span>
              <AlertTriangle size={17} /> Actions requises
            </span>
            <small>À prioriser</small>
          </div>
          <div className="admin-actions-panel__list">
            <ActionRow to="/admin/boats" icon={Sailboat} label="Bateaux en attente" count={stats?.pendingBoats} />
            <ActionRow
              to="/admin/reviews"
              icon={MessageSquareText}
              label="Avis à modérer"
              count={stats?.pendingReviews}
            />
            <ActionRow
              to="/admin/documents"
              icon={FileCheck2}
              label="Documents à vérifier"
              count={stats?.pendingDocuments}
            />
            <ActionRow
              to="/admin/reports"
              icon={AlertTriangle}
              label="Signalements ouverts"
              count={stats?.openReports}
              danger
            />
            <ActionRow
              to="/admin/contact-messages"
              icon={Mail}
              label="Messages contact"
              count={stats?.newContactMessages}
            />
          </div>
        </aside>
      </div>

      <Section title="Activité globale">
        <DashboardCard title="Utilisateurs" value={stats?.totalUsers ?? 0} icon={Users} color="navy" />
        <DashboardCard title="Locataires" value={stats?.totalTenants ?? 0} icon={Users} color="ocean" />
        <DashboardCard title="Propriétaires" value={stats?.totalOwners ?? 0} icon={Users} color="green" />
        <DashboardCard title="Bateaux" value={stats?.totalBoats ?? 0} icon={Sailboat} color="ocean" />
      </Section>

      <Section title="Réservations">
        <DashboardCard title="Total réservations" value={stats?.totalBookings ?? 0} icon={CalendarDays} color="navy" />
        <DashboardCard title="En attente" value={stats?.pendingBookings ?? 0} icon={CalendarDays} color="yellow" />
        <DashboardCard title="Confirmées" value={stats?.confirmedBookings ?? 0} icon={CalendarDays} color="cyan" />
        <DashboardCard title="Terminées" value={stats?.completedBookings ?? 0} icon={CalendarDays} color="green" />
        <DashboardCard title="Annulées" value={stats?.cancelledBookings ?? 0} icon={CalendarDays} color="red" />
      </Section>

      <Section title="Finances">
        <DashboardCard
          title="Revenus payés"
          value={formatPrice(stats?.totalRevenue ?? 0)}
          icon={Euro}
          color="cyan"
          subtitle="Paiements réussis"
        />
        <DashboardCard
          title="Frais de service"
          value={formatPrice(stats?.totalServiceFees ?? 0)}
          icon={Euro}
          color="navy"
          subtitle="Commission plateforme"
        />
        <DashboardCard
          title="Remboursé"
          value={formatPrice(stats?.refundedAmount ?? 0)}
          icon={Euro}
          color="red"
          subtitle="Paiements remboursés"
        />
      </Section>

      <Section title="Modération">
        <DashboardCard
          title="Bateaux approuvés"
          value={stats?.approvedBoats ?? 0}
          icon={ShieldCheck}
          color="green"
        />
        <DashboardCard title="Bateaux en attente" value={stats?.pendingBoats ?? 0} icon={ShieldCheck} color="yellow" />
        <DashboardCard
          title="Avis en attente"
          value={stats?.pendingReviews ?? 0}
          icon={MessageSquareText}
          color="red"
          subtitle="À modérer"
        />
        <DashboardCard
          title="Documents en attente"
          value={stats?.pendingDocuments ?? 0}
          icon={FileCheck2}
          color="yellow"
          subtitle="À vérifier"
        />
        <DashboardCard
          title="Signalements ouverts"
          value={stats?.openReports ?? 0}
          icon={AlertTriangle}
          color="red"
          subtitle="À traiter"
        />
        <DashboardCard
          title="Messages contact"
          value={stats?.newContactMessages ?? 0}
          icon={Mail}
          color="cyan"
          subtitle="Nouveaux messages"
        />
      </Section>

      <section className="admin-quick-card">
        <div className="admin-quick-card__head">
          <div>
            <span className="admin-eyebrow">Navigation</span>
            <h2>Accès rapides</h2>
          </div>
        </div>
        <div className="admin-quick-grid">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.link} to={item.link} className="admin-quick-link">
                <Icon size={24} strokeWidth={2.1} />
                <strong>{item.label}</strong>
                <span>{item.helper}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
