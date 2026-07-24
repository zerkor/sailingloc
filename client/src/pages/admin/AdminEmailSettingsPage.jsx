import { useState } from 'react';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import { sendAdminTestEmail } from '../../services/adminEmailService';

const AdminEmailSettingsPage = () => {
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!to || loading) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await sendAdminTestEmail(to);
      setMessage(data.skipped ? 'Email simulé/loggé selon la configuration actuelle.' : 'Email de test envoyé.');
    } catch (err) {
      setError(err.response?.data?.message || "L'email de test n'a pas pu être envoyé.");
    } finally {
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
          Les identifiants Brevo SMTP sont configurés uniquement dans les variables d'environnement Render. Aucun mot de
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
            Brevo SMTP via Nodemailer côté serveur.
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
            <Send size={16} />
            {loading ? 'Envoi...' : 'Envoyer un test'}
          </button>
        </div>
        {message && (
          <p className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#ECFDF5', color: '#047857' }}>
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default AdminEmailSettingsPage;
