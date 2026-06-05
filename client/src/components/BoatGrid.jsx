// src/components/BoatGrid.jsx
import BoatCard, { BoatCardSkeleton } from './BoatCard';

const AnchorIllustration = () => (
  <svg viewBox="0 0 100 120" width="120" height="120" fill="none" aria-hidden="true">
    <circle cx="50" cy="18" r="10" stroke="#00C6E0" strokeWidth="3" />
    <line x1="50" y1="28" x2="50" y2="90" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="48" x2="78" y2="48" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 90 Q50 110 78 90" stroke="#00C6E0" strokeWidth="3" fill="none" strokeLinecap="round" />
    <line x1="22" y1="76" x2="22" y2="90" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
    <line x1="78" y1="76" x2="78" y2="90" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/**
 * @param {{ boats: object[], loading?: boolean }} props
 */
const BoatGrid = ({ boats = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <BoatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (boats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div style={{ opacity: 0.25 }}>
          <AnchorIllustration />
        </div>
        <p className="text-base font-medium" style={{ color: '#8896A8' }}>
          Aucun bateau disponible pour ce type
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {boats.map(boat => (
        <BoatCard key={boat._id} boat={boat} />
      ))}
    </div>
  );
};

export default BoatGrid;
