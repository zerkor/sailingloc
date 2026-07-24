const { emailConfig } = require('../config/email');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));

const formatPrice = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount || 0));

const fullName = (user = {}) => `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';

const layout = ({ title, intro, ctaLabel, ctaUrl, details = [] }) => {
  const detailHtml =
    details.length > 0
      ? `<div style="margin:18px 0;padding:16px;border-radius:14px;background:#f3f7fa">${details
          .map(
            (item) =>
              `<p style="margin:4px 0;color:#344256"><strong>${escapeHtml(item.label)} :</strong> ${escapeHtml(
                item.value
              )}</p>`
          )
          .join('')}</div>`
      : '';
  const ctaHtml = ctaUrl
    ? `<p style="margin:24px 0 8px"><a href="${escapeHtml(
        ctaUrl
      )}" style="display:inline-block;background:#00c6e0;color:#07192e;font-weight:800;text-decoration:none;padding:13px 20px;border-radius:999px">${escapeHtml(
        ctaLabel
      )}</a></p>`
    : '';

  return `
    <div style="margin:0;padding:24px;background:#edf3f7;font-family:Arial,sans-serif;color:#07192e">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(7,25,46,0.12)">
        <div style="background:#07192e;padding:24px 28px">
          <p style="margin:0;font-size:24px;font-weight:800;color:#ffffff">Sailing<span style="color:#00c6e0">Loc</span></p>
        </div>
        <div style="padding:30px 28px">
          <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#07192e">${escapeHtml(title)}</h1>
          ${intro.map((line) => `<p style="margin:0 0 14px;color:#344256">${escapeHtml(line)}</p>`).join('')}
          ${detailHtml}
          ${ctaHtml}
        </div>
        <div style="padding:18px 28px;background:#f7f9fb;color:#66758a;font-size:12px">
          <p style="margin:0">SailingLoc - Location de bateaux entre particuliers</p>
          <p style="margin:6px 0 0">Contact : ${escapeHtml(emailConfig.replyTo)}</p>
        </div>
      </div>
    </div>
  `;
};

const plain = ({ title, intro, ctaLabel, ctaUrl, details = [] }) =>
  [
    `SailingLoc - ${title}`,
    '',
    ...intro,
    '',
    ...details.map((item) => `${item.label} : ${item.value}`),
    ctaUrl ? ['', `${ctaLabel} : ${ctaUrl}`] : [],
    '',
    `Contact : ${emailConfig.replyTo}`,
  ]
    .flat()
    .join('\n');

const buildTemplate = (payload) => ({ subject: payload.subject, html: layout(payload), text: plain(payload) });

const tenantWelcome = (user) =>
  buildTemplate({
    subject: 'Bienvenue sur SailingLoc',
    title: 'Bienvenue sur SailingLoc',
    intro: [
      `Bonjour ${user.firstName || ''},`,
      'Votre compte locataire SailingLoc a bien été créé.',
      'Vous pouvez maintenant rechercher et réserver des bateaux entre particuliers.',
    ],
    ctaLabel: 'Voir les bateaux',
    ctaUrl: `${emailConfig.clientUrl}/boats`,
  });

const ownerWelcome = (user) =>
  buildTemplate({
    subject: 'Bienvenue sur SailingLoc - Espace propriétaire',
    title: 'Bienvenue dans votre espace propriétaire',
    intro: [
      `Bonjour ${user.firstName || ''},`,
      'Votre compte propriétaire SailingLoc a bien été créé.',
      'Vous pouvez maintenant proposer vos bateaux à la location. Selon le fonctionnement du site, vos annonces pourront être vérifiées par l’administration avant publication.',
    ],
    ctaLabel: 'Accéder à mon espace propriétaire',
    ctaUrl: `${emailConfig.clientUrl}/owner/dashboard`,
  });

const ownerApproved = (user) =>
  buildTemplate({
    subject: 'Votre compte propriétaire SailingLoc est validé',
    title: 'Compte propriétaire validé',
    intro: [
      `Bonjour ${user.firstName || ''},`,
      'Votre compte propriétaire a été validé.',
      'Vous pouvez désormais gérer vos annonces et vos réservations.',
    ],
    ctaLabel: 'Accéder à mon espace propriétaire',
    ctaUrl: `${emailConfig.clientUrl}/owner/dashboard`,
  });

const boatApproved = ({ owner, boat }) =>
  buildTemplate({
    subject: 'Votre annonce bateau a été validée',
    title: 'Annonce validée',
    intro: [
      `Bonjour ${owner.firstName || ''},`,
      `Votre annonce ${boat.title} a été validée par l’administration.`,
      'Elle est maintenant visible par les utilisateurs.',
    ],
    ctaLabel: 'Voir mon annonce',
    ctaUrl: `${emailConfig.clientUrl}/boats/${boat._id}`,
  });

const boatRejected = ({ owner, boat, reason }) =>
  buildTemplate({
    subject: 'Votre annonce bateau nécessite une correction',
    title: 'Annonce à corriger',
    intro: [
      `Bonjour ${owner.firstName || ''},`,
      `Votre annonce ${boat.title} n’a pas pu être validée.`,
      reason || 'Merci de vérifier les informations de l’annonce avant de la soumettre à nouveau.',
    ],
    ctaLabel: 'Modifier mon annonce',
    ctaUrl: `${emailConfig.clientUrl}/owner/boats/${boat._id}/edit`,
  });

const bookingDetails = ({ tenant, boat, booking }) => [
  { label: 'Bateau', value: boat.title },
  { label: 'Locataire', value: fullName(tenant) },
  { label: 'Début', value: formatDate(booking.startDate) },
  { label: 'Fin', value: formatDate(booking.endDate) },
  { label: 'Total', value: formatPrice(booking.totalPrice) },
];

const bookingCreated = ({ tenant, owner, boat, booking }) =>
  buildTemplate({
    subject: 'Nouvelle demande de réservation',
    title: 'Nouvelle demande de réservation',
    intro: [
      `Bonjour ${owner.firstName || ''},`,
      `Vous avez reçu une nouvelle demande de réservation pour ${boat.title}.`,
    ],
    details: bookingDetails({ tenant, boat, booking }),
    ctaLabel: 'Voir la réservation',
    ctaUrl: `${emailConfig.clientUrl}/owner/bookings`,
  });

const bookingAccepted = ({ tenant, boat, booking }) =>
  buildTemplate({
    subject: 'Votre demande de réservation a été acceptée',
    title: 'Réservation acceptée',
    intro: [
      `Bonjour ${tenant.firstName || ''},`,
      `Votre demande de réservation pour ${boat.title} a été acceptée.`,
      'Vous pouvez maintenant finaliser le paiement simulé depuis votre espace.',
    ],
    details: bookingDetails({ tenant, boat, booking }),
    ctaLabel: 'Voir mes réservations',
    ctaUrl: `${emailConfig.clientUrl}/my-bookings`,
  });

const bookingRejected = ({ tenant, boat, booking }) =>
  buildTemplate({
    subject: 'Votre demande de réservation a été refusée',
    title: 'Réservation refusée',
    intro: [
      `Bonjour ${tenant.firstName || ''},`,
      `Votre demande de réservation pour ${boat.title} a été refusée par le propriétaire.`,
      'Vous pouvez rechercher un autre bateau disponible sur SailingLoc.',
    ],
    details: bookingDetails({ tenant, boat, booking }),
    ctaLabel: 'Voir les bateaux',
    ctaUrl: `${emailConfig.clientUrl}/boats`,
  });

const bookingConfirmed = ({ tenant, boat, booking }) =>
  buildTemplate({
    subject: 'Votre réservation est confirmée',
    title: 'Réservation confirmée',
    intro: [
      `Bonjour ${tenant.firstName || ''},`,
      `Votre réservation pour ${boat.title} est confirmée.`,
      'Le paiement simulé a bien été validé.',
    ],
    details: bookingDetails({ tenant, boat, booking }),
    ctaLabel: 'Voir mes réservations',
    ctaUrl: `${emailConfig.clientUrl}/my-bookings`,
  });

const bookingCancelled = ({ tenant, boat, booking }) =>
  buildTemplate({
    subject: 'Votre réservation a été annulée',
    title: 'Réservation annulée',
    intro: [`Bonjour ${tenant.firstName || ''},`, `La réservation pour ${boat.title} a été annulée.`],
    details: bookingDetails({ tenant, boat, booking }),
    ctaLabel: 'Voir mes réservations',
    ctaUrl: `${emailConfig.clientUrl}/my-bookings`,
  });

const passwordReset = ({ user, resetUrl }) =>
  buildTemplate({
    subject: 'Réinitialisation de votre mot de passe SailingLoc',
    title: 'Réinitialisation de votre mot de passe',
    intro: [
      `Bonjour ${user.firstName || ''},`,
      'Vous avez demandé la réinitialisation de votre mot de passe.',
      'Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expire dans 30 minutes.',
    ],
    ctaLabel: 'Réinitialiser mon mot de passe',
    ctaUrl: resetUrl,
  });

const testEmail = () =>
  buildTemplate({
    subject: 'Test SMTP Brevo - SailingLoc',
    title: 'Test SMTP Brevo',
    intro: ['Ceci est un email de test envoyé depuis SailingLoc avec Brevo SMTP.'],
  });

module.exports = {
  tenantWelcome,
  ownerWelcome,
  ownerApproved,
  boatApproved,
  boatRejected,
  bookingCreated,
  bookingAccepted,
  bookingRejected,
  bookingConfirmed,
  bookingCancelled,
  passwordReset,
  testEmail,
};
