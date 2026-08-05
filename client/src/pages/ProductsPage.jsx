import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarCheck, CreditCard, FileCheck2, Headphones, ShieldCheck } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const services = [
  {
    icon: ShieldCheck,
    title: 'Propriétaires vérifiés',
    text: 'Les comptes propriétaires et les annonces peuvent être contrôlés depuis le back-office.',
  },
  {
    icon: CalendarCheck,
    title: 'Gestion des réservations',
    text: 'Demande, acceptation, paiement simulé, annulation et clôture sont suivis dans les espaces dédiés.',
  },
  {
    icon: CreditCard,
    title: 'Paiement simulé',
    text: 'Le parcours de paiement est représenté pour la démonstration du MVP et les tests applicatifs.',
  },
  {
    icon: FileCheck2,
    title: 'Documents propriétaires',
    text: 'Les documents peuvent être déposés puis validés ou refusés par l’administration.',
  },
  {
    icon: BadgeCheck,
    title: 'Modération admin',
    text: 'Utilisateurs, bateaux, avis, réservations, paiements et messages contact sont pilotables.',
  },
  {
    icon: Headphones,
    title: 'Support contact',
    text: 'Les demandes envoyées depuis le formulaire contact remontent dans l’espace administrateur.',
  },
];

const ProductsPage = () => (
  <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>
    <section
      className="px-4 sm:px-6 lg:px-10 xl:px-14 py-14 sm:py-16"
      style={{ background: 'linear-gradient(135deg, #07192E 0%, #155374 100%)' }}
    >
      <div className="container-max">
        <Breadcrumb className="site-breadcrumb--light" items={[{ label: 'Services' }]} />
        <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>
          Services
        </span>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px,5vw,54px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.08,
          }}
        >
          Les services SailingLoc
        </h1>
        <p className="mt-3 text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.7 }}>
          Une plateforme pensée pour louer un bateau, publier une annonce et gérer les validations côté administration.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/boats"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
            style={{ background: '#00C6E0', color: '#07192E' }}
          >
            Voir les bateaux <ArrowRight size={16} />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            Devenir propriétaire
          </Link>
        </div>
      </div>
    </section>

    <section className="container-max section-padding">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <article
              key={service.title}
              className="bg-white rounded-2xl p-6 min-h-[210px]"
              style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(0,198,224,0.12)', color: '#00A8C2' }}
              >
                <Icon size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#07192E' }}>
                {service.title}
              </h2>
              <p className="text-sm leading-6" style={{ color: '#64748B' }}>
                {service.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  </div>
);

export default ProductsPage;
