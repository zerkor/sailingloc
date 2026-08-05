// src/pages/ContactPage.jsx
import { useState } from 'react';
import { ArrowRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumb from '../components/Breadcrumb';

const SUBJECTS = [
  { value: '', label: 'Choisir un sujet…', disabled: true },
  { value: 'technique', label: 'Problème technique' },
  { value: 'location', label: 'Location' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'autre', label: 'Autre' },
];

const INFO_ITEMS = [
  { icon: Mail, label: 'Email', value: 'contact@sailingloc.fr' },
  { icon: Phone, label: 'Téléphone', value: '+33 1 23 45 67 89' },
  { icon: MapPin, label: 'Adresse', value: '12 Rue du Port, 75001 Paris' },
  { icon: Clock, label: 'Horaires', value: 'Lun–Ven  9h–18h' },
];

const AnchorSVG = () => (
  <svg viewBox="0 0 100 120" width="160" height="160" fill="none" aria-hidden="true" style={{ opacity: 0.12 }}>
    <circle cx="50" cy="18" r="10" stroke="#00C6E0" strokeWidth="3" />
    <line x1="50" y1="28" x2="50" y2="90" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="48" x2="78" y2="48" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 90 Q50 110 78 90" stroke="#00C6E0" strokeWidth="3" fill="none" strokeLinecap="round" />
    <line x1="22" y1="76" x2="22" y2="90" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
    <line x1="78" y1="76" x2="78" y2="90" stroke="#00C6E0" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const LABEL_CLS = 'block text-xs font-bold uppercase tracking-wider mb-2';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis.';
    if (!form.email.trim()) errs.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Format d'email invalide.";
    if (!form.subject) errs.subject = 'Choisissez un sujet.';
    if (!form.message.trim()) errs.message = 'Le message est requis.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      await api.post('/contact', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Impossible d'envoyer le message pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name) =>
    errors[name] ? { borderColor: '#dc2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.12)' } : {};

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>
      {/* ── Hero banner ── */}
      <div className="py-14 sm:py-16 px-4 sm:px-6 lg:px-10 xl:px-14" style={{ background: '#07192E' }}>
        <div className="container-max">
          <Breadcrumb className="site-breadcrumb--light" items={[{ label: 'Contact' }]} />
          <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>
            Contact
          </span>
          <h1
            className="mt-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px,4vw,48px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            Nous sommes à votre <em style={{ color: '#00C6E0', fontStyle: 'italic' }}>écoute</em>
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480 }}>
            Une question sur une location, un problème technique ou un partenariat ? Notre équipe répond sous 24h.
          </p>
        </div>
      </div>

      {/* ── Success toast ── */}
      {success && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold"
          style={{
            background: 'rgba(22,163,74,0.95)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(22,163,74,0.35)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Check size={16} /> Message envoyé
        </div>
      )}

      {/* ── Content ── */}
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* ── Left: form ── */}
          <div
            className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10"
            style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
          >
            <h2
              className="mb-6"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#07192E' }}
            >
              Envoyer un message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <ErrorMessage message={submitError} />

              {/* Name */}
              <div>
                <label htmlFor="ct-name" className={LABEL_CLS} style={{ color: '#3D4D61' }}>
                  Nom complet *
                </label>
                <input
                  id="ct-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Jean Dupont"
                  style={fieldStyle('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-medium" style={{ color: '#dc2626' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="ct-email" className={LABEL_CLS} style={{ color: '#3D4D61' }}>
                  Email *
                </label>
                <input
                  id="ct-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="jean.dupont@exemple.fr"
                  style={fieldStyle('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium" style={{ color: '#dc2626' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="ct-subject" className={LABEL_CLS} style={{ color: '#3D4D61' }}>
                  Sujet *
                </label>
                <select
                  id="ct-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="input-field"
                  style={fieldStyle('subject')}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value} disabled={!!s.disabled}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-xs font-medium" style={{ color: '#dc2626' }}>
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="ct-message" className={LABEL_CLS} style={{ color: '#3D4D61' }}>
                  Message *
                </label>
                <textarea
                  id="ct-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="input-field"
                  rows={5}
                  placeholder="Décrivez votre demande…"
                  style={fieldStyle('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-xs font-medium" style={{ color: '#dc2626' }}>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
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
                  <span className="inline-flex items-center gap-2">
                    Envoyer le message <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* ── Right: info + deco ── */}
          <div className="space-y-6">
            <div
              className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10"
              style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
            >
              <h2
                className="mb-6"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#07192E' }}
              >
                Informations de contact
              </h2>

              <div className="space-y-5">
                {INFO_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'rgba(0,198,224,0.1)' }}
                      >
                        <Icon size={20} color="#00C6E0" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8896A8' }}>
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: '#07192E' }}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decorative anchor */}
            <div className="flex justify-center py-6">
              <AnchorSVG />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
