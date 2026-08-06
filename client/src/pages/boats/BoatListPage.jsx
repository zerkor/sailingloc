import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Sailboat, X } from 'lucide-react';
import BoatCard from '../../components/BoatCard';
import Breadcrumb from '../../components/Breadcrumb';
import FilterSidebar from '../../components/FilterSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBoats } from '../../services/boatService';

const BoatListPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
    skipperAvailable: false,
  });

  const fetchBoats = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.capacity) params.capacity = filters.capacity;
      if (filters.skipperAvailable) params.skipperAvailable = true;
      const { data } = await getBoats(params);
      const boatList = data.boats || data || [];
      setBoats(boatList);
      setTotal(data.total || boatList.length);
    } catch {
      setBoats([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  const resetFilters = () =>
    setFilters({
      location: '',
      type: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
      skipperAvailable: false,
    });

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>
      <div
        className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-14 lg:px-10 xl:px-14"
        style={{ background: 'linear-gradient(135deg, #07192E 0%, #155374 100%)' }}
      >
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full"
          style={{ background: 'rgba(0,198,224,0.06)' }}
        />
        <div className="container-max relative">
          <Breadcrumb className="site-breadcrumb--light" items={[{ label: 'Bateaux' }]} />
          <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>
            {t('boats.catalog')}
          </span>
          <h1
            className="mb-2 leading-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px,5vw,52px)',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {t('boats.titleA')}
            <br />
            {t('boats.titleB')}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('boats.listingCount', { count: total })} · {t('boats.zone')}
          </p>
        </div>
      </div>

      <div
        className="boats-filter-bar sticky z-30 flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-10 xl:px-14"
        style={{
          top: 76,
          background: '#fff',
          borderBottom: '1px solid rgba(7,25,46,0.08)',
          boxShadow: '0 2px 16px rgba(7,25,46,0.06)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="mobile-boat-filters"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all lg:hidden"
          style={{ border: '1.5px solid rgba(7,25,46,0.15)', color: '#07192E' }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          {t('common.filters')} {showFilters ? '▲' : '▼'}
        </button>

        <div className="hidden flex-1 flex-wrap items-center gap-2 lg:flex">
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            aria-label={t('boatTypes.label')}
            className="cursor-pointer rounded-full border px-4 py-2 text-sm font-medium outline-none transition-all"
            style={{ border: '1.5px solid rgba(7,25,46,0.12)', color: '#07192E', background: '#fff' }}
          >
            <option value="">{t('boatTypes.label')}</option>
            <option value="sailboat">{t('boatTypes.sailboat')}</option>
            <option value="motorboat">{t('boatTypes.motorboat')}</option>
            <option value="catamaran">{t('boatTypes.catamaran')}</option>
            <option value="rib">{t('boatTypes.rib')}</option>
          </select>

          <select
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            aria-label={t('boats.budget')}
            className="cursor-pointer rounded-full border px-4 py-2 text-sm font-medium outline-none transition-all"
            style={{ border: '1.5px solid rgba(7,25,46,0.12)', color: '#07192E', background: '#fff' }}
          >
            <option value="">{t('boats.budget')}</option>
            <option value="0">{t('boats.budgetLow')}</option>
            <option value="200">{t('boats.budgetMid')}</option>
            <option value="500">{t('boats.budgetHigh')}</option>
          </select>

          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, skipperAvailable: !f.skipperAvailable }))}
            aria-pressed={filters.skipperAvailable}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
            style={
              filters.skipperAvailable
                ? { background: '#07192E', color: '#fff', border: '1.5px solid #07192E' }
                : { border: '1.5px solid rgba(7,25,46,0.12)', color: '#07192E', background: '#fff' }
            }
          >
            {t('boats.withSkipper')}
          </button>

          {(filters.type ||
            filters.location ||
            filters.startDate ||
            filters.endDate ||
            filters.minPrice ||
            filters.skipperAvailable) && (
            <button
              type="button"
              onClick={resetFilters}
              aria-label={t('common.clear')}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all"
              style={{ color: '#00C6E0', background: 'rgba(0,198,224,0.08)' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <X size={14} /> {t('common.clear')}
              </span>
            </button>
          )}
        </div>

        <span className="ml-auto whitespace-nowrap text-sm" style={{ color: '#8896A8' }}>
          {t('boats.boatCount', { count: total })}
        </span>
      </div>

      <div className="container-max section-padding">
        {showFilters && (
          <div
            id="mobile-boat-filters"
            className="mb-6 rounded-2xl bg-white p-5 lg:hidden"
            style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
          >
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>
        )}

        <div className="flex min-w-0 gap-8">
          <div className="hidden w-64 flex-shrink-0 lg:block">
            <div
              className="sticky rounded-2xl bg-white p-5"
              style={{ top: 140, boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
            >
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {loading ? (
              <LoadingSpinner text={t('boats.loading')} />
            ) : boats.length === 0 ? (
              <div className="py-20 text-center">
                <Sailboat size={48} className="mx-auto mb-4" color="#00C6E0" />
                <h3 className="mb-2 text-xl font-bold" style={{ color: '#07192E' }}>
                  {t('boats.emptyTitle')}
                </h3>
                <p className="text-sm" style={{ color: '#8896A8' }}>
                  {t('boats.emptyText')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {boats.map((boat) => (
                  <BoatCard key={boat._id} boat={boat} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatListPage;
