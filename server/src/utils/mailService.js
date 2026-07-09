const nodemailer = require('nodemailer');

const smtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!smtpConfigured()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildResetPasswordEmail = ({ firstName, resetUrl }) => ({
  subject: 'Reinitialisation de votre mot de passe SailingLoc',
  text: [
    `Bonjour ${firstName || ''}`.trim(),
    '',
    'Vous avez demande la reinitialisation de votre mot de passe SailingLoc.',
    `Lien de reinitialisation : ${resetUrl}`,
    '',
    'Ce lien expire dans 30 minutes. Si vous n etes pas a l origine de cette demande, ignorez cet e-mail.',
    '',
    'L equipe SailingLoc',
  ].join('\n'),
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#07192e">
      <h1 style="margin:0 0 16px;color:#07192e">Reinitialisation du mot de passe</h1>
      <p>Bonjour ${firstName || ''},</p>
      <p>Vous avez demande la reinitialisation de votre mot de passe SailingLoc.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;background:#00c6e0;color:#07192e;font-weight:700;text-decoration:none;padding:12px 18px;border-radius:999px">
          Choisir un nouveau mot de passe
        </a>
      </p>
      <p style="color:#64748b">Ce lien expire dans 30 minutes. Si vous n etes pas a l origine de cette demande, ignorez cet e-mail.</p>
      <p>L equipe SailingLoc</p>
    </div>
  `,
});

const sendPasswordResetEmail = async ({ to, firstName, resetUrl }) => {
  const message = buildResetPasswordEmail({ firstName, resetUrl });
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'SailingLoc <no-reply@sailingloc.local>';
  const transporter = getTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[mail:dev] Password reset for ${to}: ${resetUrl}`);
      return { skipped: true, resetUrl };
    }
    throw new Error('SMTP is not configured');
  }

  return transporter.sendMail({
    from,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
};

module.exports = { sendPasswordResetEmail, smtpConfigured };
