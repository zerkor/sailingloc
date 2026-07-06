import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, CheckCircle2, Euro, Plus, Sailboat } from 'lucide-react';
import { getOwnerBoats } from '../../services/boatService';
import { getOwnerBookings } from '../../services/bookingService';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import { useAuth } from '../../context/AuthContext';

const demoBoats = [
  {
    _id: 'demo-boat-1',
    title: 'Océanis 38 - Marseille',
    status: 'approved',
    pricePerDay: 320,
    images: ['https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=200'],
  },
  {
    _id: 'demo-boat-2',
    title: 'Catamaran Lagoon 42',
    status: 'pending',
    pricePerDay: 540,
    images: ['https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=200'],
  },
  {
    _id: 'demo-boat-3',
    title: 'Semi-rigide Cap Camarat',
    status: 'approved',
    pricePerDay: 210,
    images: ['https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=200'],
  },
];

const demoBookings = [
  {
    _id: 'demo-booking-1',
    status: 'pending',
    totalPrice: 960,
    startDate: '2026-07-12',
    boat: { title: 'Océanis 38 - Marseille' },
    tenant: { firstName: 'Jean', lastName: 'Martin' },
  },
  {
    _id: 'demo-booking-2',
    status: 'confirmed',
    totalPrice: 1620,
    startDate: '2026-07-20',
    boat: { title: 'Catamaran Lagoon 42' },
    tenant: { firstName: 'Sofia', lastName: 'Bernard' },
  },
  {
    _id: 'demo-booking-3',
    status: 'completed',
    totalPrice: 740,
    startDate: '2026-06-28',
    boat: { title: 'Semi-rigide Cap Camarat' },
    tenant: { firstName: 'Lucas', lastName: 'Petit' },
  },
];

const OwnerDashboardPage = () => {
  const { user }    = useAuth();
  const [boats,    setBoats]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getOwnerBoats(), getOwnerBookings()])
      .then(([boatsRes, bookingsRes]) => {
        setBoats(boatsRes.data || []);
        setBookings(bookingsRes.data || []);
      })
      .catch(() => {
        if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
          setBoats(demoBoats);
          setBookings(demoBookings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Chargement..." />;

  const pendingBookings  = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status)).length;
  const totalRevenue     = bookings.filter(b => ['confirmed', 'completed'].includes(b.status)).reduce((s, b) => s + (b.totalPrice || 0), 0);
  const activeBoats      = boats.filter(b => b.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
            Bonjour, {user?.firstName}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8896A8' }}>Voici un aperçu de votre activité.</p>
        </div>
        <Link
          to="/owner/boats/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
          style={{ background: '#00C6E0', color: '#07192E' }}
        >
          <Plus size={17} /> Ajouter un bateau
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Bateaux approuvés" value={activeBoats} icon={Sailboat} color="navy" />
        <DashboardCard title="En attente" value={pendingBookings} icon={CalendarClock} color="yellow" />
        <DashboardCard title="Confirmées / Terminées" value={confirmedBookings} icon={CheckCircle2} color="green" />
        <DashboardCard title="Revenus estimés" value={formatPrice(totalRevenue)} icon={Euro} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E', fontSize: 18 }}>
              Dernières réservations
            </h2>
            <Link to="/owner/bookings" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: '#00C6E0' }}>
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: '#8896A8' }}>Aucune réservation pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map(b => (
                <div key={b._id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #EDF1F5' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#07192E' }}>{b.boat?.title || 'Bateau supprimé'}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8896A8' }}>
                      {b.tenant?.firstName} {b.tenant?.lastName} · {formatDate(b.startDate)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My boats */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E', fontSize: 18 }}>
              Mes bateaux
            </h2>
            <Link to="/owner/boats" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: '#00C6E0' }}>
              Gérer <ArrowRight size={13} />
            </Link>
          </div>
          {boats.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm mb-4" style={{ color: '#8896A8' }}>Aucun bateau publié.</p>
              <Link to="/owner/boats/new" className="btn-ocean btn-sm">Ajouter un bateau</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {boats.slice(0, 4).map(boat => (
                <div key={boat._id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #EDF1F5' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={boat.images?.[0] || 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=100'}
                        alt={boat.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=100'; }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#07192E' }}>{boat.title}</p>
                      <p className="text-xs" style={{ color: '#8896A8' }}>{formatPrice(boat.pricePerDay)}/jour</p>
                    </div>
                  </div>
                  <StatusBadge status={boat.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
