const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Boat = require('../src/models/Boat');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const Payment = require('../src/models/Payment');
const Notification = require('../src/models/Notification');
const OwnerDocument = require('../src/models/OwnerDocument');
const Report = require('../src/models/Report');
const AdminActionLog = require('../src/models/AdminActionLog');
const ContactMessage = require('../src/models/ContactMessage');
const { uploadRoot } = require('../src/middleware/uploadMiddleware');

let mongoServer;

test.before(async () => {
  if (process.env.TEST_MONGO_URI) {
    await mongoose.connect(process.env.TEST_MONGO_URI);
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

test.afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Boat.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    OwnerDocument.deleteMany({}),
    Report.deleteMany({}),
    AdminActionLog.deleteMany({}),
    ContactMessage.deleteMany({}),
  ]);
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const futureDate = (daysFromNow) => {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

const createUser = (overrides = {}) =>
  User.create({
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    email: overrides.email || `user-${Date.now()}@sailingloc.test`,
    password: overrides.password || 'Password123!',
    role: overrides.role || 'tenant',
    phone: overrides.phone || '+33600000000',
  });

const loginAs = async (email, password = 'Password123!') => {
  const response = await request(app).post('/api/auth/login').send({ email, password }).expect(200);

  return response.body.token;
};

const createApprovedBoat = async (ownerId, overrides = {}) =>
  Boat.create({
    owner: ownerId,
    title: overrides.title || 'Voilier Test',
    type: overrides.type || 'sailboat',
    description: overrides.description || 'Bateau de test suffisamment decrit pour valider les regles.',
    location: overrides.location || 'Marseille',
    port: overrides.port || 'Vieux-Port',
    pricePerDay: overrides.pricePerDay || 250,
    capacity: overrides.capacity || 6,
    skipperAvailable: overrides.skipperAvailable || false,
    equipments: overrides.equipments || ['GPS'],
    images: overrides.images || ['https://example.com/boat.jpg'],
    unavailableDates: overrides.unavailableDates || [],
    status: overrides.status || 'approved',
  });

test('Auth API: registers, logs in and returns the connected profile', async () => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@sailingloc.test',
      password: 'Password123!',
      role: 'tenant',
      privacyConsent: true,
    })
    .expect(201);

  assert.ok(registerResponse.body.token);
  assert.equal(registerResponse.body.user.role, 'tenant');

  const token = await loginAs('alice@sailingloc.test');

  const profileResponse = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);

  assert.equal(profileResponse.body.email, 'alice@sailingloc.test');
  assert.equal(profileResponse.body.password, undefined);
});

test('Auth API: sends a reset token and updates the password through the reset flow', async () => {
  const user = await createUser({ email: 'reset@sailingloc.test', password: 'OldPassword123!' });
  const fixedTokenBuffer = Buffer.alloc(32, 1);
  const fixedToken = fixedTokenBuffer.toString('hex');
  const originalRandomBytes = crypto.randomBytes;
  crypto.randomBytes = () => fixedTokenBuffer;

  try {
    const forgotResponse = await request(app).post('/api/auth/forgot-password').send({ email: user.email }).expect(200);

    assert.match(forgotResponse.body.message, /réinitialisation/);
  } finally {
    crypto.randomBytes = originalRandomBytes;
  }

  const userWithToken = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
  assert.ok(userWithToken.passwordResetToken);
  assert.ok(userWithToken.passwordResetExpires > new Date());
  assert.notEqual(userWithToken.passwordResetToken, fixedToken);

  await request(app).post(`/api/auth/reset-password/${fixedToken}`).send({ password: 'NewPassword123!' }).expect(200);

  await request(app).post('/api/auth/login').send({ email: user.email, password: 'OldPassword123!' }).expect(401);

  await request(app).post('/api/auth/login').send({ email: user.email, password: 'NewPassword123!' }).expect(200);

  const userAfterReset = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
  assert.equal(userAfterReset.passwordResetToken, undefined);
  assert.equal(userAfterReset.passwordResetExpires, undefined);
});

