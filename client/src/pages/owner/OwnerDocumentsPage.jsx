import { useEffect, useState } from 'react';
import { FileCheck2, Link as LinkIcon, Send } from 'lucide-react';
import { createDocument, getMyDocuments } from '../../services/documentService';
import { getOwnerBoats } from '../../services/boatService';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const typeLabels = {
  identity: 'Identite',
  insurance: 'Assurance',
  registration: 'Acte de francisation',
  contract: 'Contrat',
  other: 'Autre',
};

const OwnerDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ boatId: '', type: 'insurance', title: '', fileUrl: '' });

  const refresh = async () => {
    const [documentsRes, boatsRes] = await Promise.all([getMyDocuments(), getOwnerBoats()]);
    setDocuments(documentsRes.data || []);
    setBoats(boatsRes.data || []);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Impossible de charger vos documents.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createDocument({ ...form, boatId: form.boatId || undefined });
      setForm({ boatId: '', type: 'insurance', title: '', fileUrl: '' });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d envoyer ce document.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Chargement des documents..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
          Documents proprietaire
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8896A8' }}>
          Ajoutez les pieces demandees pour faciliter la validation administrative de vos annonces.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4 xl:col-span-1" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
          <div className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: '#07192E' }}>
            <FileCheck2 size={18} /> Nouveau document
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3D4D61' }}>Bateau lie</label>
            <select className="input-field" value={form.boatId} onChange={(event) => setForm(prev => ({ ...prev, boatId: event.target.value }))}>
              <option value="">Compte proprietaire</option>
              {boats.map(boat => <option key={boat._id} value={boat._id}>{boat.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3D4D61' }}>Type</label>
            <select className="input-field" value={form.type} onChange={(event) => setForm(prev => ({ ...prev, type: event.target.value }))}>
              {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3D4D61' }}>Titre</label>
            <input className="input-field" value={form.title} onChange={(event) => setForm(prev => ({ ...prev, title: event.target.value }))} placeholder="Attestation assurance 2026" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3D4D61' }}>URL du fichier</label>
            <input className="input-field" type="url" value={form.fileUrl} onChange={(event) => setForm(prev => ({ ...prev, fileUrl: event.target.value }))} placeholder="https://..." required />
          </div>
          <ErrorMessage message={error} />
          <button type="submit" disabled={submitting} className="btn-ocean w-full inline-flex items-center justify-center gap-2">
            <Send size={16} /> {submitting ? 'Envoi...' : 'Envoyer pour validation'}
          </button>
        </form>

        <div className="bg-white rounded-2xl p-6 xl:col-span-2" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
          <h2 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
            Documents envoyes
          </h2>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm" style={{ color: '#8896A8' }}>Aucun document envoye pour le moment.</p>
            ) : documents.map(document => (
              <div key={document._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-4" style={{ background: '#F7F9FB', border: '1px solid #EDF1F5' }}>
                <div>
                  <p className="font-bold" style={{ color: '#07192E' }}>{document.title}</p>
                  <p className="text-xs mt-1" style={{ color: '#8896A8' }}>
                    {typeLabels[document.type] || document.type}
                    {document.boat?.title ? ` - ${document.boat.title}` : ' - Compte proprietaire'}
                  </p>
                  {document.rejectionReason && <p className="text-xs mt-1 text-red-600">{document.rejectionReason}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={document.status} />
                  <a href={document.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: '#07192E' }}>
                    <LinkIcon size={14} /> Ouvrir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDocumentsPage;
