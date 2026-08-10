import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { resetPassword } from '../../services/authService';
import SEO from '../../components/SEO';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: '#F7F5F2' }}>
      <SEO
        title="Réinitialisation du mot de passe — SailingLoc"
        description="Page privée de création d'un nouveau mot de passe SailingLoc."
        noIndex
      />
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
          Nouveau mot de passe
        </h1>
        <p className="text-sm mb-8" style={{ color: '#8896A8' }}>
          Choisissez un nouveau mot de passe sécurisé pour votre compte SailingLoc.
        </p>

        <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="mx-auto mb-4" color="#00C6E0" />
              <p
                className="font-bold mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#07192E' }}
              >
                Mot de passe mis à jour
              </p>
              <p className="text-sm mb-6" style={{ color: '#8896A8' }}>
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:opacity-90"
                style={{ background: '#07192E', color: '#fff' }}
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: '#3D4D61' }}
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-field"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: '#3D4D61' }}
                >
                  Confirmation
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="input-field"
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="text-sm rounded-2xl px-4 py-3" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#07192E', color: '#fff' }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} /> Réinitialiser
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-5" style={{ color: '#8896A8' }}>
            <Link
              to="/login"
              className="font-bold hover:underline inline-flex items-center justify-center gap-1.5"
              style={{ color: '#07192E' }}
            >
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
