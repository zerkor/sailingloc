const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { setupSwagger } = require('./config/swagger');
const { uploadRoot } = require('./middleware/uploadMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const boatRoutes = require('./routes/boatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const demoRoutes = require('./routes/demoRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const { stripeWebhook } = require('./controllers/paymentController');

const app = express();
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');

const renderClientIndex = () => {
  return fs.readFileSync(clientIndexPath, 'utf8');
};

const sanitizeUrlEnv = (value, fallback) => {
  const firstValue = String(value || '')
    .split(/\s+/)
    .find((part) => /^https?:\/\//i.test(part));

  try {
    return new URL(firstValue || fallback).origin;
  } catch {
    return fallback;
  }
};

const configuredClientOrigin = sanitizeUrlEnv(process.env.CLIENT_URL || process.env.FRONTEND_URL, 'http://localhost:5173');
const allowedOrigins = new Set([
  configuredClientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://dsp-dev-o24a-g6-fr.onrender.com',
]);

const resolveCorsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  try {
    const requestOrigin = new URL(origin).origin;
    if (allowedOrigins.has(requestOrigin)) return callback(null, requestOrigin);
  } catch {
    return callback(null, configuredClientOrigin);
  }

  return callback(null, configuredClientOrigin);
};

app.use(
  helmet({
    frameguard: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: [
          "'self'",
          'https://tagassistant.google.com',
          'https://tagmanager.google.com',
          'https://analytics.google.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ["'self'", 'https://www.googletagmanager.com', 'https://challenges.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://challenges.cloudflare.com'],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          'https://www.googletagmanager.com',
          'https://challenges.cloudflare.com',
        ],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        connectSrc: [
          "'self'",
          'https://www.google-analytics.com',
          'https://region1.google-analytics.com',
          'https://analytics.google.com',
          'https://stats.g.doubleclick.net',
          'https://challenges.cloudflare.com',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: resolveCorsOrigin,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  skip: (req) =>
    req.method === 'GET' &&
    (req.path === '/health' ||
      req.path === '/boats' ||
      req.path.startsWith('/boats/') ||
      req.originalUrl === '/api/health' ||
      req.originalUrl.startsWith('/api/boats')),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '10mb';
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonBodyLimit }));
app.use('/uploads', express.static(path.resolve(uploadRoot)));

app.get('/api', (req, res) =>
  res.json({
    name: 'SailingLoc API',
    status: 'online',
    health: '/api/health',
    docs: '/api-docs',
    timestamp: new Date().toISOString(),
  })
);

app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
);

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boats', boatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Add boat reviews route
const { getBoatReviews } = require('./controllers/reviewController');
app.get('/api/boats/:id/reviews', getBoatReviews);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath, { index: false }));
  app.get(/^\/(?!api|api-docs|uploads).*/, (req, res) => {
    res.type('html').send(renderClientIndex());
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
