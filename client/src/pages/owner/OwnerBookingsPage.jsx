import { useState, useEffect } from 'react';
import { getOwnerBookings, acceptBooking, rejectBooking, completeBooking } from '../../services/bookingService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';

const OwnerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await getOwnerBookings();
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAccept = async (id) => {
    try { await acceptBooking(id); fetchBookings(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const handleReject = async (id) => {
    if (!confirm('Refuser cette réservation ?')) return;
    try { await rejectBooking(id); fetchBookings(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const handleComplete = async (id) => {
    if (!confirm('Marquer cette réservation comme terminée ?')) return;
    try { await completeBooking(id); fetchBookings(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const statusFilters = ['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'];
  const filterLabel   = {
    all: 'Toutes', pending: 'En attente', accepted: 'Acceptées',
    rejected: 'Refusées', completed: 'Terminées', cancelled: 'Annulées',
  };
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <LoadingSpinner text="Chargement des réservations…" />;

  return (
    <div className="space-y-6">
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
        Réservations
      </h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={filter === s
              ? { background: '#07192E', color: '#fff' }
              : { background: '#fff', color: '#3D4D61', border: '1.5px solid rgba(7,25,46,0.15)' }
            }
          >
            {filterLabel[s]}{' '}
            <span style={{ opacity: 0.65 }}>
              ({s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm" style={{ color: '#8896A8' }}>Aucune réservation dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div
              key={booking._id}
              className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4"
              style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
            >
              {/* Thumbnail */}
              <div className="sm:w-24 h-20 sm:h-auto rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={booking.boat?.images?.[0] || 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=150'}
                  alt={booking.boat?.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=150'; }}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-base" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
                    {booking.boat?.title || 'Bateau supprimé'}
                  </h3>
                  <StatusBadge status={booking.status} />
                </div>

                <p className="text-sm mb-0.5" style={{ color: '#3D4D61' }}>
                  Locataire : <strong>{booking.tenant?.firstName} {booking.tenant?.lastName}</strong>
                </p>
                <p className="text-sm mb-1" style={{ color: '#8896A8' }}>
                  📅 {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                </p>
                <p className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
                  {formatPrice(booking.totalPrice)}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(booking._id)}
                        className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                        style={{ background: '#00C6E0', color: '#07192E' }}
                      >
                        ✓ Accepter
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                      >
                        ✕ Refuser
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleComplete(booking._id)}
                      className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                      style={{ background: '#EDF1F5', color: '#07192E', border: '1px solid rgba(7,25,46,0.1)' }}
                    >
                      ✓ Marquer terminée
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBookingsPage;
