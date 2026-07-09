import { useState } from 'react';

const FilterSidebar = ({ filters, onChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleReset = () => {
    const reset = { location: '', type: '', minPrice: '', maxPrice: '', capacity: '', skipperAvailable: false };
    setLocalFilters(reset);
    onChange(reset);
  };

  const labelClass = 'block text-xs font-bold uppercase tracking-wider mb-2';
  const labelStyle = { color: '#3D4D61' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
          Filtres
        </h2>
        <button
          onClick={handleReset}
          className="text-xs font-semibold transition-colors hover:underline"
          style={{ color: '#00C6E0' }}
        >
          Réinitialiser
        </button>
      </div>

      <div className="space-y-5">
        {/* Location */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Destination
          </label>
          <input
            type="text"
            placeholder="Ville ou port…"
            value={localFilters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Type */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Type de bateau
          </label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="input-field text-sm"
          >
            <option value="">Tous les types</option>
            <option value="sailboat">Voilier</option>
            <option value="motorboat">Bateau à moteur</option>
            <option value="catamaran">Catamaran</option>
            <option value="rib">Semi-rigide</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Prix par jour (€)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input-field text-sm"
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input-field text-sm"
              min="0"
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Capacité (pers.)
          </label>
          <input
            type="number"
            placeholder="Minimum"
            value={localFilters.capacity || ''}
            onChange={(e) => handleChange('capacity', e.target.value)}
            className="input-field text-sm"
            min="1"
          />
        </div>

        {/* Skipper */}
        <label
          className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all"
          style={
            localFilters.skipperAvailable
              ? { background: 'rgba(0,198,224,0.1)', border: '1.5px solid rgba(0,198,224,0.3)' }
              : { background: '#EDF1F5', border: '1.5px solid transparent' }
          }
        >
          <input
            id="skipper"
            type="checkbox"
            checked={localFilters.skipperAvailable || false}
            onChange={(e) => handleChange('skipperAvailable', e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: '#00C6E0' }}
          />
          <span className="text-sm font-medium" style={{ color: '#07192E' }}>
            Skipper disponible
          </span>
        </label>
      </div>
    </div>
  );
};

export default FilterSidebar;
