import SEO from '../components/SEO';

const limits = [
  'SailingLoc est un MVP académique conçu pour démontrer un parcours complet de location entre particuliers.',
  'Le paiement est simulé avec une structure prête à évoluer vers Stripe, mais aucun encaissement réel n est effectué.',
  'Les uploads sont stockés localement ; une production sérieuse utiliserait un stockage cloud privé comme S3, Azure Blob ou Cloudinary.',
  "Le mot de passe oublié utilise un vrai token sécurisé ; l'envoi e-mail réel nécessite une configuration SMTP.",
  'La vérification d identité et des documents est manuelle côté administration.',
  'Il n existe pas encore d application mobile native, d intégration assurance partenaire ni d arbitrage complet des litiges.',
  'La messagerie temps réel n est pas incluse dans ce MVP.',
  'Les données de démonstration générées par le seed peuvent apparaître dans l environnement local.',
  'La sécurité est traitée au niveau MVP et nécessiterait un audit externe avant une mise en production réelle.',
];

const MvpLimitationsPage = () => (
  <div style={{ background: '#F7F5F2', minHeight: '80vh' }}>
    <SEO title="Limites du MVP | SailingLoc" description="Limites assumées du MVP académique SailingLoc." />
    <div className="container-max section-padding max-w-4xl">
      <p className="text-xs uppercase font-bold tracking-wider mb-3" style={{ color: '#00AFC8' }}>
        Soutenance
      </p>
      <h1
        className="mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: '#07192E' }}
      >
        Limites du MVP
      </h1>
      <p className="text-base leading-relaxed mb-8" style={{ color: '#64748B' }}>
        Cette page clarifie le périmètre actuel du projet et les choix assumés pour une présentation académique.
      </p>
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <ul className="space-y-4">
          {limits.map((limit) => (
            <li key={limit} className="flex gap-3 text-sm leading-relaxed" style={{ color: '#3D4D61' }}>
              <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ background: '#00C6E0' }} />
              <span>{limit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default MvpLimitationsPage;
