import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { calculatePrice, getMinDate } from '../utils/bookingUtils';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

const BookingForm = ({ boat }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  const minDate  = getMinDate();
  const priceCalc = calculatePrice(startDate, endDate, boat.pricePerDay);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)                 { navigate('/login'); return; }
    if (user.role !== 'tenant') { setError('Seuls les locataires peuvent effectuer une réservation.'); return; }
    setLoading(true);
    setError('');
    try {
      await createBooking({ boatId: boat._id, startDate, endDate });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl p-8 text-center" style={{ background: '#fff', boxShadow: '0 12px 48px rgba(7,25,46,0.14)', border: '1px solid rgba(7,25,46,0.06)' }}>
        <div className="text-4xl mb-3">✅</div>
        <p className="font-bold text-lg" style={{ color: '#07192E', fontFamily: "'Playfair Display', serif" }}>Réservation envoyée !</p>
        <p className="text-sm mt-1" style={{ color: '#8896A8' }}>Redirection vers vos réservations…</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl p-7 sticky"
      style={{ top: 96, background: '#fff', boxShadow: '0 12px 48px rgba(7,25,46,0.14)', border: '1px solid rgba(7,25,46,0.06)' }}
    >
      {/* Price header */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, color: '#07192E', lineHeight: 1 }}>
          {formatPrice(boat.pricePerDay)}
        </span>
        <span className="text-sm" style={{ color: '#8896A8' }}>/jour</span>
      </div>

      {boat.averageRating > 0 && (
        <div className="flex items-center gap-1.5 mb-5 text-sm" style={{ color: '#3D4D61' }}>
          <span style={{ color: '#F4A01A' }}>★</span>
          <span>{boat.averageRating.toFixed(1)}</span>
        </div>
      )}

      <div className="mb-5" style={{ borderTop: '1px solid #EDF1F5', paddingTop: 20 }} />

      {!user ? (
        <div className="text-center py-2">
          <p className="text-sm mb-4" style={{ color: '#3D4D61' }}>Connectez-vous pour réserver ce bateau</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: '#00C6E0', color: '#07192E' }}
          >
            Se connecter
          </button>
        </div>
      ) : user.role !== 'tenant' ? (
        <p className="text-sm text-center py-4" style={{ color: '#8896A8' }}>
          {user.role === 'owner' ? 'Les propriétaires ne peuvent pas réserver.' : 'Seuls les locataires peuvent réserver.'}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date fields */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3 transition-all"
              style={{ background: '#EDF1F5', border: '1.5px solid transparent' }}
              onFocus={e => e.currentTarget.style.borderColor = '#00C6E0'}
              onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <label htmlFor="startDate" className="block text-[9px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: '#8896A8' }}>
                Arrivée
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                min={minDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
                style={{ color: '#07192E' }}
                required
              />
            </div>
            <div
              className="rounded-xl p-3 transition-all"
              style={{ background: '#EDF1F5', border: '1.5px solid transparent' }}
            >
              <label htmlFor="endDate" className="block text-[9px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: '#8896A8' }}>
                Départ
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || minDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
                style={{ color: '#07192E' }}
                required
              />
            </div>
          </div>

          {/* Price breakdown */}
          {priceCalc && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: '#EDF1F5' }}>
              <div className="flex justify-between text-sm" style={{ color: '#8896A8' }}>
                <span>{formatPrice(boat.pricePerDay)} × {priceCalc.numberOfDays} jour{priceCalc.numberOfDays > 1 ? 's' : ''}</span>
                <span>{formatPrice(priceCalc.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#8896A8' }}>
                <span>Frais de service (10 %)</span>
                <span>{formatPrice(priceCalc.serviceFee)}</span>
              </div>
              <div
                className="flex justify-between font-bold text-sm pt-3 mt-1"
                style={{ borderTop: '1px solid rgba(7,25,46,0.1)', color: '#07192E' }}
              >
                <span>Total</span>
                <span>{formatPrice(priceCalc.totalPrice)}</span>
              </div>
            </div>
          )}

          <ErrorMessage message={error} />

          <button
            type="submit"
            disabled={loading || !startDate || !endDate}
            className="w-full py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#00C6E0', color: '#07192E' }}
          >
            {loading ? 'Envoi en cours…' : 'Réserver maintenant 🚀'}
          </button>
          <p className="text-xs text-center" style={{ color: '#8896A8' }}>🔒 Paiement sécurisé · Annulation flexible</p>
        </form>
      )}

      {/* Trust */}
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid #EDF1F5' }}>
        <div className="flex items-start gap-2 text-xs" style={{ color: '#8896A8' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#00C6E0' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Les documents du propriétaire sont vérifiés avant la publication de l'annonce.</span>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
