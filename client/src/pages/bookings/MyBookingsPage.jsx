import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CreditCard, MessageSquareText } from 'lucide-react';
import { getTenantBookings, cancelBooking, payBooking } from '../../services/bookingService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReviewForm from '../../components/ReviewForm';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import Modal from '../../components/Modal';
import { useUiFeedback } from '../../components/ToastProvider';
import { FALLBACK_BOAT_IMAGE, getBoatImage } from '../../utils/boatImages';

const MyBookingsPage = () => {
  const { toast, requestApproval } = useUiFeedback();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await getTenantBookings();
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (
      !(await requestApproval('Annuler cette réservation ?', {
        title: 'Annulation',
        variant: 'danger',
        confirmLabel: 'Annuler',
      }))
    )
      return;
    try {
      await cancelBooking(id);
      fetchBookings();
      toast('Réservation annulée.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || "Erreur lors de l'annulation.", 'error');
    }
  };

  const handlePay = async (id) => {
    try {
      await payBooking(id);
      fetchBookings();
      toast('Paiement simulé avec succès.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur lors du paiement.', 'error');
    }
  };

  const paymentStyle = (paymentStatus) => {
    if (paymentStatus === 'paid') return { background: 'rgba(22,163,74,0.1)', color: '#166534' };
    if (paymentStatus === 'refunded') return { background: 'rgba(220,38,38,0.08)', color: '#991b1b' };
    return { background: 'rgba(234,179,8,0.1)', color: '#854d0e' };
  };

  const paymentLabel = (paymentStatus) => {
    if (paymentStatus === 'paid') return 'Payé';
    if (paymentStatus === 'refunded') return 'Remboursé';
    return 'Non payé';
  };

  if (loading) return <LoadingSpinner text="Chargement de vos réservations..." />;

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>
      <div className="container-max section-padding">
        <h1
          className="mb-8"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: '#07192E' }}
        >
          Mes réservations
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays size={48} className="mx-auto mb-4" color="#00C6E0" />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#07192E' }}>
              Aucune réservation
            </h3>
            <p className="text-sm mb-6" style={{ color: '#8896A8' }}>
              Vous n'avez pas encore effectué de réservation.
            </p>
            <Link to="/boats" className="btn-primary">
              Explorer les bateaux
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4"
                style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
              >
                {/* Image */}
                <div className="sm:w-32 h-24 sm:h-28 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={getBoatImage(booking.boat)}
                    alt={booking.boat?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = FALLBACK_BOAT_IMAGE;
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <Link
                      to={`/boats/${booking.boat?._id}`}
                      className="font-bold text-lg hover:underline"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
                    >
                      {booking.boat?.title || 'Bateau supprimé'}
                    </Link>
                    <StatusBadge status={booking.status} />
                  </div>

                  <p className="text-sm mb-3" style={{ color: '#8896A8' }}>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} /> {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </span>
                    &nbsp;·&nbsp; {booking.numberOfDays} jour{booking.numberOfDays > 1 ? 's' : ''}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span
                        className="text-xl font-bold"
                        style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
                      >
                        {formatPrice(booking.totalPrice)}
                      </span>
                      <span
                        className="text-xs ml-2 px-2 py-0.5 rounded-full"
                        style={paymentStyle(booking.paymentStatus)}
                      >
                        {paymentLabel(booking.paymentStatus)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => handlePay(booking._id)}
                          className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                          style={{ background: '#00C6E0', color: '#07192E' }}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <CreditCard size={14} /> Payer maintenant
                          </span>
                        </button>
                      )}
                      {['pending', 'accepted', 'confirmed'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                        >
                          Annuler
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                          style={{ background: '#EDF1F5', color: '#07192E', border: '1px solid rgba(7,25,46,0.1)' }}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <MessageSquareText size={14} /> Laisser un avis
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!reviewBooking} onClose={() => setReviewBooking(null)} title="Laisser un avis">
        {reviewBooking && (
          <ReviewForm
            boatId={reviewBooking.boat?._id}
            bookingId={reviewBooking._id}
            onSuccess={() => {
              setReviewBooking(null);
              fetchBookings();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
