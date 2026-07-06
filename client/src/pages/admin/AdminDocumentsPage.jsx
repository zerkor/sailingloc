import { useCallback, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getAdminDocuments, reviewDocument } from '../../services/documentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';

const typeLabels = { identity: 'Pièce d’identité', insurance: 'Assurance', registration: 'Immatriculation', contract: 'Contrat', other: 'Autre' };

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAdminDocuments({ page, limit: 10, status: status || undefined });
      const items = data.items || data || [];
      setDocuments(items);
      setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total ?? items.length });
    } catch {
      setError('Impossible de charger les documents.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchDocuments(1); }, [fetchDocuments]);

  const review = async (id, nextStatus) => {
    const rejectionReason = nextStatus === 'rejected' ? prompt('Motif du rejet ?') || 'Document non conforme' : undefined;
    try {
      await reviewDocument(id, { status: nextStatus, rejectionReason });
      await fetchDocuments(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Action impossible.');
    }
  };

  if (loading) return <LoadingSpinner text="Chargement des documents..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>Documents <span style={{ fontSize: 18, color: '#8896A8' }}>({meta.total})</span></h1>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field text-sm" style={{ maxWidth: 190 }}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>
      {error && <div className="rounded-2xl p-4 text-sm font-semibold" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ background: '#EDF1F5' }}><th className="px-5 py-3 text-left">Owner</th><th className="px-5 py-3 text-left">Boat</th><th className="px-5 py-3 text-left">Document type</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Uploaded date</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {documents.length === 0 ? <tr><td colSpan={6} className="text-center py-12" style={{ color: '#8896A8' }}>Aucun document à afficher.</td></tr> : documents.map(doc => (
                <tr key={doc._id} style={{ borderBottom: '1px solid rgba(7,25,46,0.06)' }}>
                  <td className="px-5 py-3">{doc.owner?.firstName} {doc.owner?.lastName}<p className="text-xs" style={{ color: '#64748B' }}>{doc.owner?.email}</p></td>
                  <td className="px-5 py-3">{doc.boat?.title || 'Global propriétaire'}</td>
                  <td className="px-5 py-3">{typeLabels[doc.type] || doc.type}</td>
                  <td className="px-5 py-3"><StatusBadge status={doc.status} /></td>
                  <td className="px-5 py-3" style={{ color: '#64748B' }}>{formatDate(doc.createdAt)}</td>
                  <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#EDF1F5', color: '#07192E' }}><ExternalLink size={13} /> Voir</a>
                    {doc.status !== 'approved' && <button onClick={() => review(doc._id, 'approved')} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}>Approuver</button>}
                    {doc.status !== 'rejected' && <button onClick={() => review(doc._id, 'rejected')} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>Rejeter</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchDocuments} />
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
