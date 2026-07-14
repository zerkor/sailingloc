import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sailboat, Waves } from 'lucide-react';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';

const HERO = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=85&auto=format&fit=crop';

const RegisterPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'tenant',
    privacyConsent: false,
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (!form.privacyConsent) {
      setError('Vous devez accepter la politique de confidentialite pour creer un compte.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await register(form);
      loginUser(data.token, data.user);
      navigate(data.user.role === 'owner' ? '/owner/dashboard' : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-12" style={{ background: '#F7F5F2' }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="block mb-8">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#07192E' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          <h1
            className="mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
          >
            Créer un compte
          </h1>
          <p className="text-sm mb-6" style={{ color: '#8896A8' }}>
            Rejoignez la communauté SailingLoc.
          </p>

          <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="Jean"
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
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: '#3D4D61' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="vous@exemple.fr"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: '#3D4D61' }}
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min. 6 caractères"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3D4D61' }}>
                  Je souhaite…
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'tenant', icon: Waves, label: 'Louer un bateau', sub: 'Je suis locataire' },
                    { value: 'owner', icon: Sailboat, label: 'Louer mon bateau', sub: 'Je suis propriétaire' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <label
                        key={opt.value}
                        className="flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all"
                        style={
                          form.role === opt.value
                            ? { background: 'rgba(7,25,46,0.06)', border: '2px solid #07192E' }
                            : { background: '#F7F5F2', border: '2px solid transparent' }
                        }
                      >
                        <input
                          type="radio"
                          name="role"
                          value={opt.value}
                          checked={form.role === opt.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Icon size={24} className="mb-1" color={form.role === opt.value ? '#07192E' : '#00C6E0'} />
                        <span className="text-sm font-bold" style={{ color: '#07192E' }}>
                          {opt.label}
                        </span>
                        <span className="text-xs mt-0.5 text-center" style={{ color: '#8896A8' }}>
                          {opt.sub}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl p-4" style={{ background: '#F7F5F2' }}>
                <label className="flex items-start gap-3 text-sm" style={{ color: '#3D4D61' }}>
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={form.privacyConsent}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                  <span>
                    J'accepte la{' '}
                    <Link to="/legal/privacy" className="font-bold hover:underline" style={{ color: '#07192E' }}>
                      politique de confidentialite
                    </Link>{' '}
                    et le traitement de mes donnees pour utiliser SailingLoc.
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm" style={{ color: '#3D4D61' }}>
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={form.marketingConsent}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span>J'accepte de recevoir des conseils et offres SailingLoc par email.</span>
                </label>
              </div>

              <ErrorMessage message={error} />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#07192E', color: '#fff' }}
              >
                {loading ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: '#8896A8' }}>
              Déjà un compte ?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#07192E' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: image */}
      <div
        className="hidden lg:block relative"
        style={{ backgroundImage: `url(${HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(7,25,46,0.55)' }} />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <p
            className="text-white mb-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800 }}
          >
            Rejoignez
            <br />
            <em style={{ color: '#00C6E0' }}>+1 200</em> propriétaires
            <br />
            et locataires
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Inscription gratuite en moins de 2 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
