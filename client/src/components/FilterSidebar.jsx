import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FilterSidebar = ({ filters, onChange }) => {
  const { t } = useTranslation();
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

  const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-wider';
  const labelStyle = { color: '#3D4D61' };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
          {t('common.filters')}
        </h2>
        <button
          onClick={handleReset}
          className="text-xs font-semibold transition-colors hover:underline"
          style={{ color: '#00C6E0' }}
        >
          {t('common.reset')}
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass} style={labelStyle}>
            {t('home.destination')}
          </label>
          <input
            type="text"
            placeholder={t('boats.locationPlaceholder')}
            value={localFilters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="input-field text-sm"
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            {t('boatTypes.label')}
          </label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="input-field text-sm"
          >
            <option value="">{t('boatTypes.allLong')}</option>
            <option value="sailboat">{t('boatTypes.sailboat')}</option>
            <option value="motorboat">{t('boatTypes.motorboat')}</option>
            <option value="catamaran">{t('boatTypes.catamaran')}</option>
            <option value="rib">{t('boatTypes.rib')}</option>
          </select>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            {t('boats.pricePerDay')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder={t('boats.min')}
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input-field text-sm"
              min="0"
            />
            <input
              type="number"
              placeholder={t('boats.max')}
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input-field text-sm"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            {t('boats.capacity')}
          </label>
          <input
            type="number"
            placeholder={t('boats.minimum')}
            value={localFilters.capacity || ''}
            onChange={(e) => handleChange('capacity', e.target.value)}
            className="input-field text-sm"
            min="1"
          />
        </div>

        <label
          className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all"
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
            className="h-4 w-4 rounded"
            style={{ accentColor: '#00C6E0' }}
          />
          <span className="text-sm font-medium" style={{ color: '#07192E' }}>
            {t('boats.skipperAvailable')}
          </span>
        </label>
      </div>
    </div>
  );
};

export default FilterSidebar;
