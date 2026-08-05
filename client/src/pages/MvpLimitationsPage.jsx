import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';

const sections = [
  {
    title: 'Fonctionnalites realisees',
    intro: 'Le MVP couvre les parcours principaux attendus pour une demonstration de fin d annee.',
    items: [
      'Catalogue public avec recherche, filtres, fiches bateaux et images par categorie.',
      'Authentification JWT avec roles locataire, proprietaire et administrateur.',
      'Parcours reservation : demande, acceptation proprietaire, paiement simule, annulation et historique.',
      'Espace proprietaire : dashboard, annonces, reservations et documents.',
      'Back-office admin : utilisateurs, bateaux, reservations, avis, documents, paiements, signalements et journal d actions.',
      'Mot de passe oublie avec token securise, hash en base et expiration.',
      'Documentation technique, Swagger, Docker, CI, tests API et tests E2E de base.',
    ],
  },
  {
    title: 'Limites assumees du MVP',
    intro: 'Ces points sont volontaires ou dependants d une configuration externe pour une production reelle.',
    items: [
      'Le paiement est simule : aucune transaction bancaire reelle n est encaissee.',
      'Les uploads sont stockes localement ; une production utiliserait un stockage cloud persistant.',
      'L envoi email reel depend des variables SMTP configurees sur Render.',
      'La verification documentaire est manuelle cote administration.',
      'La gestion des litiges existe sous forme de signalements, mais pas encore comme workflow d arbitrage complet.',
      'La securite est traitee au niveau MVP et necessiterait un audit externe avant exploitation commerciale.',
    ],
  },
  {
    title: 'Evolutions production',
    intro: 'Les prochaines etapes permettent de passer d un MVP academique a une plateforme commercialisable.',
    items: [
      'Connecter Stripe ou un autre PSP avec webhooks et recus de paiement.',
      'Migrer les images et documents vers S3, Cloudinary, Azure Blob ou equivalent.',
      'Ajouter une messagerie locataire/proprietaire et un workflow litiges complet.',
      'Generer les contrats de location en PDF et ajouter une signature electronique.',
      'Automatiser les backups MongoDB, le monitoring applicatif et les alertes uptime.',
      'Completer les audits Lighthouse, accessibilite, securite et charge avant ouverture publique.',
    ],
  },
];

const MvpLimitationsPage = () => (
  <div style={{ background: '#F7F5F2', minHeight: '80vh' }}>
    <SEO title="Limites du MVP | SailingLoc" description="Limites assumees du MVP academique SailingLoc." />
    <div className="container-max section-padding max-w-5xl">
      <Breadcrumb className="site-breadcrumb--card" items={[{ label: 'Limites MVP' }]} />
      <p className="text-xs uppercase font-bold tracking-wider mb-3" style={{ color: '#00AFC8' }}>
        Soutenance
      </p>
      <h1
        className="mb-4"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px,5vw,48px)',
          fontWeight: 800,
          color: '#07192E',
        }}
      >
        Perimetre et limites du MVP
      </h1>
      <p className="text-base leading-relaxed mb-8 max-w-3xl" style={{ color: '#64748B' }}>
        Cette page clarifie ce qui est implemente, ce qui est simule pour la demonstration et ce qui resterait a
        industrialiser avant une production commerciale.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {sections.map((section) => (
          <article
            key={section.title}
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
          >
            <h2
              className="text-xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
            >
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748B' }}>
              {section.intro}
            </p>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: '#3D4D61' }}>
                  <span className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: '#00C6E0' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </div>
);

export default MvpLimitationsPage;
