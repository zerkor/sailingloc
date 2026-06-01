require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sailingloc');
  console.log('MongoDB connected for seeding');
};

const boatImages = {
  sailboat: [
    'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  ],
  catamaran: [
    'https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=800',
    'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
  ],
  motorboat: [
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
    'https://images.unsplash.com/photo-1524932558893-59ebaffc7d58?w=800',
  ],
  rib: [
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800',
    'https://images.unsplash.com/photo-1541979116559-e55e0183f8a0?w=800',
  ],
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Boat.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'SailingLoc',
      email: 'admin@sailingloc.fr',
      password: 'Admin123!',
      role: 'admin',
      phone: '+33600000001',
    });

    const owner1 = await User.create({
      firstName: 'Pierre',
      lastName: 'Dupont',
      email: 'owner1@sailingloc.fr',
      password: 'Owner123!',
      role: 'owner',
      phone: '+33600000002',
    });

    const owner2 = await User.create({
      firstName: 'Marie',
      lastName: 'Laurent',
      email: 'owner2@sailingloc.fr',
      password: 'Owner123!',
      role: 'owner',
      phone: '+33600000003',
    });

    const tenant1 = await User.create({
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'tenant1@sailingloc.fr',
      password: 'Tenant123!',
      role: 'tenant',
      phone: '+33600000004',
    });

    const tenant2 = await User.create({
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'tenant2@sailingloc.fr',
      password: 'Tenant123!',
      role: 'tenant',
      phone: '+33600000005',
    });

    const tenant3 = await User.create({
      firstName: 'Lucas',
      lastName: 'Petit',
      email: 'tenant3@sailingloc.fr',
      password: 'Tenant123!',
      role: 'tenant',
      phone: '+33600000006',
    });

    console.log('Users created');

    // Create boats
    const boat1 = await Boat.create({
      owner: owner1._id,
      title: 'Sun Odyssey 349',
      type: 'sailboat',
      description: 'Beautiful 34-foot sailboat perfect for coastal cruising in the Mediterranean. Fully equipped with modern navigation instruments, comfortable cabin for up to 6 people, and all safety equipment. Ideal for families or groups looking for an authentic sailing experience in the stunning waters around Marseille.',
      location: 'Marseille',
      port: 'Vieux-Port de Marseille',
      pricePerDay: 250,
      capacity: 6,
      length: 10.3,
      engine: 'Yanmar 21cv',
      skipperAvailable: true,
      equipments: ['GPS', 'VHF Radio', 'Life jackets', 'Anchor', 'Autopilot', 'Snorkeling equipment', 'Kitchenette', 'Hot water'],
      images: boatImages.sailboat,
      status: 'approved',
      averageRating: 4.8,
    });

    const boat2 = await Boat.create({
      owner: owner1._id,
      title: 'Lagoon 42',
      type: 'catamaran',
      description: 'Spacious Lagoon 42 catamaran offering exceptional comfort and stability. With 4 double cabins and 2 bathrooms, this yacht is perfect for longer voyages along the French Riviera. The large flybridge offers panoramic views while the cockpit is ideal for al fresco dining.',
      location: 'Nice',
      port: 'Port de Nice',
      pricePerDay: 650,
      capacity: 8,
      length: 12.8,
      engine: '2x Yanmar 45cv',
      skipperAvailable: true,
      equipments: ['GPS chartplotter', 'AIS', 'Watermaker', 'Generator', 'Air conditioning', 'Kayaks', 'SUP boards', 'Full kitchen', 'BBQ'],
      images: boatImages.catamaran,
      status: 'approved',
      averageRating: 4.9,
    });

    const boat3 = await Boat.create({
      owner: owner2._id,
      title: 'Cap Camarat 7.5',
      type: 'motorboat',
      description: 'Fast and elegant motorboat perfect for day trips along the Cannes coastline. Discover the Lérins Islands and secluded coves at speed. The open deck is perfect for sunbathing and the powerful engine ensures quick transfers between beautiful spots.',
      location: 'Cannes',
      port: 'Port du Mouré-Rouge',
      pricePerDay: 350,
      capacity: 7,
      length: 7.5,
      engine: 'Mercury 200cv',
      skipperAvailable: false,
      equipments: ['VHF Radio', 'GPS', 'Life jackets', 'Swim ladder', 'Bimini top', 'Cooler', 'Anchor'],
      images: boatImages.motorboat,
      status: 'approved',
      averageRating: 4.5,
    });

    const boat4 = await Boat.create({
      owner: owner2._id,
      title: 'Zodiac Medline 7',
      type: 'rib',
      description: 'High-performance RIB ideal for exploring the Atlantic coast near La Rochelle. Perfect for fishing, watersports, or simply zipping around the beautiful Île de Ré. Compact yet capable, this inflatable boat handles any conditions.',
      location: 'La Rochelle',
      port: 'Port des Minimes',
      pricePerDay: 120,
      capacity: 8,
      length: 6.5,
      engine: 'Suzuki 115cv',
      skipperAvailable: false,
      equipments: ['GPS', 'VHF Radio', 'Life jackets', 'Anchor', 'First aid kit', 'Paddle'],
      images: boatImages.rib,
      status: 'approved',
      averageRating: 4.3,
    });

    const boat5 = await Boat.create({
      owner: owner1._id,
      title: 'Dufour 390',
      type: 'sailboat',
      description: 'Modern performance cruiser available in the magnificent waters of Brittany. The Dufour 390 combines elegance with seaworthiness, offering a thrilling sailing experience in the Atlantic. With 3 cabins and a bright saloon, it\'s perfect for extended coastal cruising.',
      location: 'Brest',
      port: 'Port de Commerce de Brest',
      pricePerDay: 290,
      capacity: 6,
      length: 11.9,
      engine: 'Volvo Penta 21cv',
      skipperAvailable: true,
      equipments: ['Autopilot', 'GPS chartplotter', 'VHF', 'Life jackets', 'Liferaft', 'EPIRB', 'Full galley', 'Shower'],
      images: boatImages.sailboat,
      status: 'approved',
      averageRating: 4.7,
    });

    const boat6 = await Boat.create({
      owner: owner2._id,
      title: 'Merry Fisher 895',
      type: 'motorboat',
      description: 'Versatile offshore cruiser perfect for discovering the hidden coves of the French Riviera. The Merry Fisher 895 offers exceptional seakeeping and a comfortable cabin for overnight stays. Ideal for fishing enthusiasts or families wanting to explore beyond the coastline.',
      location: 'Antibes',
      port: 'Port Vauban d\'Antibes',
      pricePerDay: 420,
      capacity: 6,
      length: 8.9,
      engine: 'Yamaha 2x150cv',
      skipperAvailable: false,
      equipments: ['GPS chartplotter', 'Autopilot', 'VHF', 'Radar', 'Fishing equipment', 'Cabin with berths', 'Kitchenette', 'Shower'],
      images: boatImages.motorboat,
      status: 'approved',
      averageRating: 4.6,
    });

    const boat7 = await Boat.create({
      owner: owner1._id,
      title: 'Bali Catspace',
      type: 'catamaran',
      description: 'Innovative and trendy catamaran moored in the stunning Corsican capital. The Bali Catspace revolutionizes catamaran design with its forward cockpit offering unobstructed sea views. Perfect for exploring the turquoise waters and hidden beaches around Ajaccio.',
      location: 'Ajaccio',
      port: 'Port Charles-Ornano',
      pricePerDay: 580,
      capacity: 6,
      length: 11.0,
      engine: '2x Volvo 40cv',
      skipperAvailable: true,
      equipments: ['Forward cockpit', 'GPS', 'AIS', 'Watermaker', 'Solar panels', 'Snorkeling gear', 'Full kitchen', 'Air conditioning'],
      images: boatImages.catamaran,
      status: 'approved',
      averageRating: 4.9,
    });

    const boat8 = await Boat.create({
      owner: owner2._id,
      title: 'Bombard Explorer 650',
      type: 'rib',
      description: 'Powerful RIB designed for adventure along the wild Emerald Coast near Saint-Malo. Explore the Mont-Saint-Michel bay, discover hidden beaches accessible only by sea, and experience the powerful Atlantic tides from a safe and exhilarating vessel.',
      location: 'Saint-Malo',
      port: 'Port de Plaisance du Bas-Sablons',
      pricePerDay: 150,
      capacity: 8,
      length: 6.5,
      engine: 'Honda 130cv',
      skipperAvailable: false,
      equipments: ['GPS', 'VHF', 'Life jackets', 'Anchor', 'Waterproof bags', 'First aid kit'],
      images: boatImages.rib,
      status: 'approved',
      averageRating: 4.2,
    });

    // Pending boat
    const boat9 = await Boat.create({
      owner: owner2._id,
      title: 'Bavaria Cruiser 46',
      type: 'sailboat',
      description: 'Spacious cruiser awaiting approval. Large interior with 4 cabins perfect for extended voyages.',
      location: 'Toulon',
      port: 'Port de Toulon',
      pricePerDay: 380,
      capacity: 8,
      length: 14.0,
      engine: 'Volvo 50cv',
      skipperAvailable: false,
      equipments: ['Full navigation instruments', 'Life jackets', 'Liferaft'],
      images: boatImages.sailboat,
      status: 'pending',
      averageRating: 0,
    });

    console.log('Boats created');

    // Create bookings
    const now = new Date();
    const pastDate = (daysAgo) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const futureDate = (daysFromNow) => new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    // Completed booking - tenant1, boat1
    const booking1 = await Booking.create({
      boat: boat1._id,
      tenant: tenant1._id,
      owner: owner1._id,
      startDate: pastDate(20),
      endDate: pastDate(17),
      numberOfDays: 3,
      pricePerDay: 250,
      serviceFee: 75,
      totalPrice: 825,
      status: 'completed',
      paymentStatus: 'paid',
    });

    // Completed booking - tenant2, boat3
    const booking2 = await Booking.create({
      boat: boat3._id,
      tenant: tenant2._id,
      owner: owner2._id,
      startDate: pastDate(15),
      endDate: pastDate(12),
      numberOfDays: 3,
      pricePerDay: 350,
      serviceFee: 105,
      totalPrice: 1155,
      status: 'completed',
      paymentStatus: 'paid',
    });

    // Confirmed booking - tenant1, boat2
    const booking3 = await Booking.create({
      boat: boat2._id,
      tenant: tenant1._id,
      owner: owner1._id,
      startDate: futureDate(5),
      endDate: futureDate(10),
      numberOfDays: 5,
      pricePerDay: 650,
      serviceFee: 325,
      totalPrice: 3575,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    // Accepted booking - tenant2, boat5
    const booking4 = await Booking.create({
      boat: boat5._id,
      tenant: tenant2._id,
      owner: owner1._id,
      startDate: futureDate(15),
      endDate: futureDate(18),
      numberOfDays: 3,
      pricePerDay: 290,
      serviceFee: 87,
      totalPrice: 957,
      status: 'accepted',
      paymentStatus: 'unpaid',
    });

    // Pending booking - tenant3, boat7
    const booking5 = await Booking.create({
      boat: boat7._id,
      tenant: tenant3._id,
      owner: owner1._id,
      startDate: futureDate(20),
      endDate: futureDate(25),
      numberOfDays: 5,
      pricePerDay: 580,
      serviceFee: 290,
      totalPrice: 3190,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    // Cancelled booking - tenant3, boat4
    const booking6 = await Booking.create({
      boat: boat4._id,
      tenant: tenant3._id,
      owner: owner2._id,
      startDate: pastDate(10),
      endDate: pastDate(8),
      numberOfDays: 2,
      pricePerDay: 120,
      serviceFee: 24,
      totalPrice: 264,
      status: 'cancelled',
      paymentStatus: 'refunded',
    });

    // Completed booking - tenant3, boat6
    const booking7 = await Booking.create({
      boat: boat6._id,
      tenant: tenant3._id,
      owner: owner2._id,
      startDate: pastDate(30),
      endDate: pastDate(27),
      numberOfDays: 3,
      pricePerDay: 420,
      serviceFee: 126,
      totalPrice: 1386,
      status: 'completed',
      paymentStatus: 'paid',
    });

    console.log('Bookings created');

    // Create reviews
    await Review.create({
      boat: boat1._id,
      booking: booking1._id,
      author: tenant1._id,
      rating: 5,
      comment: 'Absolutely stunning sailboat! Pierre was incredibly helpful and the Sun Odyssey is in perfect condition. The Marseille coastline is magical from the water. Cannot wait to come back!',
      status: 'approved',
    });

    await Review.create({
      boat: boat3._id,
      booking: booking2._id,
      author: tenant2._id,
      rating: 4,
      comment: 'Great motorboat for exploring the Cannes islands. Fast and very well maintained. Only minor issue was that the GPS was a bit outdated but overall excellent experience.',
      status: 'approved',
    });

    await Review.create({
      boat: boat6._id,
      booking: booking7._id,
      author: tenant3._id,
      rating: 5,
      comment: 'The Merry Fisher is a fantastic boat for coastal cruising around Antibes. Very powerful and comfortable for a day at sea. Found some hidden beaches that are only accessible by boat. Highly recommend!',
      status: 'approved',
    });

    // Pending review
    await Review.create({
      boat: boat1._id,
      booking: booking1._id,
      author: tenant2._id,
      rating: 4,
      comment: 'Nice boat, had a wonderful time. Would recommend.',
      status: 'pending',
    });

    console.log('Reviews created');

    // Update average ratings
    await Boat.findByIdAndUpdate(boat1._id, { averageRating: 4.8 });
    await Boat.findByIdAndUpdate(boat3._id, { averageRating: 4.5 });
    await Boat.findByIdAndUpdate(boat6._id, { averageRating: 4.6 });

    console.log('\n=== SEED COMPLETE ===');
    console.log('\nDemo accounts:');
    console.log('Admin:   admin@sailingloc.fr  / Admin123!');
    console.log('Owner 1: owner1@sailingloc.fr / Owner123!');
    console.log('Owner 2: owner2@sailingloc.fr / Owner123!');
    console.log('Tenant 1: tenant1@sailingloc.fr / Tenant123!');
    console.log('Tenant 2: tenant2@sailingloc.fr / Tenant123!');
    console.log('Tenant 3: tenant3@sailingloc.fr / Tenant123!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
