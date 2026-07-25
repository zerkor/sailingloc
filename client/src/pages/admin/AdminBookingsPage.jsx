import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import PaginationControls from '../../components/PaginationControls';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import { ArrowRight } from 'lucide-react';
import { useUiFeedback } from '../../components/ToastProvider';

const AdminBookingsPage = () => {
  const { toast, requestApproval } = useUiFeedback();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/bookings', {
        params: { page, limit: 10, status: filter === 'all' ? undefined : filter },
      });
      const items = Array.isArray(data) ? data : data.items || [];
      setBookings(items);
      setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total ?? items.length });
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [filter]);

  const handleAccept = async (id) => {
    if (
      !(await requestApproval('Accepter cette demande de réservation ?', {
        title: 'Validation réservation',
        confirmLabel: 'Accepter',
      }))
    )
      return;
    try {
      const { data } = await api.patch(`/admin/bookings/${id}/accept`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: data.status } : b)));
      toast('Réservation acceptée.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const handleReject = async (id) => {
    if (
      !(await requestApproval('Refuser cette demande de réservation ?', {
        title: 'Refus réservation',
        variant: 'danger',
        confirmLabel: 'Refuser',
      }))
    )
      return;
    try {
      const { data } = await api.patch(`/admin/bookings/${id}/reject`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: data.status } : b)));
      toast('Réservation refusée.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (
      !(await requestApproval('Annuler cette réservation ?', {
        title: 'Annulation',
        variant: 'danger',
        confirmLabel: 'Annuler la réservation',
      }))
    )
      return;
    try {
      await api.patch(`/admin/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      toast('Réservation annulée.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const handleComplete = async (id) => {
    if (
      !(await requestApproval('Marquer cette réservation comme terminée ?', {
        title: 'Clôturer la réservation',
        confirmLabel: 'Terminer',
      }))
    )
      return;
    try {
      await api.patch(`/admin/bookings/${id}/complete`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'completed' } : b)));
      toast('Réservation terminée.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur.', 'error');
    }
  };

  const statusFilters = ['all', 'pending', 'accepted', 'confirmed', 'completed', 'cancelled', 'rejected'];
  const filterLabel = {
    all: 'Toutes',
    pending: 'En attente',
    accepted: 'Acceptées',
    confirmed: 'Confirmées',
    completed: 'Terminées',
    cancelled: 'Annulées',
    rejected: 'Refusées',
  };
  const filtered = bookings;

  if (loading) return <LoadingSpinner text="Chargement des réservations..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
        Réservations <span style={{ fontSize: 18, fontWeight: 600, color: '#8896A8' }}>({meta.total})</span>
      </h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={
              filter === s
                ? { background: '#07192E', color: '#fff' }
                : { background: '#fff', color: '#3D4D61', border: '1.5px solid rgba(7,25,46,0.15)' }
            }
          >
            {filterLabel[s]}{' '}
            <span style={{ opacity: 0.65 }}>
              ({s === 'all' ? bookings.length : bookings.filter((b) => b.status === s).length})
            </span>
          </button>
        ))}
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
                  Locataire
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
                  Dates
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Montant
                </th>
                <th
                  className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs"
                  style={{ color: '#3D4D61' }}
                >
                  Statut
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
                    Aucune réservation trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b._id}
                    style={{ borderBottom: '1px solid rgba(7,25,46,0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F5F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-3 font-semibold" style={{ color: '#07192E' }}>
                      {b.boat?.title || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <p style={{ color: '#3D4D61' }}>
                        {b.tenant?.firstName} {b.tenant?.lastName}
                      </p>
                      <p className="text-xs" style={{ color: '#8896A8' }}>
                        {b.tenant?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3" style={{ color: '#3D4D61' }}>
                      {b.owner?.firstName} {b.owner?.lastName}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap" style={{ color: '#8896A8' }}>
                      <p>{formatDate(b.startDate)}</p>
                      <p className="inline-flex items-center gap-1">
                        <ArrowRight size={13} /> {formatDate(b.endDate)}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-bold whitespace-nowrap" style={{ color: '#07192E' }}>
                      {formatPrice(b.totalPrice)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(b._id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                              style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleReject(b._id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                              style={{ background: 'rgba(234,88,12,0.1)', color: '#c2410c' }}
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleComplete(b._id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: 'rgba(0,198,224,0.12)', color: '#155374' }}
                          >
                            Terminer
                          </button>
                        )}
                        {!['cancelled', 'completed', 'rejected'].includes(b.status) && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchBookings} />
      </div>
    </div>
  );
};

export default AdminBookingsPage;
