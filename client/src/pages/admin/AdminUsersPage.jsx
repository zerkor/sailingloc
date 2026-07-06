import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';

const roleLabels = { tenant: 'Locataire', owner: 'Propriétaire', admin: 'Admin' };

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, activeAdminCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const fetchUsers = useCallback(async (page = meta.page) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 10, search, role } });
      setUsers(data.items || data || []);
      setMeta({ page: data.page || 1, totalPages: data.totalPages || 1, total: data.total ?? (data.items?.length || 0), activeAdminCount: data.activeAdminCount || 0 });
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [meta.page, search, role]);

  useEffect(() => { fetchUsers(1); }, [search, role]);

  const updateUser = async (id, payload) => {
    try {
      await api.put(`/admin/users/${id}`, payload);
      await fetchUsers(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Action refusée.');
    }
  };

  const changeRole = async (target, nextRole) => {
    if (target.role === nextRole) return;
    if (!confirm(`Changer le rôle de ${target.email} en ${roleLabels[nextRole]} ?`)) return;
    await updateUser(target._id, { role: nextRole });
  };

  if (loading) return <LoadingSpinner text="Chargement des utilisateurs..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>Utilisateurs <span style={{ fontSize: 18, color: '#8896A8' }}>({meta.total})</span></h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>{meta.activeAdminCount} administrateur(s) actif(s)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={role} onChange={e => setRole(e.target.value)} className="input-field text-sm">
            <option value="">Tous les rôles</option>
            <option value="tenant">Locataires</option>
            <option value="owner">Propriétaires</option>
            <option value="admin">Admins</option>
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field text-sm" />
        </div>
      </div>

      {error && <div className="rounded-2xl p-4 text-sm font-semibold" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</div>}

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#EDF1F5' }}>
                <th className="text-left px-5 py-3 text-xs uppercase">Utilisateur</th>
                <th className="text-left px-5 py-3 text-xs uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs uppercase">Rôle</th>
                <th className="text-left px-5 py-3 text-xs uppercase">Statut</th>
                <th className="text-left px-5 py-3 text-xs uppercase">Inscrit le</th>
                <th className="text-right px-5 py-3 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12" style={{ color: '#8896A8' }}>Aucun utilisateur trouvé.</td></tr>
              ) : users.map(target => {
                const isSelf = target._id === currentUser?._id;
                const isLastActiveAdmin = target.role === 'admin' && target.isActive && meta.activeAdminCount <= 1;
                const dangerousDisabled = isSelf || isLastActiveAdmin;
                return (
                  <tr key={target._id} style={{ borderBottom: '1px solid rgba(7,25,46,0.06)', opacity: target.isActive ? 1 : 0.6 }}>
                    <td className="px-5 py-3 font-semibold" style={{ color: '#07192E' }}>{target.firstName} {target.lastName}</td>
                    <td className="px-5 py-3" style={{ color: '#64748B' }}>{target.email}</td>
                    <td className="px-5 py-3">
                      <select value={target.role} disabled={dangerousDisabled && target.role === 'admin'} onChange={e => changeRole(target, e.target.value)} className="input-field text-xs min-w-[130px]">
                        <option value="tenant">Locataire</option>
                        <option value="owner">Propriétaire</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      {target.isActive ? <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#166534' }}><CheckCircle2 size={13} /> Actif</span> : <span className="text-xs font-bold" style={{ color: '#dc2626' }}>Désactivé</span>}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#64748B' }}>{formatDate(target.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      {dangerousDisabled && <span className="inline-flex items-center gap-1 text-xs mr-2" style={{ color: '#b45309' }}><ShieldAlert size={13} /> Protégé</span>}
                      {target.isActive ? (
                        <button disabled={dangerousDisabled} onClick={() => updateUser(target._id, { isActive: false })} className="text-xs font-bold px-3 py-1.5 rounded-full disabled:opacity-40" style={{ background: 'rgba(234,88,12,0.1)', color: '#c2410c' }}>Désactiver</button>
                      ) : (
                        <button onClick={() => updateUser(target._id, { isActive: true })} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}>Réactiver</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchUsers} />
      </div>
    </div>
  );
};

export default AdminUsersPage;
