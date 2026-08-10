import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, deleteAccount } from '../../services/authService';
import ErrorMessage from '../../components/ErrorMessage';
import { CheckCircle2 } from 'lucide-react';
import { useUiFeedback } from '../../components/ToastProvider';
import SEO from '../../components/SEO';

const roleLabels = {
  tenant: 'Locataire',
  owner: 'Propriétaire',
  admin: 'Administrateur',
};

const ProfilePage = () => {
  const { user, updateUser, logoutUser } = useAuth();
  const { requestApproval } = useUiFeedback();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await updateProfile(form);
      updateUser(data);
      setSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !(await requestApproval('Supprimer définitivement votre compte ? Cette action est irréversible.', {
        title: 'Supprimer le compte',
        variant: 'danger',
        confirmLabel: 'Supprimer',
      }))
    )
      return;
    try {
      await deleteAccount();
      logoutUser();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="container-max section-padding max-w-2xl" style={{ minHeight: '80vh' }}>
      <SEO title="Mon profil — SailingLoc" description="Espace privé de gestion du profil SailingLoc." noIndex />
      <h1
        className="mb-8"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: '#07192E' }}
      >
        Mon profil
      </h1>

      {/* Avatar card */}
      <div
        className="bg-white rounded-2xl p-6 mb-5 flex items-center gap-5"
        style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: '#07192E', color: '#00C6E0' }}
        >
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: '#07192E' }}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm" style={{ color: '#8896A8' }}>
            {user?.email}
          </p>
          <span
            className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,198,224,0.12)', color: '#00C6E0' }}
          >
            {roleLabels[user?.role] || user?.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
          Modifier mes informations
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#3D4D61' }}
              >
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#3D4D61' }}
              >
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: '#3D4D61' }}
            >
              Téléphone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          <ErrorMessage message={error} />

          {success && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(22,163,74,0.08)', color: '#166534', border: '1px solid rgba(22,163,74,0.2)' }}
            >
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#07192E', color: '#fff' }}
          >
            {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <h2 className="font-bold text-base mb-2" style={{ color: '#dc2626' }}>
          Zone dangereuse
        </h2>
        <p className="text-sm mb-4" style={{ color: '#8896A8' }}>
          La suppression de votre compte est irréversible et entraîne la perte de toutes vos données.
        </p>
        <button
          onClick={handleDelete}
          className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:opacity-90"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)' }}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
