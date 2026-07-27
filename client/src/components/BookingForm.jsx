import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, Send, ShieldCheck, Star } from 'lucide-react';
import { createBooking } from '../services/bookingService';
import { calculatePrice, getMinDate, isRangeUnavailable } from '../utils/bookingUtils';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

const BookingForm = ({ boat }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const minDate = getMinDate();
  const priceCalc = calculatePrice(startDate, endDate, boat.pricePerDay);
  const unavailableRange = isRangeUnavailable(startDate, endDate, boat.unavailableDates);
  const unavailableSet = new Set(
    (boat.unavailableDates || []).map((date) => new Date(date).toISOString().slice(0, 10))
  );
  const calendarDays = Array.from({ length: 21 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      label: date.getDate(),
      unavailable: unavailableSet.has(iso),
      selected: startDate && endDate && iso >= startDate && iso <= endDate,
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      setError('Seuls les locataires peuvent effectuer une réservation.');
      return;
    }
    if (unavailableRange) {
      setError('Ce bateau est indisponible sur au moins une des dates sélectionnées.');
      return;
    }
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
      <div className="booking-card booking-card--success">
        <CheckCircle2 size={44} className="mx-auto mb-3" color="#137A43" />
        <p>Réservation envoyée !</p>
        <span>Redirection vers vos réservations...</span>
      </div>
    );
  }

  return (
    <div className="booking-card">
      <div className="booking-card__top">
        <div>
          <span>Réservation</span>
          <strong>Demande sécurisée</strong>
        </div>
        <span className="booking-card__brand">SailingLoc</span>
      </div>

      <div className="booking-card__price">
        <strong>{formatPrice(boat.pricePerDay)}</strong>
        <span>/ jour</span>
      </div>

      {boat.averageRating > 0 && (
        <div className="booking-card__rating">
          <Star size={15} fill="#F4A01A" color="#F4A01A" />
          <span>{boat.averageRating.toFixed(1)} sur 5</span>
        </div>
      )}

      {!user ? (
        <div className="booking-card__message">
          <p>Connectez-vous pour réserver ce bateau.</p>
          <button type="button" onClick={() => navigate('/login')}>
            Se connecter
          </button>
        </div>
      ) : user.role !== 'tenant' ? (
        <div className="booking-card__message">
          <p>{user.role === 'owner' ? 'Les propriétaires ne peuvent pas réserver.' : 'Seuls les locataires peuvent réserver.'}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="booking-card__form">
          <div className="booking-card__dates">
            <label>
              <span>Départ</span>
              <input
                id="startDate"
                type="date"
                value={startDate}
                min={minDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Retour</span>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || minDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="booking-calendar">
            <div className="booking-calendar__head">
              <span>Disponibilités</span>
              <small>21 prochains jours</small>
            </div>
            <div className="booking-calendar__grid" aria-label="Calendrier de disponibilité">
              {calendarDays.map((day) => (
                <div
                  key={day.iso}
                  title={day.unavailable ? 'Indisponible' : 'Disponible'}
                  className={day.unavailable ? 'is-unavailable' : day.selected ? 'is-selected' : ''}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>

          {priceCalc && (
            <div className="booking-summary">
              <div>
                <span>
                  {formatPrice(boat.pricePerDay)} x {priceCalc.numberOfDays} jour
                  {priceCalc.numberOfDays > 1 ? 's' : ''}
                </span>
                <strong>{formatPrice(priceCalc.subtotal)}</strong>
              </div>
              <div>
                <span>Frais de service</span>
                <strong>{formatPrice(priceCalc.serviceFee)}</strong>
              </div>
              <div className="booking-summary__total">
                <span>Total estimé</span>
                <strong>{formatPrice(priceCalc.totalPrice)}</strong>
              </div>
            </div>
          )}

          <ErrorMessage message={error} />
          {unavailableRange && <ErrorMessage message="Ce bateau est indisponible sur au moins une des dates sélectionnées." />}

          <button
            type="submit"
            disabled={loading || !startDate || !endDate || unavailableRange}
            className="booking-card__cta"
          >
            {loading ? (
              'Envoi en cours...'
            ) : (
              <>
                <Send size={16} /> Réserver ce bateau
              </>
            )}
          </button>
        </form>
      )}

      <div className="booking-card__trust">
        <span>
          <Lock size={14} /> Paiement sécurisé
        </span>
        <span>
          <ShieldCheck size={14} /> Documents vérifiés
        </span>
        <span>Annulation selon conditions</span>
      </div>
    </div>
  );
};

export default BookingForm;
