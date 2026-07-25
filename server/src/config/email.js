const nodemailer = require('nodemailer');

const asBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === 'true';
};

const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'brevo',
  mode: process.env.EMAIL_MODE || 'smtp',
  apiKey: process.env.BREVO_API_KEY,
  apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
  apiTimeout: Number(process.env.EMAIL_API_TIMEOUT_MS || 15000),
  enabled: asBoolean(process.env.EMAIL_ENABLED, process.env.NODE_ENV === 'production'),
  logOnly: asBoolean(process.env.EMAIL_LOG_ONLY, process.env.NODE_ENV !== 'production'),
  smtp: {
    host: process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587),
    secure: asBoolean(process.env.BREVO_SMTP_SECURE || process.env.SMTP_SECURE, false),
    user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS,
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 15000),
  },
  fromName: process.env.EMAIL_FROM_NAME || 'SailingLoc',
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'contact@sailingloc.fr',
  replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM_ADDRESS || 'contact@sailingloc.fr',
  clientUrl: (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  serverUrl: (process.env.SERVER_URL || 'http://localhost:5000').replace(/\/$/, ''),
};

const validateEmailConfig = () => {
  if (!emailConfig.enabled || emailConfig.logOnly) return [];
  const missing = [];
  if (emailConfig.mode === 'api') {
    if (!emailConfig.apiKey) missing.push('BREVO_API_KEY');
  } else {
    if (!emailConfig.smtp.host) missing.push('BREVO_SMTP_HOST');
    if (!emailConfig.smtp.port) missing.push('BREVO_SMTP_PORT');
    if (!emailConfig.smtp.user) missing.push('BREVO_SMTP_USER');
    if (!emailConfig.smtp.pass) missing.push('BREVO_SMTP_PASS');
  }
  if (!emailConfig.fromAddress) missing.push('EMAIL_FROM_ADDRESS');
  return missing;
};

const createTransporter = () => {
  const missing = validateEmailConfig();
  if (missing.length > 0) {
    throw new Error(`Email configuration is incomplete: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    auth: {
      user: emailConfig.smtp.user,
      pass: emailConfig.smtp.pass,
    },
    connectionTimeout: emailConfig.smtp.connectionTimeout,
    greetingTimeout: emailConfig.smtp.greetingTimeout,
    socketTimeout: emailConfig.smtp.socketTimeout,
  });
};

const verifyEmailConnection = async () => {
  if (!emailConfig.enabled || emailConfig.logOnly) {
    return { success: true, skipped: true, reason: emailConfig.enabled ? 'log_only' : 'disabled' };
  }
  const transporter = createTransporter();
  await transporter.verify();
  return { success: true };
};

module.exports = {
  emailConfig,
  validateEmailConfig,
  createTransporter,
  verifyEmailConnection,
};
