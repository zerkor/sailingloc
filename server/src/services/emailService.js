const { createTransporter, emailConfig, validateEmailConfig } = require('../config/email');
const templates = require('./emailTemplates');

const safeError = (error) => error?.code || error?.name || error?.message || 'EMAIL_ERROR';

const sendEmailWithBrevoApi = async ({ to, subject, html, text }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), emailConfig.apiTimeout);

  try {
    const response = await fetch(emailConfig.apiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'api-key': emailConfig.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: emailConfig.fromName, email: emailConfig.fromAddress },
        replyTo: { email: emailConfig.replyTo },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `BREVO_API_${response.status}`);
      error.code = data.code || `BREVO_API_${response.status}`;
      throw error;
    }

    return data.messageId || data.messageIds?.[0];
  } finally {
    clearTimeout(timeout);
  }
};

const sendEmailWithSmtp = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
    replyTo: emailConfig.replyTo,
    to,
    subject,
    html,
    text,
  });
  return info.messageId;
};

const sendEmail = async ({ to, subject, html, text, templateName = 'email' }) => {
  const result = {
    success: false,
    provider: emailConfig.provider,
    mode: emailConfig.mode,
    messageId: undefined,
    error: undefined,
  };

  if (!emailConfig.enabled) {
    return { ...result, success: true, skipped: true, reason: 'disabled' };
  }

  if (emailConfig.logOnly) {
    console.info(`[mail:log-only] ${subject} -> ${to}`);
    return { ...result, success: true, skipped: true, reason: 'log_only' };
  }

  try {
    const missing = validateEmailConfig();
    if (missing.length > 0) {
      const error = new Error(`Missing email configuration: ${missing.join(', ')}`);
      error.code = 'EMAIL_CONFIG_MISSING';
      throw error;
    }

    const messageId =
      emailConfig.mode === 'api'
        ? await sendEmailWithBrevoApi({ to, subject, html, text })
        : await sendEmailWithSmtp({ to, subject, html, text });

    return { ...result, success: true, messageId };
  } catch (error) {
    console.error(`Email sending failed for ${templateName} to ${to}: ${safeError(error)}`);
    return { ...result, error: safeError(error) };
  }
};

const sendTemplate = async ({ to, templateName, template }) =>
  sendEmail({ to, subject: template.subject, html: template.html, text: template.text, templateName });

const sendWelcomeTenantEmail = (user) =>
  sendTemplate({ to: user.email, templateName: 'tenantWelcome', template: templates.tenantWelcome(user) });

const sendWelcomeOwnerEmail = (user) =>
  sendTemplate({ to: user.email, templateName: 'ownerWelcome', template: templates.ownerWelcome(user) });

const sendOwnerApprovedEmail = (user) =>
  sendTemplate({ to: user.email, templateName: 'ownerApproved', template: templates.ownerApproved(user) });

const sendBoatApprovedEmail = ({ owner, boat }) =>
  sendTemplate({ to: owner.email, templateName: 'boatApproved', template: templates.boatApproved({ owner, boat }) });

const sendBoatRejectedEmail = ({ owner, boat, reason }) =>
  sendTemplate({
    to: owner.email,
    templateName: 'boatRejected',
    template: templates.boatRejected({ owner, boat, reason }),
  });

const sendBookingCreatedEmail = ({ tenant, owner, boat, booking }) =>
  sendTemplate({
    to: owner.email,
    templateName: 'bookingCreated',
    template: templates.bookingCreated({ tenant, owner, boat, booking }),
  });

const sendBookingAcceptedEmail = ({ tenant, owner, boat, booking }) =>
  sendTemplate({
    to: tenant.email,
    templateName: 'bookingAccepted',
    template: templates.bookingAccepted({ tenant, owner, boat, booking }),
  });

const sendBookingRejectedEmail = ({ tenant, owner, boat, booking }) =>
  sendTemplate({
    to: tenant.email,
    templateName: 'bookingRejected',
    template: templates.bookingRejected({ tenant, owner, boat, booking }),
  });

const sendBookingConfirmedEmail = ({ tenant, owner, boat, booking }) =>
  sendTemplate({
    to: tenant.email,
    templateName: 'bookingConfirmed',
    template: templates.bookingConfirmed({ tenant, owner, boat, booking }),
  });

const sendBookingCancelledEmail = ({ tenant, owner, boat, booking }) =>
  sendTemplate({
    to: tenant.email,
    templateName: 'bookingCancelled',
    template: templates.bookingCancelled({ tenant, owner, boat, booking }),
  });

const sendBookingCompletedEmail = ({ tenant, owner, boat, booking }) =>
  sendTemplate({
    to: tenant.email,
    templateName: 'bookingCompleted',
    template: templates.bookingCompleted({ tenant, owner, boat, booking }),
  });

const sendPasswordResetEmail = ({ user, resetUrl }) =>
  sendTemplate({
    to: user.email,
    templateName: 'passwordReset',
    template: templates.passwordReset({ user, resetUrl }),
  });

const sendAdminTestEmail = ({ to }) => sendTemplate({ to, templateName: 'adminTest', template: templates.testEmail() });

module.exports = {
  sendEmail,
  sendWelcomeTenantEmail,
  sendWelcomeOwnerEmail,
  sendOwnerApprovedEmail,
  sendBoatApprovedEmail,
  sendBoatRejectedEmail,
  sendBookingCreatedEmail,
  sendBookingAcceptedEmail,
  sendBookingRejectedEmail,
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
  sendBookingCompletedEmail,
  sendPasswordResetEmail,
  sendAdminTestEmail,
};
