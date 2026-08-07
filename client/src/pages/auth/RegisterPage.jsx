import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Sailboat, Waves } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/authService';
import TurnstileCaptcha, { isTurnstileConfigured } from '../../components/TurnstileCaptcha';

const HERO = '/images/hero-boat.jpeg';

const RegisterPage = () => {
  const { t } = useTranslation();
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
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (!form.privacyConsent) {
      setError(t('auth.privacyRequired'));
      return;
    }
    if (isTurnstileConfigured && !turnstileToken) {
      setError('Veuillez valider le captcha Cloudflare.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await register({ ...form, turnstileToken });
      loginUser(data.token, data.user);
      navigate(data.user.role === 'owner' ? '/owner/dashboard' : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'tenant', icon: Waves, label: t('auth.rentBoat'), sub: t('auth.tenantSub') },
    { value: 'owner', icon: Sailboat, label: t('auth.rentMyBoat'), sub: t('auth.ownerSub') },
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12" style={{ background: '#F7F5F2' }}>
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 block">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#07192E' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          <h1
            className="mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
          >
            {t('auth.registerTitle')}
          </h1>
          <p className="mb-6 text-sm" style={{ color: '#8896A8' }}>
            {t('auth.registerSubtitle')}
          </p>

          <div className="rounded-3xl bg-white p-8" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#3D4D61' }}
                  >
                    {t('auth.firstName')}
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
                    className="mb-2 block text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#3D4D61' }}
                  >
                    {t('auth.lastName')}
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
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#3D4D61' }}
                >
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider" style={{ color: '#3D4D61' }}>
                  {t('auth.roleLabel')}
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {roles.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer flex-col items-center rounded-2xl p-4 transition-all"
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
                        <span className="mt-0.5 text-center text-xs" style={{ color: '#8896A8' }}>
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
                    {t('auth.privacyTextStart')}{' '}
                    <Link to="/legal/privacy" className="font-bold hover:underline" style={{ color: '#07192E' }}>
                      {t('auth.privacyLink')}
                    </Link>{' '}
                    {t('auth.privacyTextEnd')}
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
                  <span>{t('auth.marketingConsent')}</span>
                </label>
              </div>

              <ErrorMessage message={error} />

              <TurnstileCaptcha onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#07192E', color: '#fff' }}
              >
                {loading ? t('auth.registerLoading') : t('auth.registerCta')}
              </button>
            </form>

            <p className="mt-5 text-center text-sm" style={{ color: '#8896A8' }}>
              {t('auth.alreadyAccount')}{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#07192E' }}>
                {t('auth.loginCta')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          background: 'linear-gradient(145deg, #07192E 0%, #0B3246 44%, #069BB0 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7,25,46,0.08) 0%, rgba(7,25,46,0.68) 100%), url(${HERO})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <p
            className="mb-3 leading-tight text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38,
              fontWeight: 800,
              textShadow: '0 8px 28px rgba(0,0,0,0.28)',
            }}
          >
            {t('auth.registerHeroTitle')}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {t('auth.registerHeroText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
