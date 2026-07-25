import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send, ShieldCheck } from 'lucide-react';
import { sendAdminTestEmail } from '../../services/adminEmailService';

const AdminEmailSettingsPage = () => {
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!to || loading) return;
    setLoading(true);
    setStatus('Test email en cours. La réponse peut prendre quelques secondes...');
    setMessage('');
    setError('');

    try {
      const { data } = await sendAdminTestEmail(to);
      if (data.skipped) {
        setMessage('Email simulé/loggé : EMAIL_LOG_ONLY ou EMAIL_ENABLED désactive l’envoi réel.');
      } else {
        setMessage(`Email de test envoyé à ${to}. Vérifie aussi les spams ou promotions.`);
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Timeout email : aucune réponse après 20 secondes. Vérifie BREVO_API_KEY, EMAIL_MODE et Render Logs.');
      } else {
        const apiMessage = err.response?.data?.message || "L'email de test n'a pas pu être envoyé.";
        const errorCode = err.response?.data?.errorCode;
        setError(errorCode ? `${apiMessage} Code : ${errorCode}` : apiMessage);
      }
    } finally {
      setStatus('');
      setLoading(false);
    }
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
          Emails transactionnels
        </h1>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: '#66758A' }}>
          Les identifiants Brevo sont configurés uniquement dans les variables d'environnement Render. Aucun mot de
          passe SMTP ni clé API n'est affiché dans l'interface.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <ShieldCheck size={24} color="#00C6E0" />
          <h2 className="mt-3 font-bold" style={{ color: '#07192E' }}>
            Fournisseur
          </h2>
          <p className="mt-1 text-sm" style={{ color: '#66758A' }}>
            Brevo API recommandé sur Render, SMTP disponible en fallback.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <Mail size={24} color="#00C6E0" />
          <h2 className="mt-3 font-bold" style={{ color: '#07192E' }}>
            Emails envoyés automatiquement
          </h2>
          <p className="mt-1 text-sm" style={{ color: '#66758A' }}>
            Création de compte, mot de passe oublié, validation d'annonce bateau et événements de réservation.
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
    </div>
  );
};

export default AdminEmailSettingsPage;
