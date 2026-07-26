import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/authService';

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const LoginPage = () => {
  const { t } = useTranslation();
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      const dest =
        data.user.role === 'admin' ? '/admin/dashboard' : data.user.role === 'owner' ? '/owner/dashboard' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('auth.invalidLogin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16" style={{ background: '#F7F5F2' }}>
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 block">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#07192E' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          <h1
            className="mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
          >
            {t('auth.loginTitle')}
          </h1>
          <p className="mb-8 text-sm" style={{ color: '#8896A8' }}>
            {t('auth.loginSubtitle')}
          </p>

          <div className="rounded-3xl bg-white p-8" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#3D4D61' }}
                >
                  {t('auth.email')}
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
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#3D4D61' }}
                  >
                    {t('auth.password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold hover:underline"
                    style={{ color: '#00C6E0' }}
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center transition-colors"
                    style={{ color: '#8896A8' }}
                    tabIndex={-1}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <ErrorMessage message={error} />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#07192E', color: '#fff' }}
              >
                {loading ? t('auth.loginLoading') : t('auth.loginCta')}
              </button>
            </form>

            <div className="mt-5 rounded-2xl p-3 text-xs" style={{ background: '#EDF1F5', color: '#8896A8' }}>
              <p className="mb-1 font-semibold" style={{ color: '#3D4D61' }}>
                {t('auth.demoAccounts')}
              </p>
              <p>tenant1@sailingloc.fr / Tenant123!</p>
              <p>owner1@sailingloc.fr / Owner123!</p>
              <p>admin@sailingloc.fr / Admin123!</p>
            </div>

            <p className="mt-5 text-center text-sm" style={{ color: '#8896A8' }}>
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#07192E' }}>
                {t('auth.registerLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          background:
            'radial-gradient(circle at 78% 18%, rgba(0,198,224,0.34) 0, rgba(0,198,224,0.12) 28%, transparent 48%), linear-gradient(145deg, #07192E 0%, #0B3246 52%, #155374 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            opacity: 0.45,
          }}
        />
        <div className="absolute right-14 top-16 w-72 rounded-3xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: '#7EEAFA' }}>
              SailingLoc
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#00C6E0', color: '#07192E' }}>
              Live
            </span>
          </div>
          <div className="space-y-3">
            {[
              ['1 200+', 'bateaux'],
              ['320', 'ports'],
              ['4.9/5', 'note moyenne'],
            ].map(([value, label]) => (
              <div key={label} className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-sm text-white/65">{label}</span>
                <strong className="text-xl" style={{ color: '#fff' }}>
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-24 left-14 h-20 w-20 border-l-2 border-t-2 border-cyan-300/40" />
        <div className="absolute bottom-14 left-24 h-20 w-20 border-b-2 border-r-2 border-cyan-300/25" />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <p
            className="mb-3 leading-tight text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 800,
              textShadow: '0 8px 28px rgba(0,0,0,0.28)',
            }}
          >
            {t('auth.loginHeroTitle')}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {t('auth.loginHeroText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
