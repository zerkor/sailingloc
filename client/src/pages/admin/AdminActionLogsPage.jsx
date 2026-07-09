import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { formatDate } from '../../utils/formatDate';

const AdminActionLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/action-logs', {
          params: { page, limit: 10, action: action || undefined, entityType: entityType || undefined },
        });
        setLogs(data.items || []);
        setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total || 0 });
      } finally {
        setLoading(false);
      }
    },
    [action, entityType]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  if (loading) return <LoadingSpinner text="Chargement du journal admin..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
          Journal admin <span style={{ fontSize: 18, color: '#8896A8' }}>({meta.total})</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field text-sm"
            placeholder="Filtrer action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
          <input
            className="input-field text-sm"
            placeholder="Filtrer entité"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#EDF1F5' }}>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Admin</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">Entity type</th>
                <th className="px-5 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12" style={{ color: '#8896A8' }}>
                    Aucune action enregistrée.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(7,25,46,0.06)' }}>
                    <td className="px-5 py-3">{formatDate(log.createdAt)}</td>
                    <td className="px-5 py-3">
                      {log.admin?.firstName} {log.admin?.lastName}
                      <p className="text-xs" style={{ color: '#64748B' }}>
                        {log.admin?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3">{log.action}</td>
                    <td className="px-5 py-3">{log.entityType}</td>
                    <td className="px-5 py-3">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchLogs} />
      </div>
    </div>
  );
};

export default AdminActionLogsPage;
