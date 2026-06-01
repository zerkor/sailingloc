import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';

const Stars = ({ rating }) => (
  <span style={{ color: '#F4A01A', letterSpacing: 1 }}>
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>
);

const AdminReviewsPage = () => {
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/admin/reviews');
      setReviews(data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/reviews/${id}/approve`);
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    } catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const handleHide = async (id) => {
    try {
      await api.patch(`/admin/reviews/${id}/hide`);
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: 'hidden' } : r));
    } catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const filtered      = statusFilter ? reviews.filter(r => r.status === statusFilter) : reviews;
  const pendingCount  = reviews.filter(r => r.status === 'pending').length;

  if (loading) return <LoadingSpinner text="Chargement des avis…" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
            Avis <span style={{ fontSize: 18, fontWeight: 600, color: '#8896A8' }}>({reviews.length})</span>
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm mt-0.5 font-medium" style={{ color: '#b45309' }}>
              ⏳ {pendingCount} en attente de modération
            </p>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field text-sm"
          style={{ maxWidth: 180 }}
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="hidden">Masqués</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#EDF1F5', borderBottom: '1px solid rgba(7,25,46,0.06)' }}>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Auteur</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Bateau</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Note</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Commentaire</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Statut</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Date</th>
                <th className="text-right px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm" style={{ color: '#8896A8' }}>
                    Aucun avis trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr
                    key={r._id}
                    style={{
                      borderBottom: '1px solid rgba(7,25,46,0.05)',
                      background: r.status === 'pending' ? 'rgba(234,179,8,0.04)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F7F5F2'}
                    onMouseLeave={e => e.currentTarget.style.background = r.status === 'pending' ? 'rgba(234,179,8,0.04)' : 'transparent'}
                  >
                    <td className="px-5 py-3 font-semibold whitespace-nowrap" style={{ color: '#07192E' }}>
                      {r.author?.firstName} {r.author?.lastName}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#3D4D61', maxWidth: 140 }}>
                      <p className="truncate">{r.boat?.title || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Stars rating={r.rating} />
                      <span className="ml-1 text-xs font-bold" style={{ color: '#07192E' }}>{r.rating}/5</span>
                    </td>
                    <td className="px-5 py-3" style={{ color: '#3D4D61', maxWidth: 240 }}>
                      <p className="truncate">{r.comment}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap" style={{ color: '#8896A8' }}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(r._id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}
                          >
                            Approuver
                          </button>
                        )}
                        {r.status !== 'hidden' && (
                          <button
                            onClick={() => handleHide(r._id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: '#EDF1F5', color: '#3D4D61' }}
                          >
                            Masquer
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r._id)}
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
      </div>
    </div>
  );
};

export default AdminReviewsPage;
