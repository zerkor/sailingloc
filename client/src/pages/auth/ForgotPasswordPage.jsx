// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HERO = 'https://images.unsplash.com/photo-1548793428-9e9e1e37e84c?w=900&q=85&auto=format&fit=crop';

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(res => setTimeout(res, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-16" style={{ background: '#F7F5F2' }}>
        <div className="w-full max-w-md">

          <Link to="/" className="block mb-10">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#07192E' }}>
              Sailing<span style={{ color: '#00C6E0' }}>Loc</span>
            </span>
          </Link>

          <h1
            className="mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
          >
            Mot de passe oublié
          </h1>
          <p className="text-sm mb-8" style={{ color: '#8896A8' }}>
            Saisissez votre email pour recevoir un lien de réinitialisation.
          </p>

          <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            {sent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📬</div>
                <p
                  className="font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#07192E' }}
                >
                  Email envoyé !
                </p>
                <p className="text-sm mb-6" style={{ color: '#8896A8' }}>
                  Si un compte existe pour <strong style={{ color: '#07192E' }}>{email}</strong>, vous recevrez
                  un lien de réinitialisation dans les prochaines minutes.
                </p>
                <Link
                  to="/login"
                  className="inline-block text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:opacity-90"
                  style={{ background: '#07192E', color: '#fff' }}
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="fp-email"
                    className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: '#3D4D61' }}
                  >
                    Email
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="vous@exemple.fr"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#07192E', color: '#fff' }}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Envoi en cours…
                    </>
                  ) : (
                    'Envoyer le lien'
                  )}
                </button>
              </form>
            )}

            <p className="text-center text-sm mt-5" style={{ color: '#8896A8' }}>
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#07192E' }}>
                ← Retour à la connexion
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

export default ForgotPasswordPage;
