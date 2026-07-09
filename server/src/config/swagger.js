const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'SailingLoc API',
    version: '1.0.0',
    description: 'Documentation OpenAPI de la plateforme de location de bateaux entre particuliers SailingLoc.',
  },
  servers: [{ url: process.env.SERVER_URL || 'http://localhost:5000', description: 'API SailingLoc' }],
  tags: [
    { name: 'Auth' },
    { name: 'Boats' },
    { name: 'Bookings' },
    { name: 'Admin' },
    { name: 'Payments' },
    { name: 'Documents' },
    { name: 'Uploads' },
    { name: 'System' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: { message: { type: 'string' } },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['tenant', 'owner', 'admin'] },
          isActive: { type: 'boolean' },
        },
      },
      Boat: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          owner: { type: 'string' },
          title: { type: 'string' },
          type: { type: 'string', enum: ['sailboat', 'motorboat', 'catamaran', 'rib'] },
          description: { type: 'string' },
          location: { type: 'string' },
          pricePerDay: { type: 'number' },
          capacity: { type: 'integer' },
          images: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          boat: { type: 'string' },
          tenant: { type: 'string' },
          owner: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string' },
          paymentStatus: { type: 'string' },
          totalPrice: { type: 'number' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          boat: { type: 'string' },
          author: { type: 'string' },
          rating: { type: 'integer' },
          comment: { type: 'string' },
          status: { type: 'string' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          booking: { type: 'string' },
          amount: { type: 'number' },
          serviceFee: { type: 'number' },
          currency: { type: 'string' },
          provider: { type: 'string' },
          status: { type: 'string' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          owner: { type: 'string' },
          boat: { type: 'string' },
          type: { type: 'string' },
          title: { type: 'string' },
          fileUrl: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Vérifie que l API répond',
        responses: { 200: { description: 'API opérationnelle' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Crée un compte locataire ou propriétaire',
        requestBody: { required: true },
        responses: { 201: { description: 'Compte créé' }, 400: { description: 'Données invalides' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connecte un utilisateur',
        requestBody: { required: true },
        responses: { 200: { description: 'JWT et utilisateur' }, 401: { description: 'Identifiants invalides' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Retourne le profil connecté',
        responses: { 200: { description: 'Profil utilisateur' }, 401: { description: 'Non authentifié' } },
      },
    },
    '/api/boats': {
      get: {
        tags: ['Boats'],
        summary: 'Liste les bateaux approuvés',
        responses: { 200: { description: 'Liste paginée des bateaux' } },
      },
      post: {
        tags: ['Boats'],
        security: [{ bearerAuth: [] }],
        summary: 'Crée une annonce bateau',
        responses: { 201: { description: 'Bateau créé en attente de validation' } },
      },
    },
    '/api/boats/{id}': {
      get: {
        tags: ['Boats'],
        summary: 'Détail d un bateau',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Bateau' }, 404: { description: 'Introuvable' } },
      },
    },
    '/api/bookings': {
      post: {
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        summary: 'Crée une demande de réservation',
        responses: { 201: { description: 'Réservation créée' }, 409: { description: 'Dates indisponibles' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        summary: 'Liste les utilisateurs avec pagination',
        responses: { 200: { description: 'Utilisateurs' }, 403: { description: 'Admin requis' } },
      },
    },
    '/api/admin/bookings': {
      get: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        summary: 'Liste les réservations admin',
        responses: { 200: { description: 'Réservations' } },
      },
    },
    '/api/admin/payments': {
      get: {
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        summary: 'Liste les paiements admin',
        responses: { 200: { description: 'Paiements' } },
      },
    },
    '/api/documents/admin': {
      get: {
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        summary: 'Liste les documents à modérer',
        responses: { 200: { description: 'Documents' } },
      },
    },
    '/api/uploads/boat-images': {
      post: {
        tags: ['Uploads'],
        security: [{ bearerAuth: [] }],
        summary: 'Upload une image de bateau',
        responses: { 201: { description: 'URL du fichier uploadé' } },
      },
    },
    '/api/uploads/documents': {
      post: {
        tags: ['Uploads'],
        security: [{ bearerAuth: [] }],
        summary: 'Upload un document de vérification',
        responses: { 201: { description: 'URL du fichier uploadé' } },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};

module.exports = { setupSwagger, swaggerSpec };
