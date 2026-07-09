const express = require('express');
const path = require('path');
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

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(uploadRoot)));

app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
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

// Add boat reviews route
const { getBoatReviews } = require('./controllers/reviewController');
app.get('/api/boats/:id/reviews', getBoatReviews);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
