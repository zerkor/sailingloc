import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import PaginationControls from '../../components/PaginationControls';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { Clock3, MapPin } from 'lucide-react';
import { useUiFeedback } from '../../components/ToastProvider';
import { FALLBACK_BOAT_IMAGE, getBoatImage } from '../../utils/boatImages';

const typeLabels = { sailboat: 'Voilier', motorboat: 'Moteur', catamaran: 'Catamaran', rib: 'Semi-rigide' };

const AdminBoatsPage = () => {
  const { toast, requestApproval } = useUiFeedback();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchBoats = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/boats', {
        params: { page, limit: 10, status: statusFilter || undefined },
      });
      const items = Array.isArray(data) ? data : data.items || data.boats || [];
      setBoats(items);
      setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total ?? items.length });
    } catch {
      setBoats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoats(1);
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      const { data } = await api.patch(`/admin/boats/${id}/approve`);
      setBoats((prev) => prev.map((b) => (b._id === id ? { ...b, status: data.status } : b)));
      toast('Bateau approuvé.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const { data } = await api.patch(`/admin/boats/${id}/reject`);
      setBoats((prev) => prev.map((b) => (b._id === id ? { ...b, status: data.status } : b)));
      toast('Bateau rejeté.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (
      !(await requestApproval('Supprimer définitivement ce bateau ?', {
        title: 'Suppression bateau',
        variant: 'danger',
        confirmLabel: 'Supprimer',
      }))
    )
      return;
    try {
      await api.delete(`/admin/boats/${id}`);
      setBoats((prev) => prev.filter((b) => b._id !== id));
      toast('Bateau supprimé.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const filtered = boats.filter((b) => {
    const matchesSearch = `${b.title} ${b.location} ${b.owner?.firstName} ${b.owner?.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = boats.filter((b) => b.status === 'pending').length;

  if (loading) return <LoadingSpinner text="Chargement des bateaux…" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
            Bateaux <span style={{ fontSize: 18, fontWeight: 600, color: '#8896A8' }}>({meta.total})</span>
          </h1>
          {pendingCount > 0 && (
            <p className="inline-flex items-center gap-1.5 text-sm mt-0.5 font-medium" style={{ color: '#b45309' }}>
              <Clock3 size={14} /> {pendingCount} en attente d'approbation
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm"
            style={{ maxWidth: 160 }}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
            <option value="draft">Brouillons</option>
          </select>
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-sm"
            style={{ maxWidth: 220 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#EDF1F5', borderBottom: '1px solid rgba(7,25,46,0.06)' }}>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Bateau
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Propriétaire
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Type
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Prix/jour
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Statut
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Créé le
                </th>
                <th
                  className="text-right px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm" style={{ color: '#8896A8' }}>
                    Aucun bateau trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((boat) => (
                  <tr
                    key={boat._id}
                    style={{
                      borderBottom: '1px solid rgba(7,25,46,0.05)',
                      background: boat.status === 'pending' ? 'rgba(234,179,8,0.04)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F5F2')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        boat.status === 'pending' ? 'rgba(234,179,8,0.04)' : 'transparent')
                    }
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: '#EDF1F5' }}
                        >
                          <img
                            src={getBoatImage(boat)}
                            alt={boat.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = FALLBACK_BOAT_IMAGE;
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#07192E' }}>
                            {boat.title}
                          </p>
                          <p className="inline-flex items-center gap-1 text-xs" style={{ color: '#8896A8' }}>
                            <MapPin size={12} /> {boat.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {boat.owner ? (
                        <>
                          <p style={{ color: '#3D4D61' }}>
                            {boat.owner.firstName} {boat.owner.lastName}
                          </p>
                          <p className="text-xs" style={{ color: '#8896A8' }}>
                            {boat.owner.email}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold" style={{ color: '#dc2626' }}>
                            Propriétaire introuvable
                          </p>
                          <p className="text-xs" style={{ color: '#8896A8' }}>
                            Bateau orphelin à nettoyer
                          </p>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,198,224,0.1)', color: '#155374' }}
                      >
                        {typeLabels[boat.type] || boat.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: '#07192E' }}>
                      {formatPrice(boat.pricePerDay)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={boat.status} />
                    </td>
                    <td className="px-5 py-3" style={{ color: '#8896A8' }}>
                      {formatDate(boat.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Link
                          to={`/boats/${boat._id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:bg-[#EDF1F5]"
                          style={{ borderColor: 'rgba(7,25,46,0.15)', color: '#07192E' }}
                        >
                          Voir
                        </Link>
                        {(boat.status === 'pending' || boat.status === 'rejected') && (
                          <button
                            onClick={() => handleApprove(boat._id)}
                            disabled={!boat.owner}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            title={!boat.owner ? 'Impossible sans propriétaire associé' : undefined}
                            style={{
                              background: 'rgba(22,163,74,0.1)',
                              color: '#166534',
                              opacity: boat.owner ? 1 : 0.45,
                              cursor: boat.owner ? 'pointer' : 'not-allowed',
                            }}
                          >
                            Approuver
                          </button>
                        )}
                        {(boat.status === 'pending' || boat.status === 'approved') && (
                          <button
                            onClick={() => handleReject(boat._id)}
                            disabled={!boat.owner}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            title={!boat.owner ? 'Impossible sans propriétaire associé' : undefined}
                            style={{
                              background: 'rgba(234,88,12,0.1)',
                              color: '#c2410c',
                              opacity: boat.owner ? 1 : 0.45,
                              cursor: boat.owner ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {boat.status === 'approved' ? 'Révoquer' : 'Rejeter'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(boat._id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchBoats} />
      </div>
    </div>
  );
};

export default AdminBoatsPage;