test('Auth API: rejects expired password reset tokens', async () => {
  const user = await createUser({ email: 'expired-reset@sailingloc.test' });
  const expiredToken = 'a'.repeat(64);
  user.passwordResetToken = crypto.createHash('sha256').update(expiredToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() - 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await request(app).post(`/api/auth/reset-password/${expiredToken}`).send({ password: 'NewPassword123!' }).expect(400);
});

test('Boats API: owner creates a pending boat and admin approves it for public listing', async () => {
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const tenantToken = await loginAs(tenant.email);
  const ownerToken = await loginAs(owner.email);
  const adminToken = await loginAs(admin.email);

  await request(app)
    .post('/api/boats')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      title: 'Bateau refuse',
      type: 'sailboat',
      description: 'Un locataire ne doit pas pouvoir creer cette annonce.',
      location: 'Nice',
      pricePerDay: 200,
      capacity: 4,
    })
    .expect(403);

  const createResponse = await request(app)
    .post('/api/boats')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      title: 'Dufour 390',
      type: 'sailboat',
      description: 'Voilier confortable pour une croisiere cotiere.',
      location: 'Brest',
      pricePerDay: 290,
      capacity: 6,
      images: ['https://example.com/dufour.jpg'],
    })
    .expect(201);

  assert.equal(createResponse.body.status, 'pending');

  const hiddenListing = await request(app).get('/api/boats').expect(200);
  assert.equal(hiddenListing.body.boats.length, 0);

  await request(app)
    .patch(`/api/admin/boats/${createResponse.body._id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  const publicListing = await request(app).get('/api/boats').expect(200);
  assert.equal(publicListing.body.boats.length, 1);
  assert.equal(publicListing.body.boats[0].title, 'Dufour 390');
});

test('Boats API: accepts persisted data URL images for owner uploads', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const ownerToken = await loginAs(owner.email);
  const imageDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==';

  const response = await request(app)
    .post('/api/boats')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      title: 'Photo persistante',
      type: 'sailboat',
      description: 'Annonce avec une image stockee directement dans les donnees.',
      location: 'Marseille',
      pricePerDay: 290,
      capacity: 6,
      images: [imageDataUrl],
    })
    .expect(201);

  assert.equal(response.body.images[0], imageDataUrl);
});

test('Boats API: filters out boats unavailable for selected dates', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const blockedBoat = await createApprovedBoat(owner._id, { title: 'Bateau deja demande' });
  const availableBoat = await createApprovedBoat(owner._id, { title: 'Bateau disponible' });

  await Booking.create({
    boat: blockedBoat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date(futureDate(20)),
    endDate: new Date(futureDate(23)),
    numberOfDays: 3,
    pricePerDay: blockedBoat.pricePerDay,
    serviceFee: 75,
    totalPrice: 825,
    status: 'pending',
  });

  const response = await request(app)
    .get('/api/boats')
    .query({ startDate: futureDate(21), endDate: futureDate(22) })
    .expect(200);

  const titles = response.body.boats.map((boat) => boat.title);
  assert.deepEqual(titles, [availableBoat.title]);
});

test('Bookings API: creates, accepts, pays and completes a booking while blocking overlaps', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const otherTenant = await createUser({ email: 'other@sailingloc.test', role: 'tenant' });
  const ownerToken = await loginAs(owner.email);
  const tenantToken = await loginAs(tenant.email);
  const otherTenantToken = await loginAs(otherTenant.email);
  const boat = await createApprovedBoat(owner._id);

  const bookingResponse = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(10),
      endDate: futureDate(13),
    })
    .expect(201);

  assert.equal(bookingResponse.body.status, 'pending');
  assert.equal(bookingResponse.body.totalPrice, 825);

  await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${otherTenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(11),
      endDate: futureDate(12),
    })
    .expect(409);

  const accepted = await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/accept`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  assert.equal(accepted.body.status, 'accepted');

  const paid = await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/pay`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .expect(200);

  assert.equal(paid.body.status, 'confirmed');
  assert.equal(paid.body.paymentStatus, 'paid');
  assert.ok(paid.body.payment);

  const payment = await Payment.findOne({ booking: bookingResponse.body._id });
  assert.equal(payment.status, 'succeeded');
  assert.equal(payment.amount, 825);
  assert.match(payment.invoiceNumber, /^SL-\d{4}-[A-F0-9]{8}$/);
  assert.match(payment.invoiceUrl, /^\/uploads\/invoices\/SL-\d{4}-[A-F0-9]{8}\.pdf$/);
  assert.ok(fs.existsSync(path.join(uploadRoot, payment.invoiceUrl.replace('/uploads/', ''))));

  const ownerNotifications = await Notification.find({ user: owner._id });
  assert.ok(ownerNotifications.some((notification) => notification.type === 'booking_created'));
  assert.ok(ownerNotifications.some((notification) => notification.type === 'booking_paid'));

  const completed = await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/complete`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  assert.equal(completed.body.status, 'completed');
});

