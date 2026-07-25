const Boat = require('../models/Boat');
const User = require('../models/User');

const catalog = [
  ['Sun Odyssey 349', 'sailboat', 'Marseille', 'Vieux-Port de Marseille', 250, 6, 10.3, 'Yanmar 21cv', true, '/images/boats/sailboat/sun-odyssey-349.jpg'],
  ['First 36', 'sailboat', 'La Rochelle', 'Port des Minimes', 340, 6, 11, 'Volvo Penta 29cv', true, '/images/boats/sailboat/first-36.jpg'],
  ['Oceanis 38.1', 'sailboat', 'Marseille', 'Port du Moulin Blanc', 310, 8, 11.5, 'Yanmar 30cv', false, '/images/boats/sailboat/oceanis-38-1.jpg'],
  ['Bavaria Cruiser 46', 'sailboat', 'Ajaccio', 'Port Tino Rossi', 420, 10, 14.2, 'Volvo Penta 55cv', true, '/images/boats/sailboat/bavaria-cruiser-46.jpg'],
  ['Dufour 390', 'sailboat', 'Toulon', 'Port de Toulon', 360, 8, 11.9, 'Volvo Penta 40cv', true, '/images/boats/sailboat/dufour-390.jpg'],
  ['Jeanneau Leader 30', 'motorboat', 'Nice', 'Port de Nice', 460, 8, 9.2, '2 x Volvo 220cv', true, '/images/boats/motorboat/jeanneau-leader-30.jpg'],
  ['Merry Fisher 895', 'motorboat', 'Arcachon', 'Port d Arcachon', 420, 6, 8.9, '2 x Yamaha 200cv', false, '/images/boats/motorboat/merry-fisher-895.jpg'],
  ['Prestige 420', 'motorboat', 'Monaco', 'Port Hercule', 720, 10, 13.1, '2 x Cummins 425cv', true, '/images/boats/motorboat/prestige-420.jpg'],
  ['Cap Camarat 7.5', 'motorboat', 'Cannes', 'Vieux-Port de Cannes', 280, 7, 7.5, 'Yamaha 300cv', false, '/images/boats/motorboat/cap-camarat-7-5.jpg'],
  ['Beneteau Antares 9', 'motorboat', 'La Rochelle', 'Port des Minimes', 390, 8, 9, '2 x Suzuki 200cv', false, '/images/boats/motorboat/beneteau-antares-9.jpg'],
  ['Nautitech 46 Open', 'catamaran', 'Cannes', 'Vieux-Port de Cannes', 790, 10, 13.8, '2 x Volvo 50cv', true, '/images/boats/catamaran/nautitech-46-open.jpg'],
  ['Lagoon 42', 'catamaran', 'Hyères', 'Port Saint-Pierre', 680, 10, 12.8, '2 x Yanmar 57cv', true, '/images/boats/catamaran/lagoon-42.jpg'],
  ['Lagoon 380', 'catamaran', 'Ajaccio', 'Port Charles Ornano', 540, 8, 11.6, '2 x Yanmar 29cv', true, '/images/boats/catamaran/lagoon-380.jpg'],
  ['Bali Catspace', 'catamaran', 'Saint-Malo', 'Port des Sablons', 620, 10, 12.3, '2 x Yanmar 40cv', true, '/images/boats/catamaran/bali-catspace.jpg'],
  ['Fountaine Pajot Isla 40', 'catamaran', 'La Rochelle', 'Port des Minimes', 650, 8, 11.9, '2 x Volvo 30cv', true, '/images/boats/catamaran/fountaine-pajot-isla-40.jpg'],
  ['Zodiac Pro 6.5', 'rib', 'Cannes', 'Port Canto', 160, 8, 6.5, 'Yamaha 150cv', false, '/images/boats/rib/zodiac-medline-7.jpg'],
  ['Zar 65 Suite', 'rib', 'Antibes', 'Port Vauban', 190, 9, 6.5, 'Suzuki 200cv', false, '/images/boats/rib/zar-65-suite.jpg'],
  ['Capelli Tempest 700', 'rib', 'La Rochelle', 'Port des Minimes', 180, 10, 7, 'Yamaha 200cv', false, '/images/boats/rib/capelli-tempest-700.jpg'],
  ['Bombard Explorer 650', 'rib', 'Brest', 'Port du Château', 170, 8, 6.5, 'Mercury 150cv', false, '/images/boats/rib/bombard-explorer-650.jpg'],
  ['Highfield Sport 760', 'rib', 'Nice', 'Port de Nice', 240, 10, 7.6, 'Honda 250cv', false, '/images/boats/rib/highfield-sport-760.jpg'],
];

const equipmentsByType = {
  sailboat: ['GPS', 'VHF', 'Pilote automatique', 'Gilets de sauvetage', 'Annexe', 'Cuisine équipée'],
  motorboat: ['GPS', 'VHF', 'Sondeur', 'Bain de soleil', 'Taud de soleil', 'Échelle de bain'],
  catamaran: ['GPS', 'AIS', 'Panneaux solaires', 'Cuisine équipée', 'Stand-up paddle', 'Annexe'],
  rib: ['GPS', 'VHF', 'Gilets de sauvetage', 'Mouillage', 'Échelle de bain', 'Kit premier secours'],
};

const ensureOwner = async () => {
  const owner = await User.findOne({ role: 'owner', isActive: true });
  if (owner) return owner;

  return User.create({
    firstName: 'Owner',
    lastName: 'SailingLoc',
    email: 'owner1@sailingloc.fr',
    password: 'Owner123!',
    role: 'owner',
    phone: '+33610000001',
    privacyConsent: true,
    privacyConsentAt: new Date(),
  });
};

const repairBoats = async () => {
  const owner = await ensureOwner();
  const created = [];
  const updated = [];

  for (const [title, type, location, port, pricePerDay, capacity, length, engine, skipperAvailable, image] of catalog) {
    const payload = {
      owner: owner._id,
      title,
      type,
      description: `${title} disponible à la location entre particuliers. Bateau vérifié, équipé et prêt pour naviguer depuis ${location}.`,
      location,
      port,
      pricePerDay,
      capacity,
      length,
      engine,
      skipperAvailable,
      equipments: equipmentsByType[type],
      images: [image],
      status: 'approved',
      averageRating: 4.7,
    };

    const existing = await Boat.findOne({ title });
    if (existing) {
      existing.set({
        owner: existing.owner || owner._id,
        type,
        location,
        port,
        pricePerDay,
        capacity,
        length,
        engine,
        skipperAvailable,
        equipments: existing.equipments?.length ? existing.equipments : payload.equipments,
        images: existing.images?.length ? existing.images : payload.images,
        status: existing.status || 'approved',
      });
      await existing.save();
      updated.push(existing.title);
    } else {
      const boat = await Boat.create(payload);
      created.push(boat.title);
    }
  }

  const counts = await Boat.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
  return { owner: owner.email, created, updated, counts };
};

module.exports = { repairBoats };
