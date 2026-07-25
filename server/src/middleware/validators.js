const { body, param, query } = require('express-validator');

const mongoId = (field = 'id') => param(field).isMongoId().withMessage(`${field} invalide`);

const pagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('La page doit etre un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('La limite doit etre comprise entre 1 et 50'),
];

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('Le prenom est requis').isLength({ max: 80 }),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('role').optional().isIn(['tenant', 'owner']).withMessage('Role invalide'),
  body('privacyConsent')
    .custom((value) => value === true || value === 'true')
    .withMessage('Le consentement RGPD est requis'),
  body('marketingConsent').optional().isBoolean().withMessage('Consentement marketing invalide'),
];

const loginRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

const forgotPasswordRules = [body('email').isEmail().withMessage('Email invalide').normalizeEmail()];

const resetPasswordRules = [
  param('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Token de reinitialisation invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres'),
];

const buildBoatRules = (isUpdate = false) => {
  const required = (field) => (isUpdate ? body(field).optional() : body(field));

  return [
    required('title').trim().notEmpty().withMessage('Le titre est requis').isLength({ max: 140 }),
    required('description').trim().notEmpty().withMessage('La description est requise').isLength({ min: 10 }),
    required('type').isIn(['sailboat', 'motorboat', 'catamaran', 'rib']).withMessage('Type de bateau invalide'),
    required('location').trim().notEmpty().withMessage('La localisation est requise').isLength({ max: 120 }),
    body('port').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
    required('pricePerDay').isFloat({ min: 1 }).withMessage('Le prix par jour doit etre positif'),
    required('capacity').isInt({ min: 1, max: 50 }).withMessage('La capacite doit etre comprise entre 1 et 50'),
    body('length')
      .optional({ nullable: true, checkFalsy: true })
      .isFloat({ min: 1 })
      .withMessage('La longueur doit etre positive'),
    body('engine').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
    body('skipperAvailable').optional().isBoolean().withMessage('skipperAvailable doit etre un booleen'),
    body('equipments').optional().isArray().withMessage('Les equipements doivent etre une liste'),
    body('equipments.*').optional().trim().isLength({ max: 80 }),
    body('images').optional().isArray({ max: 8 }).withMessage('Les images doivent etre une liste'),
    body('images.*')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (value.startsWith('/uploads/')) return true;
        try {
          return Boolean(new URL(value).protocol);
        } catch {
          throw new Error('URL image invalide');
        }
      }),
    body('unavailableDates').optional().isArray().withMessage('Les dates indisponibles doivent etre une liste'),
    body('unavailableDates.*').optional().isISO8601().withMessage('Date indisponible invalide'),
  ];
};

const boatRules = buildBoatRules(false);
const updateBoatRules = buildBoatRules(true);

const createBookingRules = [
  body('boatId').isMongoId().withMessage('Bateau invalide'),
  body('startDate').isISO8601().withMessage('Date de debut invalide'),
  body('endDate').isISO8601().withMessage('Date de fin invalide'),
];

const createReviewRules = [
  body('boatId').isMongoId().withMessage('Bateau invalide'),
  body('bookingId').isMongoId().withMessage('Reservation invalide'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit etre comprise entre 1 et 5'),
  body('comment')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Le commentaire doit contenir entre 5 et 2000 caracteres'),
];

const updateProfileRules = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
];

const updateUserRules = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('role').optional().isIn(['tenant', 'owner', 'admin']).withMessage('Role invalide'),
  body('isActive').optional().isBoolean().withMessage('isActive doit etre un booleen'),
];

const testEmailRules = [body('to').isEmail().withMessage('Adresse email invalide').normalizeEmail()];

const contactMessageRules = [
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 120 }),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail().isLength({ max: 160 }),
  body('subject').isIn(['technique', 'location', 'partenariat', 'autre']).withMessage('Sujet invalide'),
  body('message').trim().isLength({ min: 10, max: 4000 }).withMessage('Le message doit contenir entre 10 et 4000 caracteres'),
];

const updateContactMessageRules = [
  body('status').optional().isIn(['new', 'read', 'resolved', 'archived']).withMessage('Statut invalide'),
  body('adminNote').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

module.exports = {
  mongoId,
  pagination,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  boatRules,
  updateBoatRules,
  createBookingRules,
  createReviewRules,
  updateProfileRules,
  updateUserRules,
  testEmailRules,
  contactMessageRules,
  updateContactMessageRules,
};
