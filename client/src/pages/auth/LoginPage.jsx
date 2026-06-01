import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';

const HERO = 'https://images.unsplash.com/photo-1548793428-9e9e1e37e84c?w=900&q=85&auto=format&fit=crop';

const LoginPage = () => {
  const { loginUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      const dest =
        data.user.role === 'admin' ? '/admin/dashboard' :
        data.user.role === 'owner' ? '/owner/dashboard' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-16" style={{ background: '#F7F5F2' }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="block mb-10">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#07192E' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          <h1
            className="mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
          >
            Connexion
          </h1>
          <p className="text-sm mb-8" style={{ color: '#8896A8' }}>Bienvenue ! Connectez-vous à votre compte.</p>

          <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3D4D61' }}>
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

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3D4D61' }}>
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <ErrorMessage message={error} />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#07192E', color: '#fff' }}
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            {/* Demo accounts hint */}
            <div className="mt-5 p-3 rounded-2xl text-xs" style={{ background: '#EDF1F5', color: '#8896A8' }}>
              <p className="font-semibold mb-1" style={{ color: '#3D4D61' }}>Comptes démo :</p>
              <p>tenant1@sailingloc.fr / Tenant123!</p>
              <p>owner1@sailingloc.fr / Owner123!</p>
              <p>admin@sailingloc.fr / Admin123!</p>
            </div>

            <p className="text-center text-sm mt-5" style={{ color: '#8896A8' }}>
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#07192E' }}>S'inscrire</Link>
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
            Naviguez <em style={{ color: '#00C6E0' }}>librement</em>,<br />
            entre particuliers.
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            +1 200 bateaux disponibles dans toute la France et l'Europe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
