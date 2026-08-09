import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Lock, Send, ShieldCheck, Star } from 'lucide-react';
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
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = new Date();
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const minDate = getMinDate();
  const priceCalc = calculatePrice(startDate, endDate, boat.pricePerDay);
  const unavailableRange = isRangeUnavailable(startDate, endDate, boat.unavailableDates);
  const unavailableSet = new Set(
    (boat.unavailableDates || []).map((date) => new Date(date).toISOString().slice(0, 10))
  );
  const todayIso = new Date().toISOString().slice(0, 10);
  const monthLabel = calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const calendarStart = new Date(calendarMonth);
  const firstWeekday = (calendarStart.getUTCDay() + 6) % 7;
  calendarStart.setUTCDate(calendarStart.getUTCDate() - firstWeekday);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setUTCDate(calendarStart.getUTCDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const past = iso < minDate;
    const unavailable = unavailableSet.has(iso);
    return {
      iso,
      label: date.getUTCDate(),
      unavailable,
      past,
      disabled: unavailable || past,
      outsideMonth: date.getUTCMonth() !== calendarMonth.getUTCMonth(),
      today: iso === todayIso,
      rangeStart: startDate === iso,
      rangeEnd: endDate === iso,
      selected: startDate && endDate && iso >= startDate && iso <= endDate,
      inRange: startDate && endDate && iso > startDate && iso < endDate,
    };
  });
  const rangeSelectionHint = startDate && !endDate ? "Selectionnez une date d'arrivee." : '';

  const changeCalendarMonth = (direction) => {
    setCalendarMonth((current) => {
      const next = new Date(current);
      next.setUTCMonth(next.getUTCMonth() + direction);
      return next;
    });
  };

  const handleDateClick = (day) => {
    if (day.disabled) return;
    setError('');

    if (!startDate || (startDate && endDate) || day.iso <= startDate) {
      setStartDate(day.iso);
      setEndDate('');
      return;
    }

    if (isRangeUnavailable(startDate, day.iso, boat.unavailableDates)) {
      setEndDate('');
      setError('Certaines dates de cette periode ne sont pas disponibles.');
      return;
    }

    setEndDate(day.iso);
  };

  const handleStartDateChange = (value) => {
    setError('');
    setStartDate(value);
    if (endDate && value >= endDate) setEndDate('');
    if (value) {
      const next = new Date(value);
      setCalendarMonth(new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), 1)));
    }
  };

  const handleEndDateChange = (value) => {
    setError('');
    if (startDate && value && value <= startDate) {
      setStartDate(value);
      setEndDate('');
      return;
    }
    if (value && isRangeUnavailable(startDate, value, boat.unavailableDates)) {
      setEndDate('');
      setError('Certaines dates de cette periode ne sont pas disponibles.');
      return;
    }
    setEndDate(value);
  };

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
                onChange={(e) => handleStartDateChange(e.target.value)}
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
                onChange={(e) => handleEndDateChange(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="booking-calendar">
            <div className="booking-calendar__head">
              <span>Disponibilités</span>
              <div className="booking-calendar__month">
                <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Mois precedent">
                  <ChevronLeft size={15} />
                </button>
                <small>{monthLabel}</small>
                <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Mois suivant">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <div className="booking-calendar__weekdays" aria-hidden="true">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((weekday, index) => (
                <span key={`${weekday}-${index}`}>{weekday}</span>
              ))}
            </div>
            <div className="booking-calendar__grid" aria-label="Calendrier de disponibilité">
              {calendarDays.map((day) => (
                <button
                  type="button"
                  key={day.iso}
                  onClick={() => handleDateClick(day)}
                  title={day.disabled ? 'Indisponible' : day.selected ? 'Sélectionné' : 'Disponible'}
                  aria-label={`${day.label} - ${
                    day.disabled ? 'indisponible' : day.selected ? 'sélectionné' : 'disponible'
                  }`}
                  aria-selected={Boolean(day.selected || day.rangeStart || day.rangeEnd)}
                  aria-pressed={Boolean(day.selected || day.rangeStart || day.rangeEnd)}
                  disabled={day.disabled}
                  className={[
                    'booking-calendar__day',
                    day.outsideMonth ? 'is-outside-month' : '',
                    day.unavailable ? 'is-unavailable' : '',
                    day.past ? 'is-past' : '',
                    day.inRange ? 'is-in-range' : '',
                    day.selected ? 'is-selected' : '',
                    day.rangeStart ? 'is-range-start' : '',
                    day.rangeEnd ? 'is-range-end' : '',
                    day.today ? 'is-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span>{day.label}</span>
                </button>
              ))}
            </div>
            <div className="booking-calendar__legend" aria-label="Légende du calendrier">
              <span>
                <i className="is-available" /> Disponible
              </span>
              <span>
                <i className="is-unavailable" /> Indisponible
              </span>
              <span>
                <i className="is-selected" /> Sélectionné
              </span>
            </div>
          </div>

          {rangeSelectionHint && <p className="booking-calendar__hint">{rangeSelectionHint}</p>}

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
          {unavailableRange && <ErrorMessage message="Certaines dates sélectionnées ne sont pas disponibles." />}

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