test('Documents and RGPD API: owner submits a document, admin reviews it, user exports data', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const ownerToken = await loginAs(owner.email);
  const adminToken = await loginAs(admin.email);
  const boat = await createApprovedBoat(owner._id);

  const documentResponse = await request(app)
    .post('/api/documents')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      boatId: boat._id.toString(),
      type: 'insurance',
      title: 'Attestation assurance 2026',
      fileUrl: 'https://example.com/documents/assurance.pdf',
    })
    .expect(201);

  assert.equal(documentResponse.body.status, 'pending');

  const reviewed = await request(app)
    .patch(`/api/documents/${documentResponse.body._id}/review`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'approved' })
    .expect(200);

  assert.equal(reviewed.body.status, 'approved');

  const exportResponse = await request(app)
    .get('/api/auth/me/export')
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  assert.equal(exportResponse.body.user.email, owner.email);
  assert.equal(exportResponse.body.documents.length, 1);
});

test('Bookings API: rejects a booking when the owner marked a date unavailable', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const tenantToken = await loginAs(tenant.email);
  const boat = await createApprovedBoat(owner._id, {
    unavailableDates: [new Date(futureDate(15))],
  });

  await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(14),
      endDate: futureDate(16),
    })
    .expect(409);
});

test('Reviews API: tenant reviews a completed booking and admin approves the review', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const tenantToken = await loginAs(tenant.email);
  const adminToken = await loginAs(admin.email);
  const boat = await createApprovedBoat(owner._id);
  const booking = await Booking.create({
    boat: boat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date(futureDate(1)),
    endDate: new Date(futureDate(3)),
    numberOfDays: 2,
    pricePerDay: 250,
    serviceFee: 50,
    totalPrice: 550,
    status: 'completed',
    paymentStatus: 'paid',
  });

  const reviewResponse = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      bookingId: booking._id.toString(),
      rating: 5,
      comment: 'Tres bonne experience, bateau conforme et proprietaire serieux.',
    })
    .expect(201);

  assert.equal(reviewResponse.body.status, 'pending');

  const hiddenReviews = await request(app).get(`/api/boats/${boat._id}/reviews`).expect(200);
  assert.equal(hiddenReviews.body.length, 0);

  await request(app)
    .patch(`/api/admin/reviews/${reviewResponse.body._id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  const visibleReviews = await request(app).get(`/api/boats/${boat._id}/reviews`).expect(200);

  assert.equal(visibleReviews.body.length, 1);
  assert.equal(visibleReviews.body[0].rating, 5);

  const updatedBoat = await Boat.findById(boat._id);
  assert.equal(updatedBoat.averageRating, 5);
});

test('Contact API: stores message and triggers transactional email flow', async () => {
  const response = await request(app)
    .post('/api/contact')
    .send({
      name: 'Jean Dupont',
      email: 'jean.dupont@example.fr',
      subject: 'technique',
      message: 'Bonjour, je rencontre un probleme sur une reservation SailingLoc.',
    })
    .expect(201);

  assert.ok(response.body.id);
  assert.equal(response.body.emailSent, true);
  assert.equal(response.body.emailSkipped, true);

  const message = await ContactMessage.findById(response.body.id);
  assert.equal(message.email, 'jean.dupont@example.fr');
  assert.equal(message.status, 'new');
  assert.equal(message.emailNotification.sent, true);
  assert.equal(message.emailNotification.skipped, true);
});
