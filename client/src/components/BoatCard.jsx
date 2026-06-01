import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

const typeLabels = {
  sailboat:   'Voilier',
  motorboat:  'Moteur',
  catamaran:  'Catamaran',
  rib:        'Semi-rigide',
};

const BoatCard = ({ boat }) => {
  const imageUrl = boat.images?.[0] || 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80&auto=format&fit=crop';

  const rating      = boat.averageRating || 0;
  const reviewCount = boat.reviewCount   || 0;

  return (
    <Link
      to={`/boats/${boat._id}`}
      className="group block bg-white rounded-2xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 48px rgba(7,25,46,0.16)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(7,25,46,0.08)')}
    >
      {/* Image wrapper */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={imageUrl}
          alt={boat.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80'; }}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,25,46,0.6) 0%, transparent 55%)' }} />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-extrabold uppercase tracking-[1px] px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,198,224,0.95)', color: '#07192E', backdropFilter: 'blur(8px)' }}
          >
            {typeLabels[boat.type] || boat.type}
          </span>
        </div>

        {/* Skipper badge */}
        {boat.skipperAvailable && (
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-extrabold uppercase tracking-[1px] px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.95)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              Skipper
            </span>
          </div>
        )}

        {/* Rating overlay (bottom left) */}
        {rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span style={{ color: '#F4A01A', fontSize: 14 }}>★</span>
            <span className="text-white text-sm font-semibold">{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span className="text-white/70 text-xs">({reviewCount})</span>}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <div
          className="text-[10px] font-bold uppercase tracking-[1.5px] mb-1.5"
          style={{ color: '#00C6E0' }}
        >
          {boat.port || boat.location}
        </div>

        <h3
          className="font-bold text-xl leading-tight truncate mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
        >
          {boat.title}
        </h3>

        <div className="flex items-center gap-1 text-sm mb-4" style={{ color: '#8896A8' }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{boat.location}</span>
          {boat.capacity && (
            <>
              <span className="mx-1">·</span>
              <span>{boat.capacity} pers.</span>
            </>
          )}
        </div>

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
            className="text-xs font-bold px-4 py-2 rounded-full transition-colors duration-200 group-hover:opacity-90"
            style={{ background: '#07192E', color: '#fff' }}
          >
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BoatCard;
