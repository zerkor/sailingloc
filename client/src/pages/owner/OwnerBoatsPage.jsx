import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, MapPin, Plus, Sailboat } from 'lucide-react';
import { getOwnerBoats, deleteBoat } from '../../services/boatService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatPrice } from '../../utils/formatPrice';
import { useUiFeedback } from '../../components/ToastProvider';
import { FALLBACK_BOAT_IMAGE, getBoatImage } from '../../utils/boatImages';

const OwnerBoatsPage = () => {
  const { toast, requestApproval } = useUiFeedback();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBoats = async () => {
    try {
      const { data } = await getOwnerBoats();
      setBoats(data || []);
    } catch {
      setBoats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoats();
  }, []);

  const handleDelete = async (id) => {
    if (
      !(await requestApproval('Supprimer ce bateau ? Cette action est irréversible.', {
        title: 'Supprimer le bateau',
        variant: 'danger',
        confirmLabel: 'Supprimer',
      }))
    )
      return;
    try {
      await deleteBoat(id);
      fetchBoats();
      toast('Bateau supprimé.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Chargement de vos bateaux..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
          Mes bateaux
        </h1>
        <Link
          to="/owner/boats/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
          style={{ background: '#00C6E0', color: '#07192E' }}
        >
          <Plus size={16} /> Ajouter un bateau
        </Link>
      </div>

      {boats.length === 0 ? (
        <div className="text-center py-20">
          <Sailboat size={48} className="mx-auto mb-4" color="#00C6E0" />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#07192E' }}>
            Aucun bateau
          </h3>
          <p className="text-sm mb-6" style={{ color: '#8896A8' }}>
            Ajoutez votre premier bateau pour commencer à louer.
          </p>
          <Link to="/owner/boats/new" className="btn-ocean">
            Ajouter un bateau
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {boats.map((boat) => (
            <div
              key={boat._id}
              className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-5"
              style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
            >
              {/* Image */}
              <div className="w-full sm:w-36 h-28 sm:h-auto rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={getBoatImage(boat)}
                  alt={boat.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_BOAT_IMAGE;
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3
                    className="font-bold text-lg"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
                  >
                    {boat.title}
                  </h3>
                  <StatusBadge status={boat.status} />
                </div>

                <p className="inline-flex items-center gap-1.5 text-sm mb-1" style={{ color: '#8896A8' }}>
                  <MapPin size={14} /> {boat.location}
                </p>
                <p className="font-bold text-base mb-4" style={{ color: '#07192E' }}>
                  {formatPrice(boat.pricePerDay)}
                  <span className="font-normal text-sm" style={{ color: '#8896A8' }}>
                    /jour
                  </span>
                </p>

                {boat.status === 'pending' && (
                  <div
                    className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(234,179,8,0.1)', color: '#854d0e' }}
                  >
                    <Clock3 size={13} /> En attente d'approbation par l'administrateur
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/boats/${boat._id}`}
                    className="text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:bg-[#EDF1F5]"
                    style={{ borderColor: 'rgba(7,25,46,0.15)', color: '#07192E' }}
                  >
                    Voir l'annonce
                  </Link>
                  <Link
                    to={`/owner/boats/${boat._id}/edit`}
                    className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                    style={{ background: '#00C6E0', color: '#07192E' }}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(boat._id)}
                    className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:opacity-90"
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBoatsPage;
