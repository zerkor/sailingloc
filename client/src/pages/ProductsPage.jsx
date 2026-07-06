import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import BoatCard from '../components/BoatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBoats } from '../services/boatService';

const ProductsPage = () => {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('');

  const fetchBoats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getBoats(type ? { type } : {});
      setBoats(data.boats || data.items || data || []);
    } catch {
      setBoats([]);
      setError('Impossible de charger le catalogue des bateaux.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchBoats(); }, [fetchBoats]);

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>
      <section className="px-4 sm:px-6 lg:px-14 py-14" style={{ background: 'linear-gradient(135deg, #07192E 0%, #155374 100%)' }}>
        <div className="container-max">
          <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>Catalogue</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, color: '#fff' }}>Nos bateaux disponibles</h1>
          <p className="mt-3 text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>Une vue catalogue des offres de location approuvées par SailingLoc.</p>
        </div>
      </section>
      <section className="container-max section-padding">
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <select value={type} onChange={e => setType(e.target.value)} className="input-field text-sm" style={{ maxWidth: 240 }}>
            <option value="">Tous les types</option>
            <option value="sailboat">Voiliers</option>
            <option value="motorboat">Bateaux à moteur</option>
            <option value="catamaran">Catamarans</option>
            <option value="rib">Semi-rigides</option>
          </select>
          <span className="text-sm" style={{ color: '#64748B' }}>{boats.length} offre{boats.length > 1 ? 's' : ''}</span>
        </div>
        {loading ? <LoadingSpinner text="Chargement du catalogue..." /> : error ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <AlertCircle className="mx-auto mb-3" color="#dc2626" />
            <p className="text-sm font-semibold mb-4" style={{ color: '#07192E' }}>{error}</p>
            <button onClick={fetchBoats} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: '#00C6E0', color: '#07192E' }}><RefreshCw size={15} /> Réessayer</button>
          </div>
        ) : boats.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-sm" style={{ color: '#64748B' }}>Aucun bateau approuvé disponible pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">{boats.map(boat => <BoatCard key={boat._id} boat={boat} />)}</div>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;
