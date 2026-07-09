const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'admin_test_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Boat = require('../src/models/Boat');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const Payment = require('../src/models/Payment');
const OwnerDocument = require('../src/models/OwnerDocument');
const Notification = require('../src/models/Notification');
const Report = require('../src/models/Report');
const AdminActionLog = require('../src/models/AdminActionLog');

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
    OwnerDocument.deleteMany({}),
    Notification.deleteMany({}),
    Report.deleteMany({}),
    AdminActionLog.deleteMany({}),
  ]);
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const createUser = (overrides = {}) =>
  User.create({
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    email: overrides.email || `user-${Date.now()}-${Math.random()}@sailingloc.test`,
    password: overrides.password || 'Password123!',
    role: overrides.role || 'tenant',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    privacyConsent: true,
  });

const loginAs = async (email, password = 'Password123!') => {
  const response = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
  return response.body.token;
};

const createBoat = (owner, overrides = {}) =>
  Boat.create({
    owner: owner._id,
    title: overrides.title || 'Bateau admin test',
    type: 'sailboat',
    description: 'Bateau complet pour test admin.',
    location: 'Marseille',
    pricePerDay: 250,
    capacity: 6,
    images: ['https://example.com/boat.jpg'],
    status: overrides.status || 'pending',
  });

test('Admin security: non-admin cannot access admin routes', async () => {
  const tenant = await createUser({ role: 'tenant', email: 'tenant-admin@sailingloc.test' });
  const token = await loginAs(tenant.email);

  await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`).expect(403);
});

test('Admin security: admin cannot deactivate or downgrade themselves', async () => {
  const admin = await createUser({ role: 'admin', email: 'self-admin@sailingloc.test' });
  const token = await loginAs(admin.email);

  await request(app)
    .put(`/api/admin/users/${admin._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ isActive: false })
    .expect(403);

  await request(app)
    .put(`/api/admin/users/${admin._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ role: 'tenant' })
    .expect(403);
});

test('Admin security: last active admin cannot be deactivated or downgraded', async () => {
  const lastAdmin = await createUser({ role: 'admin', email: 'last-admin@sailingloc.test' });
  const token = await loginAs(lastAdmin.email);

  await request(app)
    .patch(`/api/admin/users/${lastAdmin._id}/disable`)
    .set('Authorization', `Bearer ${token}`)
    .expect(403);

  await request(app)
    .put(`/api/admin/users/${lastAdmin._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ role: 'owner' })
    .expect(403);
});

test('Admin moderation: approve and reject boats', async () => {
  const owner = await createUser({ role: 'owner', email: 'owner-boats@sailingloc.test' });
  const admin = await createUser({ role: 'admin', email: 'admin-boats@sailingloc.test' });
  const token = await loginAs(admin.email);
  const boat = await createBoat(owner);

  const approved = await request(app)
    .patch(`/api/admin/boats/${boat._id}/approve`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  assert.equal(approved.body.status, 'approved');

  const rejected = await request(app)
    .patch(`/api/admin/boats/${boat._id}/reject`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  assert.equal(rejected.body.status, 'rejected');
});

test('Admin moderation: approve review and expose dashboard stats', async () => {
  const owner = await createUser({ role: 'owner', email: 'owner-review@sailingloc.test' });
  const tenant = await createUser({ role: 'tenant', email: 'tenant-review@sailingloc.test' });
  const admin = await createUser({ role: 'admin', email: 'admin-review@sailingloc.test' });
  const token = await loginAs(admin.email);
  const boat = await createBoat(owner, { status: 'approved' });
  const booking = await Booking.create({
    boat: boat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-03'),
    numberOfDays: 2,
    pricePerDay: 250,
    serviceFee: 50,
    totalPrice: 550,
    status: 'completed',
    paymentStatus: 'paid',
  });
  const review = await Review.create({
    boat: boat._id,
    booking: booking._id,
    author: tenant._id,
    rating: 5,
    comment: 'Très bonne expérience.',
    status: 'pending',
  });

  const approved = await request(app)
    .patch(`/api/admin/reviews/${review._id}/approve`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  assert.equal(approved.body.status, 'approved');

  const stats = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(typeof stats.body.totalUsers, 'number');
  assert.equal(typeof stats.body.totalBookings, 'number');
  assert.equal(typeof stats.body.totalRevenue, 'number');
});

test('Admin payments: refund updates payment and booking consistently', async () => {
  const owner = await createUser({ role: 'owner', email: 'owner-pay@sailingloc.test' });
  const tenant = await createUser({ role: 'tenant', email: 'tenant-pay@sailingloc.test' });
  const admin = await createUser({ role: 'admin', email: 'admin-pay@sailingloc.test' });
  const token = await loginAs(admin.email);
  const boat = await createBoat(owner, { status: 'approved' });
  const booking = await Booking.create({
    boat: boat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-04'),
    numberOfDays: 3,
    pricePerDay: 300,
    serviceFee: 90,
    totalPrice: 990,
    status: 'confirmed',
    paymentStatus: 'paid',
  });
  const payment = await Payment.create({
    booking: booking._id,
    tenant: tenant._id,
    owner: owner._id,
    amount: 990,
    serviceFee: 90,
    providerReference: 'sim_test_refund',
    status: 'succeeded',
    paidAt: new Date(),
  });
  booking.payment = payment._id;
  await booking.save();

  await request(app)
    .patch(`/api/admin/payments/${payment._id}/refund`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const updatedBooking = await Booking.findById(booking._id);
  const updatedPayment = await Payment.findById(payment._id);
  assert.equal(updatedBooking.status, 'cancelled');
  assert.equal(updatedBooking.paymentStatus, 'refunded');
  assert.equal(updatedPayment.status, 'refunded');
});

test('Admin users endpoint supports pagination', async () => {
  const admin = await createUser({ role: 'admin', email: 'admin-pagination@sailingloc.test' });
  await Promise.all(Array.from({ length: 12 }, (_, index) => createUser({ email: `tenant-${index}@sailingloc.test` })));
  const token = await loginAs(admin.email);

  const response = await request(app)
    .get('/api/admin/users?page=2&limit=5')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.page, 2);
  assert.equal(response.body.limit, 5);
  assert.equal(response.body.items.length, 5);
  assert.equal(response.body.total >= 13, true);
});
