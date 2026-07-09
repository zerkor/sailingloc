import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { formatDate } from '../../utils/formatDate';
import { useUiFeedback } from '../../components/ToastProvider';

const statuses = ['open', 'in_review', 'resolved', 'rejected'];

const AdminReportsPage = () => {
  const { toast, askText } = useUiFeedback();
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get('/reports/admin', { params: { page, limit: 10, status: status || undefined } });
        setReports(data.items || []);
        setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total || 0 });
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const updateStatus = async (id, nextStatus) => {
    const adminNote =
      (await askText('Note admin (optionnel)', {
        title: 'Mettre à jour le signalement',
        placeholder: 'Note visible dans le suivi admin',
        confirmLabel: 'Enregistrer',
      })) || '';
    try {
      await api.patch(`/reports/admin/${id}/status`, { status: nextStatus, adminNote });
      await fetchReports(meta.page);
      toast('Signalement mis à jour.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Action impossible.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Chargement des signalements..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
          Signalements <span style={{ fontSize: 18, color: '#8896A8' }}>({meta.total})</span>
        </h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field text-sm"
          style={{ maxWidth: 190 }}
        >
          <option value="">Tous les statuts</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#EDF1F5' }}>
                <th className="px-5 py-3 text-left">Reporter</th>
                <th className="px-5 py-3 text-left">Target type</th>
                <th className="px-5 py-3 text-left">Reason</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12" style={{ color: '#8896A8' }}>
                    Aucun signalement.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} style={{ borderBottom: '1px solid rgba(7,25,46,0.06)' }}>
                    <td className="px-5 py-3">
                      {report.reporter?.firstName} {report.reporter?.lastName}
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {report.reporter?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3">{report.targetType}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{report.reason}</p>
                      <p className="text-xs max-w-xs truncate" style={{ color: '#64748B' }}>
                        {report.description}
                      </p>
                    </td>
                    <td className="px-5 py-3">{report.status}</td>
                    <td className="px-5 py-3">{formatDate(report.createdAt)}</td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      {statuses
                        .filter((s) => s !== report.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(report._id, s)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full"
                            style={{ background: '#EDF1F5', color: '#07192E' }}
                          >
                            {s}
                          </button>
                        ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchReports} />
      </div>
    </div>
  );
};

export default AdminReportsPage;
