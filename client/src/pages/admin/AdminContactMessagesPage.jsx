import { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { useUiFeedback } from '../../components/ToastProvider';

const statuses = ['new', 'read', 'resolved', 'archived'];
const statusLabels = {
  new: 'Nouveau',
  read: 'Lu',
  resolved: 'Traité',
  archived: 'Archivé',
};
const subjectLabels = {
  technique: 'Problème technique',
  location: 'Location',
  partenariat: 'Partenariat',
  autre: 'Autre',
};

const AdminContactMessagesPage = () => {
  const { toast } = useUiFeedback();
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/contact-messages', {
        params: { page, limit: 10, status: status || undefined },
      });
      const items = data.items || [];
      setMessages(items);
      setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total ?? items.length });
    } catch (err) {
      toast(err.response?.data?.message || 'Impossible de charger les messages.', 'error');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(1);
  }, [status]);

  const updateStatus = async (id, nextStatus) => {
    try {
      const { data } = await api.patch(`/admin/contact-messages/${id}`, { status: nextStatus });
      setMessages((prev) => prev.map((item) => (item._id === id ? data : item)));
      toast('Message mis a jour.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Action impossible.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Chargement des messages contact..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="sec-eyebrow">Support</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
            Messages contact <span style={{ fontSize: 18, fontWeight: 600, color: '#8896A8' }}>({meta.total})</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field text-sm">
            <option value="">Tous les statuts</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchMessages(meta.page)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: '#07192E', color: '#fff' }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <Mail size={28} className="mx-auto mb-3" color="#00C6E0" />
            <p className="font-semibold" style={{ color: '#07192E' }}>Aucun message contact.</p>
          </div>
        ) : (
          messages.map((item) => (
            <article key={item._id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#00AFC7' }}>
                      {subjectLabels[item.subject] || item.subject}
                    </span>
                    <span className="text-xs" style={{ color: '#8896A8' }}>{formatDate(item.createdAt)}</span>
                  </div>
                  <h2 className="font-bold" style={{ color: '#07192E' }}>
                    {item.name} <span className="text-sm font-medium" style={{ color: '#8896A8' }}>({item.email})</span>
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6" style={{ color: '#3D4D61' }}>
                    {item.message}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {item.status !== 'read' && (
                    <button
                      onClick={() => updateStatus(item._id, 'read')}
                      className="rounded-full px-3 py-2 text-xs font-bold"
                      style={{ background: '#EDF1F5', color: '#07192E' }}
                    >
                      Marquer lu
                    </button>
                  )}
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(item._id, 'resolved')}
                      className="rounded-full px-3 py-2 text-xs font-bold"
                      style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}
                    >
                      Traité
                    </button>
                  )}
                  {item.status !== 'archived' && (
                    <button
                      onClick={() => updateStatus(item._id, 'archived')}
                      className="rounded-full px-3 py-2 text-xs font-bold"
                      style={{ background: 'rgba(7,25,46,0.08)', color: '#3D4D61' }}
                    >
                      Archiver
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchMessages} />
    </div>
  );
};

export default AdminContactMessagesPage;
