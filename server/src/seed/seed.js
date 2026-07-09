require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const OwnerDocument = require('../models/OwnerDocument');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const AdminActionLog = require('../models/AdminActionLog');

const DAY = 24 * 60 * 60 * 1000;

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sailingloc');
  console.log('MongoDB connected for seeding');
};

const addDays = (days) => {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const differenceInDays = (startDate, endDate) => Math.max(Math.ceil((endDate - startDate) / DAY), 1);

const calculatePrice = (boat, startDate, endDate) => {
  const numberOfDays = differenceInDays(startDate, endDate);
  const subtotal = numberOfDays * boat.pricePerDay;
  const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
  const totalPrice = Math.round((subtotal + serviceFee) * 100) / 100;
  return { numberOfDays, serviceFee, totalPrice };
};

const imageByType = {
  sailboat: ['/images/hero-boat.jpeg'],
  motorboat: ['/images/hero-boat.jpeg'],
  catamaran: ['/images/hero-boat.jpeg'],
  rib: ['/images/hero-boat.jpeg'],
};

const ownerNames = [
  ['Pierre', 'Dupont'],
  ['Marie', 'Laurent'],
  ['Nicolas', 'Moreau'],
  ['Camille', 'Roux'],
  ['Antoine', 'Fournier'],
  ['Claire', 'Girard'],
  ['Julien', 'Mercier'],
  ['Élodie', 'Faure'],
  ['Mathieu', 'Lefèvre'],
  ['Amandine', 'Blanc'],
  ['Thomas', 'Garnier'],
  ['Lucie', 'Chevalier'],
  ['Romain', 'Perrin'],
  ['Manon', 'Robin'],
];

const tenantNames = [
  ['Jean', 'Martin'],
  ['Sophie', 'Bernard'],
  ['Lucas', 'Petit'],
  ['Chloé', 'Robert'],
  ['Hugo', 'Richard'],
  ['Emma', 'Durand'],
  ['Louis', 'Dubois'],
  ['Léa', 'Morel'],
  ['Nathan', 'Simon'],
  ['Inès', 'Michel'],
  ['Arthur', 'Leroy'],
  ['Zoé', 'Renaud'],
  ['Gabriel', 'David'],
  ['Sarah', 'Bertrand'],
  ['Adam', 'Fontaine'],
  ['Jade', 'Lemoine'],
  ['Noah', 'Marchand'],
  ['Louise', 'Gauthier'],
  ['Raphaël', 'Moulin'],
  ['Alice', 'Renard'],
];

const boatBlueprints = [
  [
    'Sun Odyssey 349',
    'sailboat',
    'Marseille',
    'Vieux-Port de Marseille',
    250,
    6,
    10.3,
    'Yanmar 21cv',
    true,
    'Voilier équilibré pour une croisière côtière en Méditerranée.',
  ],
  [
    'Lagoon 42',
    'catamaran',
    'Nice',
    'Port de Nice',
    650,
    8,
    12.8,
    '2x Yanmar 45cv',
    true,
    'Catamaran spacieux avec grand cockpit et cabines confortables.',
  ],
  [
    'Cap Camarat 7.5',
    'motorboat',
    'Cannes',
    'Port du Mouré-Rouge',
    350,
    7,
    7.5,
    'Mercury 200cv',
    false,
    'Open rapide pour rejoindre les îles de Lérins et les criques voisines.',
  ],
  [
    'Zodiac Medline 7',
    'rib',
    'La Rochelle',
    'Port des Minimes',
    150,
    8,
    6.7,
    'Suzuki 150cv',
    false,
    'Semi-rigide maniable pour sorties sportives et pêche côtière.',
  ],
  [
    'Dufour 390',
    'sailboat',
    'Brest',
    'Port du Château',
    290,
    6,
    11.9,
    'Volvo Penta 30cv',
    true,
    'Croiseur moderne adapté aux navigations bretonnes.',
  ],
  [
    'Merry Fisher 895',
    'motorboat',
    'Antibes',
    'Port Vauban',
    420,
    6,
    8.9,
    '2x Yamaha 150cv',
    false,
    'Cabin cruiser confortable pour une journée ou un week-end.',
  ],
  [
    'Bali Catspace',
    'catamaran',
    'Ajaccio',
    'Port Charles-Ornano',
    580,
    8,
    12.3,
    '2x Volvo 40cv',
    true,
    'Catamaran lumineux pour découvrir les plages corses.',
  ],
  [
    'Bombard Explorer 650',
    'rib',
    'Saint-Malo',
    'Port des Bas-Sablons',
    140,
    7,
    6.5,
    'Honda 130cv',
    false,
    'Semi-rigide robuste pour la côte d’Émeraude.',
  ],
  [
    'Bavaria Cruiser 46',
    'sailboat',
    'Toulon',
    'Port de Toulon',
    380,
    8,
    14.0,
    'Volvo 55cv',
    false,
    'Grand voilier familial avec quatre cabines.',
  ],
  [
    'Prestige 420',
    'motorboat',
    'Lorient',
    'Port de Kernevel',
    720,
    8,
    13.1,
    '2x Cummins 380cv',
    true,
    'Vedette premium pour croisière confortable en Atlantique.',
  ],
  [
    'Fountaine Pajot Isla 40',
    'catamaran',
    'Arcachon',
    'Port d’Arcachon',
    610,
    8,
    11.9,
    '2x Volvo 30cv',
    true,
    'Catamaran stable pour explorer le bassin.',
  ],
  [
    'Highfield Sport 760',
    'rib',
    'Sète',
    'Port de Sète',
    210,
    10,
    7.6,
    'Yamaha 250cv',
    false,
    'Semi-rigide puissant pour sorties rapides en Méditerranée.',
  ],
  [
    'Oceanis 38.1',
    'sailboat',
    'Marseille',
    'Port de la Pointe Rouge',
    310,
    6,
    11.5,
    'Yanmar 29cv',
    true,
    'Voilier agréable avec carré lumineux et pont dégagé.',
  ],
  [
    'Jeanneau Leader 30',
    'motorboat',
    'Nice',
    'Port Lympia',
    460,
    6,
    9.2,
    'Volvo 300cv',
    false,
    'Bateau moteur élégant avec bain de soleil avant.',
  ],
  [
    'Nautitech 46 Open',
    'catamaran',
    'Cannes',
    'Vieux-Port de Cannes',
    790,
    10,
    13.8,
    '2x Volvo 50cv',
    true,
    'Catamaran haut de gamme pour groupe ou famille nombreuse.',
  ],
  [
    'Capelli Tempest 700',
    'rib',
    'La Rochelle',
    'Port des Minimes',
    180,
    8,
    7.0,
    'Yamaha 200cv',
    false,
    'Semi-rigide polyvalent pour balade et sports nautiques.',
  ],
  [
    'First 36',
    'sailboat',
    'Brest',
    'Port du Moulin Blanc',
    340,
    6,
    11.0,
    'Yanmar 30cv',
    true,
    'Voilier performant pour équipages aimant la voile active.',
  ],
  [
    'Beneteau Antares 9',
    'motorboat',
    'Saint-Malo',
    'Port Vauban Saint-Malo',
    390,
    6,
    9.0,
    '2x Suzuki 200cv',
    false,
    'Timonière moderne sécurisante pour la Manche.',
  ],
  [
    'Lagoon 380',
    'catamaran',
    'Ajaccio',
    'Port Tino Rossi',
    520,
    8,
    11.5,
    '2x Yanmar 29cv',
    true,
    'Catamaran fiable avec grands trampolines avant.',
  ],
  [
    'Zar 65 Suite',
    'rib',
    'Antibes',
    'Port Gallice',
    190,
    9,
    6.5,
    'Mercury 175cv',
    false,
    'Semi-rigide compact et confortable pour cabotage.',
  ],
  [
    'RM 1180',
    'sailboat',
    'Lorient',
    'Port de Lorient La Base',
    360,
    8,
    11.8,
    'Volvo 40cv',
    true,
    'Voilier rapide et marin pour navigation hauturière.',
  ],
  [
    'Quicksilver Activ 875',
    'motorboat',
    'Arcachon',
    'Port d’Arcachon',
    430,
    8,
    8.8,
    'Mercury 300cv',
    false,
    'Day cruiser pratique pour le bassin et l’océan.',
  ],
  [
    'Excess 11',
    'catamaran',
    'Sète',
    'Port de Sète',
    560,
    8,
    11.3,
    '2x Yanmar 29cv',
    true,
    'Catamaran vif avec ambiance moderne.',
  ],
  [
    'Dufour 470',
    'sailboat',
    'Toulon',
    'Port Saint-Louis du Mourillon',
    450,
    10,
    14.9,
    'Volvo 60cv',
    true,
    'Grand voilier de croisière pour navigation méditerranéenne.',
  ],
  [
    'Zodiac Pro 6.5',
    'rib',
    'Cannes',
    'Port Pierre Canto',
    160,
    7,
    6.5,
    'Suzuki 140cv',
    false,
    'Semi-rigide simple et efficace pour sorties à la journée.',
  ],
];

const baseEquipments = {
  sailboat: ['GPS', 'VHF', 'Pilote automatique', 'Gilets de sauvetage', 'Annexe', 'Cuisine équipée', 'Douchette'],
  motorboat: ['GPS', 'VHF', 'Sondeur', 'Bain de soleil', 'Taud de soleil', 'Échelle de bain', 'Glacière'],
  catamaran: ['GPS', 'AIS', 'Panneaux solaires', 'Cuisine équipée', 'Stand-up paddle', 'Annexe', 'Douche de pont'],
  rib: ['GPS', 'VHF', 'Gilets de sauvetage', 'Mouillage', 'Échelle de bain', 'Sac étanche', 'Kit premier secours'],
};

const bookingStatuses = [
  ...Array(8).fill('pending'),
  ...Array(8).fill('accepted'),
  ...Array(12).fill('confirmed'),
  ...Array(26).fill('completed'),
  ...Array(4).fill('cancelled'),
  ...Array(2).fill('rejected'),
];

const reviewComments = [
  'Très belle sortie, bateau propre et propriétaire disponible.',
  'Excellente expérience, prise en main simple et navigation agréable.',
  'Bateau conforme à l’annonce, idéal pour une journée en famille.',
  'Accueil sérieux, matériel de sécurité complet et bon état général.',
  'Super moment sur l’eau, je recommande cette annonce.',
  'Très bon rapport qualité-prix et port facile d’accès.',
];

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      AdminActionLog.deleteMany({}),
      Report.deleteMany({}),
      Notification.deleteMany({}),
      OwnerDocument.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Booking.deleteMany({}),
      Boat.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('Cleared existing demo data');

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'SailingLoc',
      email: 'admin@sailingloc.fr',
      password: 'Admin123!',
      role: 'admin',
      phone: '+33600000001',
      privacyConsent: true,
      privacyConsentAt: new Date(),
    });

    const owners = await Promise.all(
      ownerNames.map(([firstName, lastName], index) =>
        User.create({
          firstName,
          lastName,
          email: `owner${index + 1}@sailingloc.fr`,
          password: 'Owner123!',
          role: 'owner',
          phone: `+33610${String(index + 1).padStart(6, '0')}`,
          privacyConsent: true,
          privacyConsentAt: new Date(),
        })
      )
    );

    const tenants = await Promise.all(
      tenantNames.map(([firstName, lastName], index) =>
        User.create({
          firstName,
          lastName,
          email: `tenant${index + 1}@sailingloc.fr`,
          password: 'Tenant123!',
          role: 'tenant',
          phone: `+33620${String(index + 1).padStart(6, '0')}`,
          privacyConsent: true,
          privacyConsentAt: new Date(),
        })
      )
    );

    const boats = await Boat.insertMany(
      boatBlueprints.map((boat, index) => {
        const [title, type, location, port, pricePerDay, capacity, length, engine, skipperAvailable, intro] = boat;
        const status = index < 20 ? 'approved' : index < 23 ? 'pending' : 'rejected';
        return {
          owner: owners[index % owners.length]._id,
          title,
          type,
          description: `${intro} Entretien suivi, inventaire vérifié et équipement adapté à la zone de navigation de ${location}.`,
          location,
          port,
          pricePerDay,
          capacity,
          length,
          engine,
          skipperAvailable,
          equipments: baseEquipments[type],
          images: imageByType[type],
          status,
          averageRating: 0,
        };
      })
    );

    const bookings = [];
    const payments = [];
    const boatSlot = new Map();

    for (let index = 0; index < 60; index += 1) {
      const status = bookingStatuses[index];
      const boat = boats[index % boats.length];
      const tenant = tenants[(index * 3) % tenants.length];
      const slot = boatSlot.get(String(boat._id)) || 0;
      boatSlot.set(String(boat._id), slot + 1);

      const duration = 1 + (index % 5);
      const startOffset = ['completed', 'cancelled', 'rejected'].includes(status) ? -180 + slot * 8 : 7 + slot * 9;
      const startDate = addDays(startOffset);
      const endDate = addDays(startOffset + duration);
      const price = calculatePrice(boat, startDate, endDate);
      const paymentStatus =
        status === 'confirmed' || status === 'completed'
          ? 'paid'
          : status === 'cancelled' && index % 2 === 0
            ? 'refunded'
            : 'unpaid';

      const booking = await Booking.create({
        boat: boat._id,
        tenant: tenant._id,
        owner: boat.owner,
        startDate,
        endDate,
        numberOfDays: price.numberOfDays,
        pricePerDay: boat.pricePerDay,
        serviceFee: price.serviceFee,
        totalPrice: price.totalPrice,
        status,
        paymentStatus,
      });

      bookings.push(booking);

      if (status !== 'rejected') {
        const payment = await Payment.create({
          booking: booking._id,
          tenant: tenant._id,
          owner: boat.owner,
          amount: price.totalPrice,
          serviceFee: price.serviceFee,
          providerReference: `demo_pay_${String(index + 1).padStart(4, '0')}`,
          status:
            paymentStatus === 'paid' ? 'succeeded' : paymentStatus === 'refunded' ? 'refunded' : 'requires_capture',
          paidAt: paymentStatus === 'paid' || paymentStatus === 'refunded' ? addDays(startOffset - 3) : undefined,
          refundedAt: paymentStatus === 'refunded' ? addDays(startOffset + duration + 1) : undefined,
          refundedBy: paymentStatus === 'refunded' ? admin._id : undefined,
        });
        booking.payment = payment._id;
        await booking.save();
        payments.push(payment);
      }
    }

    const completedBookings = bookings.filter((booking) => booking.status === 'completed');
    const reviews = [];
    for (let index = 0; index < 25; index += 1) {
      const booking = completedBookings[index];
      const rating = 3 + (index % 3);
      reviews.push(
        await Review.create({
          boat: booking.boat,
          booking: booking._id,
          author: booking.tenant,
          rating,
          comment: reviewComments[index % reviewComments.length],
          status: index < 19 ? 'approved' : 'pending',
        })
      );
    }

    const approvedReviews = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$boat', averageRating: { $avg: '$rating' } } },
    ]);
    await Promise.all(
      approvedReviews.map((item) =>
        Boat.findByIdAndUpdate(item._id, {
          averageRating: Math.round(item.averageRating * 10) / 10,
        })
      )
    );

    const documentTypes = ['identity', 'registration', 'insurance', 'contract'];
    const documents = [];
    for (let index = 0; index < 18; index += 1) {
      const owner = owners[index % owners.length];
      const boat = boats.find((item) => item.owner.toString() === owner._id.toString()) || boats[index % boats.length];
      const status = index < 10 ? 'approved' : index < 15 ? 'pending' : 'rejected';
      documents.push(
        await OwnerDocument.create({
          owner: owner._id,
          boat: boat._id,
          type: documentTypes[index % documentTypes.length],
          title: `${documentTypes[index % documentTypes.length]} - ${boat.title}`,
          fileUrl: `https://example.com/demo-documents/document-${index + 1}.pdf`,
          status,
          rejectionReason: status === 'rejected' ? 'Document illisible ou incomplet' : undefined,
          reviewedBy: status !== 'pending' ? admin._id : undefined,
          reviewedAt: status !== 'pending' ? new Date() : undefined,
        })
      );
    }

    const reports = await Report.insertMany([
      {
        reporter: tenants[0]._id,
        targetType: 'boat',
        targetId: boats[0]._id,
        reason: 'Annonce à vérifier',
        description: 'Une information sur le port semble incorrecte.',
        status: 'open',
      },
      {
        reporter: tenants[4]._id,
        targetType: 'review',
        targetId: reviews[0]._id,
        reason: 'Avis contesté',
        description: 'Le commentaire ne correspond pas à mon expérience.',
        status: 'in_review',
        adminNote: 'À comparer avec la réservation.',
      },
      {
        reporter: owners[2]._id,
        targetType: 'booking',
        targetId: bookings[10]._id,
        reason: 'No-show locataire',
        description: 'Le locataire ne s’est pas présenté au port.',
        status: 'resolved',
        adminNote: 'Résolu après contact téléphonique.',
      },
    ]);

    await AdminActionLog.insertMany([
      {
        admin: admin._id,
        action: 'seed_demo_data',
        entityType: 'database',
        entityId: 'demo-seed',
        description: 'Création du jeu de données de démonstration',
        metadata: { users: 35, boats: boats.length, bookings: bookings.length },
      },
      {
        admin: admin._id,
        action: 'approve_document',
        entityType: 'document',
        entityId: documents[0]._id.toString(),
        description: 'Validation initiale de documents propriétaires',
        metadata: {},
      },
      {
        admin: admin._id,
        action: 'update_report_status',
        entityType: 'report',
        entityId: reports[1]._id.toString(),
        description: 'Signalement placé en analyse',
        metadata: { status: 'in_review' },
      },
      {
        admin: admin._id,
        action: 'refund_payment',
        entityType: 'booking',
        entityId: bookings.find((item) => item.paymentStatus === 'refunded')._id.toString(),
        description: 'Remboursement de démonstration',
        metadata: {},
      },
    ]);

    const totalUsers = 1 + owners.length + tenants.length;
    console.log('\nSeed completed successfully:');
    console.log(`- ${totalUsers} users created`);
    console.log(`- ${boats.length} boats created`);
    console.log(`- ${bookings.length} bookings created`);
    console.log(`- ${reviews.length} reviews created`);
    console.log(`- ${payments.length} payments created`);
    console.log(`- ${documents.length} owner documents created`);
    console.log(`- ${reports.length} reports created`);
    console.log('\nDemo accounts:');
    console.log('Admin:    admin@sailingloc.fr    / Admin123!');
    console.log('Owners:   owner1@sailingloc.fr   / Owner123!  ... owner14@sailingloc.fr');
    console.log('Tenants:  tenant1@sailingloc.fr  / Tenant123! ... tenant20@sailingloc.fr');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
