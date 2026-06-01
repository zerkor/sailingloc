import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

const roleLabels  = { tenant: 'Locataire', owner: 'Propriétaire', admin: 'Admin' };
const roleColors  = {
  tenant: { background: 'rgba(0,198,224,0.12)', color: '#155374' },
  owner:  { background: 'rgba(201,168,76,0.15)', color: '#7a5c00' },
  admin:  { background: 'rgba(7,25,46,0.1)',     color: '#07192E' },
};

const AdminUsersPage = () => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDisable = async (id) => {
    if (!confirm('Désactiver cet utilisateur ? Il ne pourra plus se connecter.')) return;
    try {
      await api.patch(`/admin/users/${id}/disable`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleEnable = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: true });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: true } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur.');
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole   = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner text="Chargement des utilisateurs…" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
          Utilisateurs <span style={{ fontSize: 18, fontWeight: 600, color: '#8896A8' }}>({users.length})</span>
        </h1>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input-field text-sm"
            style={{ maxWidth: 160 }}
          >
            <option value="">Tous les rôles</option>
            <option value="tenant">Locataires</option>
            <option value="owner">Propriétaires</option>
            <option value="admin">Admins</option>
          </select>
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-sm"
            style={{ maxWidth: 220 }}
          />
        </div>
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
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Utilisateur</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Email</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Rôle</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Statut</th>
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Inscrit le</th>
                <th className="text-right px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: '#3D4D61' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#8896A8' }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr
                    key={u._id}
                    style={{
                      borderBottom: '1px solid rgba(7,25,46,0.05)',
                      opacity: u.isActive ? 1 : 0.55,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F7F5F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: '#07192E', color: '#00C6E0' }}
                        >
                          {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                        </div>
                        <span className="font-semibold" style={{ color: '#07192E' }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: '#8896A8' }}>{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={roleColors[u.role] || { background: '#EDF1F5', color: '#3D4D61' }}
                      >
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.isActive ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}>
                          ✓ Actif
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                          Désactivé
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#8896A8' }}>{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      {u.role !== 'admin' && (
                        u.isActive ? (
                          <button
                            onClick={() => handleDisable(u._id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: 'rgba(234,88,12,0.1)', color: '#c2410c' }}
                          >
                            Désactiver
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnable(u._id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}
                          >
                            Réactiver
                          </button>
                        )
                      )}
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

export default AdminUsersPage;
