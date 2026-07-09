import { Link } from 'react-router-dom';
import { Anchor, ShipWheel, Sailboat, Waves } from 'lucide-react';

const categories = [
  {
    title: 'Voiliers',
    type: 'sailboat',
    description: 'Pour une navigation douce, sportive ou familiale au rythme du vent.',
    icon: Sailboat,
  },
  {
    title: 'Bateaux à moteur',
    type: 'motorboat',
    description: 'Idéal pour les sorties rapides, les criques et les journées entre amis.',
    icon: ShipWheel,
  },
  {
    title: 'Catamarans',
    type: 'catamaran',
    description: 'Plus d’espace, plus de stabilité et un grand confort à bord.',
    icon: Anchor,
  },
  {
    title: 'Semi-rigides',
    type: 'rib',
    description: 'Agiles, pratiques et parfaits pour les excursions côtières.',
    icon: Waves,
  },
];

const CategoriesPage = () => (
  <div style={{ background: '#F7F5F2', minHeight: '100vh' }}>
    <section className="px-4 sm:px-6 lg:px-14 py-16" style={{ background: '#07192E' }}>
      <div className="container-max">
        <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>
          Navigation par type
        </span>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px,5vw,54px)',
            fontWeight: 800,
            color: '#fff',
          }}
        >
          Catégories de bateaux
        </h1>
        <p className="mt-3 text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Parcourez les annonces SailingLoc par type d’embarcation et trouvez le bateau adapté à votre sortie.
        </p>
      </div>
    </section>
    <section className="container-max section-padding">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <article
              key={category.type}
              className="bg-white rounded-2xl p-6 flex flex-col min-h-[260px]"
              style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(0,198,224,0.12)', color: '#00A8C2' }}
              >
                <Icon size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#07192E' }}>
                {category.title}
              </h2>
              <p className="text-sm leading-6 flex-1" style={{ color: '#64748B' }}>
                {category.description}
              </p>
              <Link
                to={`/boats?type=${category.type}`}
                className="mt-6 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold"
                style={{ background: '#07192E', color: '#fff' }}
              >
                Voir les bateaux
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  </div>
);

export default CategoriesPage;
