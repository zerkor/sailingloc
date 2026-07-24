const { createTransporter, emailConfig } = require('../config/email');
const templates = require('./emailTemplates');

const safeError = (error) => error?.code || error?.name || 'EMAIL_ERROR';

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
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
      replyTo: emailConfig.replyTo,
      to,
      subject,
      html,
      text,
    });
    return { ...result, success: true, messageId: info.messageId };
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
  sendPasswordResetEmail,
  sendAdminTestEmail,
};
