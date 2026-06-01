import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoatCard from '../../components/BoatCard';
import FilterSidebar from '../../components/FilterSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBoats } from '../../services/boatService';

const BoatListPage = () => {
  const [searchParams] = useSearchParams();
  const [boats,       setBoats]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location:        searchParams.get('location') || '',
    type:            searchParams.get('type')     || '',
    minPrice:        '',
    maxPrice:        '',
    capacity:        '',
    skipperAvailable: false,
  });

  const fetchBoats = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location)        params.location        = filters.location;
      if (filters.type)            params.type            = filters.type;
      if (filters.minPrice)        params.minPrice        = filters.minPrice;
      if (filters.maxPrice)        params.maxPrice        = filters.maxPrice;
      if (filters.capacity)        params.capacity        = filters.capacity;
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

  useEffect(() => { fetchBoats(); }, [fetchBoats]);

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div
        className="relative overflow-hidden px-4 sm:px-6 lg:px-14 py-14"
        style={{ background: 'linear-gradient(135deg, #07192E 0%, #155374 100%)' }}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: 'rgba(0,198,224,0.06)' }} />
        <div className="container-max relative">
          <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>Catalogue</span>
          <h1
            className="mb-2 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#fff' }}
          >
            Tous nos bateaux<br />disponibles
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {total} annonce{total !== 1 ? 's' : ''} · France & Europe
          </p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div
        className="sticky z-30 px-4 sm:px-6 lg:px-14 py-3 flex flex-wrap items-center gap-3"
        style={{ top: 76, background: '#fff', borderBottom: '1px solid rgba(7,25,46,0.08)', boxShadow: '0 2px 16px rgba(7,25,46,0.06)' }}
      >
        {/* Mobile toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all"
          style={{ border: '1.5px solid rgba(7,25,46,0.15)', color: '#07192E' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtres {showFilters ? '▲' : '▼'}
        </button>

        {/* Desktop quick filters */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap flex-1">
          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            className="px-4 py-2 rounded-full border text-sm font-medium cursor-pointer outline-none transition-all"
            style={{ border: '1.5px solid rgba(7,25,46,0.12)', color: '#07192E', background: '#fff' }}
          >
            <option value="">Type de bateau</option>
            <option value="sailboat">Voilier</option>
            <option value="motorboat">Bateau à moteur</option>
            <option value="catamaran">Catamaran</option>
            <option value="rib">Semi-rigide</option>
          </select>

          <select
            value={filters.minPrice}
            onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
            className="px-4 py-2 rounded-full border text-sm font-medium cursor-pointer outline-none transition-all"
            style={{ border: '1.5px solid rgba(7,25,46,0.12)', color: '#07192E', background: '#fff' }}
          >
            <option value="">Budget / jour</option>
            <option value="0">-200€</option>
            <option value="200">200–500€</option>
            <option value="500">+500€</option>
          </select>

          <button
            onClick={() => setFilters(f => ({ ...f, skipperAvailable: !f.skipperAvailable }))}
            className="px-4 py-2 rounded-full border text-sm font-medium transition-all"
            style={filters.skipperAvailable
              ? { background: '#07192E', color: '#fff', border: '1.5px solid #07192E' }
              : { border: '1.5px solid rgba(7,25,46,0.12)', color: '#07192E', background: '#fff' }
            }
          >
            Avec skipper
          </button>

          {(filters.type || filters.location || filters.minPrice || filters.skipperAvailable) && (
            <button
              onClick={() => setFilters({ location: '', type: '', minPrice: '', maxPrice: '', capacity: '', skipperAvailable: false })}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{ color: '#00C6E0', background: 'rgba(0,198,224,0.08)' }}
            >
              ✕ Effacer
            </button>
          )}
        </div>

        <span className="ml-auto text-sm" style={{ color: '#8896A8' }}>
          <strong style={{ color: '#07192E' }}>{total}</strong> bateau{total !== 1 ? 'x' : ''}
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="container-max section-padding">

        {/* Mobile filters panel */}
        {showFilters && (
          <div className="lg:hidden mb-6 p-5 bg-white rounded-2xl" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 sticky" style={{ top: 140, boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <LoadingSpinner text="Recherche de bateaux..." />
            ) : boats.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">⛵</p>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#07192E' }}>Aucun résultat</h3>
                <p className="text-sm" style={{ color: '#8896A8' }}>Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
