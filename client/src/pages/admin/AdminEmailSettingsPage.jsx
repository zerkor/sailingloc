import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send, ShieldCheck } from 'lucide-react';
import { sendAdminNewsletter, sendAdminTestEmail } from '../../services/adminEmailService';

const initialNewsletter = {
  subject: 'Les nouveautes SailingLoc vous attendent',
  title: 'Cap sur votre prochaine sortie en mer',
  message:
    'Notre catalogue SailingLoc s enrichit avec de nouveaux bateaux disponibles en France. Comparez les annonces, consultez les disponibilites et preparez votre prochaine navigation depuis votre espace client.',
  includeAllTenants: true,
};

const AdminEmailSettingsPage = () => {
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [newsletterResult, setNewsletterResult] = useState(null);
  const [newsletterError, setNewsletterError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!to || loading) return;
    setLoading(true);
    setStatus('Test email en cours. La reponse peut prendre quelques secondes...');
    setMessage('');
    setError('');

    try {
      const { data } = await sendAdminTestEmail(to);
      if (data.skipped) {
        setMessage('Email simule/logge : EMAIL_LOG_ONLY ou EMAIL_ENABLED desactive l envoi reel.');
      } else {
        setMessage(`Email de test envoye a ${to}. Verifie aussi les spams ou promotions.`);
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Timeout email : aucune reponse apres 20 secondes. Verifie BREVO_API_KEY, EMAIL_MODE et Render Logs.');
      } else {
        const apiMessage = err.response?.data?.message || "L'email de test n'a pas pu etre envoye.";
        const errorCode = err.response?.data?.errorCode;
        setError(errorCode ? `${apiMessage} Code : ${errorCode}` : apiMessage);
      }
    } finally {
      setStatus('');
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    if (newsletterLoading) return;
    setNewsletterLoading(true);
    setNewsletterResult(null);
    setNewsletterError('');

    try {
      const { data } = await sendAdminNewsletter(newsletter);
      setNewsletterResult(data);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setNewsletterError('Timeout newsletter : l envoi prend trop de temps. Verifie Render Logs pour le detail.');
      } else {
        setNewsletterError(err.response?.data?.message || "La newsletter n'a pas pu etre envoyee.");
      }
    } finally {
      setNewsletterLoading(false);
    }
  };

  const updateNewsletter = (field, value) => {
    setNewsletter((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: '#00AFC7' }}>
          Configuration
        </p>
        <h1
          className="mt-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
        >
          Emails et newsletter
        </h1>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: '#66758A' }}>
          Les identifiants Brevo sont configures uniquement dans les variables d'environnement Render. Aucun mot de
          passe SMTP ni cle API n'est affiche dans l'interface.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <ShieldCheck size={24} color="#00C6E0" />
          <h2 className="mt-3 font-bold" style={{ color: '#07192E' }}>
            Fournisseur
          </h2>
          <p className="mt-1 text-sm" style={{ color: '#66758A' }}>
            Brevo API recommandee sur Render, SMTP disponible en fallback.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <Mail size={24} color="#00C6E0" />
          <h2 className="mt-3 font-bold" style={{ color: '#07192E' }}>
            Emails envoyes automatiquement
          </h2>
          <p className="mt-1 text-sm" style={{ color: '#66758A' }}>
            Creation de compte, mot de passe oublie, validation d'annonce bateau, reservations et newsletter clients.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
        <label htmlFor="test-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Destinataire du test
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="test-email"
            type="email"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="input-field flex-1"
            placeholder="test@example.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold disabled:opacity-50"
            style={{ background: '#07192E', color: '#fff' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? 'Test en cours...' : 'Envoyer un test'}
          </button>
        </div>
        {status && (
          <p className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            {status}
          </p>
        )}
        {message && (
          <p
            className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#ECFDF5', color: '#047857' }}
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </p>
        )}
        {error && (
          <p
            className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#FEF2F2', color: '#B91C1C' }}
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </form>

      <form onSubmit={handleNewsletterSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#00AFC7' }}>
              Newsletter clients
            </p>
            <h2 className="mt-1 text-xl font-bold" style={{ color: '#07192E' }}>
              Envoyer une newsletter SailingLoc
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#66758A' }}>
              Envoi via Brevo aux comptes locataires actifs.
            </p>
          </div>
          <button
            type="submit"
            disabled={newsletterLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold disabled:opacity-50"
            style={{ background: '#00C6E0', color: '#07192E' }}
          >
            {newsletterLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {newsletterLoading ? 'Envoi...' : 'Envoyer aux clients'}
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Sujet email</span>
            <input
              type="text"
              value={newsletter.subject}
              onChange={(event) => updateNewsletter('subject', event.target.value)}
              className="input-field mt-2"
              required
              maxLength={140}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Titre du mail</span>
            <input
              type="text"
              value={newsletter.title}
              onChange={(event) => updateNewsletter('title', event.target.value)}
              className="input-field mt-2"
              required
              maxLength={140}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Message</span>
            <textarea
              value={newsletter.message}
              onChange={(event) => updateNewsletter('message', event.target.value)}
              className="input-field mt-2 min-h-32"
              required
              maxLength={1600}
            />
          </label>
          <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm" style={{ color: '#344256' }}>
            <input
              type="checkbox"
              checked={newsletter.includeAllTenants}
              onChange={(event) => updateNewsletter('includeAllTenants', event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              Envoyer a tous les locataires actifs. Decoche pour cibler uniquement les clients ayant accepte les emails
              marketing.
            </span>
          </label>
        </div>

        {newsletterResult && (
          <p
            className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: newsletterResult.failed ? '#FFF7ED' : '#ECFDF5', color: newsletterResult.failed ? '#C2410C' : '#047857' }}
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>
              Newsletter traitee : {newsletterResult.total} destinataire(s), {newsletterResult.sent} envoye(s),{' '}
              {newsletterResult.skipped} simule(s), {newsletterResult.failed} erreur(s).
            </span>
          </p>
        )}
        {newsletterError && (
          <p
            className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#FEF2F2', color: '#B91C1C' }}
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{newsletterError}</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default AdminEmailSettingsPage;
