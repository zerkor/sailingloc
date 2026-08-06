import { useState } from 'react';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import { subscribeNewsletter } from '../services/newsletterService';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!consent) {
      setStatus({ type: 'error', message: 'Veuillez accepter de recevoir la newsletter SailingLoc.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await subscribeNewsletter(email);
      setEmail('');
      setConsent(false);
      setStatus({ type: 'success', message: 'Inscription confirmee. Merci, vous recevrez les actualites SailingLoc.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || "L'inscription newsletter a echoue. Verifiez votre email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-10 xl:px-14" style={{ background: '#F7F5F2' }}>
      <div
        className="container-max overflow-hidden rounded-2xl border p-6 sm:p-8 lg:p-10"
        style={{
          background: 'linear-gradient(135deg, #07192E 0%, #0E415A 58%, #00A9C0 100%)',
          borderColor: 'rgba(0,198,224,0.18)',
          boxShadow: '0 18px 48px rgba(7,25,46,0.14)',
        }}
      >
        <div className="grid gap-7 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <span
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[1.5px]"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#8DF3FF', background: 'rgba(255,255,255,0.06)' }}
            >
              <Mail size={14} aria-hidden="true" /> Newsletter
            </span>
            <h2
              className="text-3xl font-black leading-tight text-white sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Recevez les meilleures idees de navigation.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Nouveaux bateaux, conseils de location et actualites SailingLoc. Aucun achat reel ne peut etre effectue
              sur ce projet etudiant fictif.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-xl sm:p-5" aria-label="Inscription newsletter">
            <label htmlFor="newsletter-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Adresse email
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@example.fr"
                className="input-field flex-1"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition-all disabled:opacity-60"
                style={{ background: '#07192E', color: '#fff' }}
              >
                {loading ? 'Envoi...' : "S'inscrire"} <Send size={15} aria-hidden="true" />
              </button>
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4"
                style={{ accentColor: '#00C6E0' }}
              />
              <span>J'accepte de recevoir la newsletter SailingLoc et je peux me desinscrire a tout moment.</span>
            </label>

            {status.message && (
              <p
                className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
                style={{
                  background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: status.type === 'success' ? '#047857' : '#B91C1C',
                }}
                role="status"
                aria-live="polite"
              >
                {status.type === 'success' && <ShieldCheck size={15} aria-hidden="true" />}
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
