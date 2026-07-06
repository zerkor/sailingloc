// src/components/BoatCard.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Ruler, Star, Users } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { buildBoatSlug } from '../utils/slugifyBoat';

const typeLabels = {
  sailboat:   'Voilier',
  motorboat:  'Moteur',
  catamaran:  'Catamaran',
  rib:        'Yacht / Rigid',
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
export const BoatCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.06)' }}>
    <div className="bg-gray-200" style={{ height: 220 }} />
    <div className="p-5 space-y-3">
      <div className="h-2.5 bg-gray-200 rounded-full w-1/3" />
      <div className="h-5 bg-gray-200 rounded-full w-2/3" />
      <div className="h-3 bg-gray-200 rounded-full w-1/2" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 bg-gray-100 rounded-full w-14" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-12" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-8 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
const BoatCard = ({ boat }) => {
  const imageUrl    = boat.images?.[0] || 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80&auto=format&fit=crop';
  const rating      = boat.averageRating || 0;
  const reviewCount = boat.reviewCount   || 0;
  const features    = boat.features      || [];
  const visible     = features.slice(0, 3);
  const extra       = features.length - visible.length;
  const isVerified  = boat.owner?.verified === true;

  const filledStars = Math.round(rating);

  return (
    <Link
      to={`/bateaux/${buildBoatSlug(boat)}`}
      className="group block bg-white rounded-2xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,198,224,0.15), 0 8px 24px rgba(7,25,46,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(7,25,46,0.08)')}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={imageUrl}
          alt={boat.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80'; }}
          loading="lazy"
        />

        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,25,46,0.65) 0%, transparent 55%)' }} />

        {/* Type badge — top left */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-extrabold uppercase tracking-[1px] px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,198,224,0.95)', color: '#07192E', backdropFilter: 'blur(8px)' }}
          >
            {typeLabels[boat.type] || boat.type}
          </span>
        </div>

        {/* Verified / Skipper badge — top right */}
        {isVerified ? (
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-extrabold uppercase tracking-[1px] px-3 py-1.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(201,168,76,0.95)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              <Star size={12} fill="currentColor" /> Vérifié
            </span>
          </div>
        ) : boat.skipperAvailable ? (
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-extrabold uppercase tracking-[1px] px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.95)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              Skipper
            </span>
          </div>
        ) : null}

        {/* Rating — bottom left */}
        {rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <Star size={14} fill="#F4A01A" color="#F4A01A" />
            <span className="text-white text-sm font-semibold">{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span className="text-white/65 text-xs">({reviewCount} avis)</span>}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: '#00C6E0' }}>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} /> {boat.port || boat.location}
          </span>
        </div>

        <h3
          className="font-bold text-xl leading-tight truncate mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
        >
          {boat.title}
        </h3>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: '#8896A8' }}>
          {boat.capacity && <span className="inline-flex items-center gap-1"><Users size={13} /> {boat.capacity} pers.</span>}
          {boat.length && <span className="inline-flex items-center gap-1"><Ruler size={13} /> {boat.length} m</span>}
          {boat.year && <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {boat.year}</span>}
        </div>

        {/* Features */}
        {visible.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visible.map(f => (
              <span
                key={f}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,198,224,0.1)', color: '#155374' }}
              >
                {f}
              </span>
            ))}
            {extra > 0 && (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#EDF1F5', color: '#8896A8' }}
              >
                +{extra}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
            >
              {formatPrice(boat.pricePerDay)}
            </span>
            <span className="text-sm ml-1" style={{ color: '#8896A8' }}>/jour</span>
          </div>
          <span
            className="text-xs font-bold px-4 py-2 rounded-full transition-all duration-200"
            style={{ background: '#07192E', color: '#fff' }}
          >
            <span className="inline-flex items-center gap-1">
              Voir <ArrowRight size={13} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BoatCard;
