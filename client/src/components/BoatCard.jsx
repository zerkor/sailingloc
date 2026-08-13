import { ArrowRight, CalendarDays, MapPin, Ruler, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FALLBACK_BOAT_IMAGE, getBoatImage } from '../utils/boatImages';
import { formatPrice } from '../utils/formatPrice';

export const BoatCardSkeleton = () => (
  <div
    className="animate-pulse overflow-hidden rounded-2xl border border-navy-900/[0.04] bg-white"
    style={{ boxShadow: 'var(--shadow-card)' }}
  >
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="space-y-3 p-5">
      <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
      <div className="h-5 w-2/3 rounded-full bg-gray-200" />
      <div className="h-3 w-1/2 rounded-full bg-gray-200" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-14 rounded-full bg-gray-100" />
        <div className="h-6 w-16 rounded-full bg-gray-100" />
        <div className="h-6 w-12 rounded-full bg-gray-100" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="h-6 w-20 rounded-full bg-gray-200" />
        <div className="h-8 w-20 rounded-full bg-gray-200" />
      </div>
    </div>
  </div>
);

const BoatCard = ({ boat }) => {
  const { t } = useTranslation();
  const imageUrl = getBoatImage(boat);
  const rating = boat.averageRating || 0;
  const reviewCount = boat.reviewCount || 0;
  const features = boat.features || [];
  const visible = features.slice(0, 3);
  const extra = features.length - visible.length;
  const isVerified = boat.owner?.verified === true;
  const detailPath = `/boats/${boat.slug || boat._id}`;

  return (
    <Link
      to={detailPath}
      aria-label={`Voir le bateau ${boat.title}, ${formatPrice(boat.pricePerDay)} ${t('common.perDay')}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-navy-900/[0.04] bg-white transition-all duration-300"
      style={{ boxShadow: 'var(--shadow-card)' }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = '0 18px 48px rgba(0,198,224,0.14), 0 8px 24px rgba(7,25,46,0.12)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-smoke">
        <img
          src={imageUrl}
          alt={boat.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            e.target.src = FALLBACK_BOAT_IMAGE;
          }}
          loading="lazy"
        />

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(7,25,46,0.65) 0%, transparent 55%)' }}
        />

        <div className="absolute left-3 top-3">
          <span
            className="rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1px] shadow-sm"
            style={{ background: 'rgba(0,198,224,0.95)', color: '#07192E', backdropFilter: 'blur(8px)' }}
          >
            {t(`boatTypes.${boat.type}`, boat.type)}
          </span>
        </div>

        {isVerified ? (
          <div className="absolute right-3 top-3">
            <span
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1px] shadow-sm"
              style={{ background: 'rgba(201,168,76,0.95)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              <Star size={12} fill="currentColor" aria-hidden="true" /> {t('common.verified')}
            </span>
          </div>
        ) : boat.skipperAvailable ? (
          <div className="absolute right-3 top-3">
            <span
              className="rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1px] shadow-sm"
              style={{ background: 'rgba(201,168,76,0.95)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              {t('common.skipper')}
            </span>
          </div>
        ) : null}

        {rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <Star size={14} fill="#F4A01A" color="#F4A01A" aria-hidden="true" />
            <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-white/65">
                ({reviewCount} {t('common.reviews')})
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex min-h-[280px] flex-col p-5">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: '#00C6E0' }}>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} /> {boat.port || boat.location}
          </span>
        </div>

        <h3
          className="mb-2 truncate text-xl font-bold leading-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
        >
          {boat.title}
        </h3>

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: '#8896A8' }}>
          {boat.capacity && (
            <span className="inline-flex items-center gap-1">
              <Users size={13} /> {boat.capacity} {t('common.personsShort')}
            </span>
          )}
          {boat.length && (
            <span className="inline-flex items-center gap-1">
              <Ruler size={13} /> {boat.length} m
            </span>
          )}
          {boat.year && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} /> {boat.year}
            </span>
          )}
        </div>

        {visible.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {visible.map((feature) => (
              <span
                key={feature}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{ background: 'rgba(0,198,224,0.1)', color: '#155374' }}
              >
                {feature}
              </span>
            ))}
            {extra > 0 && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{ background: '#EDF1F5', color: '#8896A8' }}
              >
                +{extra}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span
              className="text-lg font-bold sm:text-xl"
              style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
            >
              {formatPrice(boat.pricePerDay)}
            </span>
            <span className="ml-1 text-sm" style={{ color: '#8896A8' }}>
              {t('common.perDay')}
            </span>
          </div>
          <span className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-full bg-navy-900 px-4 py-2 text-center text-xs font-bold leading-none text-white transition-all duration-200 group-hover:bg-cyan-500 group-hover:text-navy-900 lg:w-auto">
            <span className="inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap">
              Voir le bateau <ArrowRight size={13} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BoatCard;
