import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Anchor,
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sailboat,
  ShieldCheck,
  ShipWheel,
  Star,
  Users,
  Waves,
} from 'lucide-react';
import BoatGrid from '../components/BoatGrid';
import SEO from '../components/SEO';
import { getBoats } from '../services/boatService';
import { mockBoats } from '../data/boats.mock';

const STATS = [
  ['1 200+', 'Bateaux'],
  ['320', 'Ports'],
  ['15 000+', 'Navigations'],
  ['4.9/5', 'Note moyenne'],
];

const STEPS = [
  {
    icon: Search,
    title: 'Rechercher',
    text: 'Filtrez par destination, dates, type de bateau et budget.',
  },
  {
    icon: CalendarDays,
    title: 'Reservez',
    text: 'Envoyez une demande au proprietaire et suivez son acceptation.',
  },
  {
    icon: Sailboat,
    title: 'Naviguez',
    text: 'Prenez le large avec une reservation securisee et verifiee.',
  },
];

const REVIEWS = [
  ['Marie D.', 'Le voilier etait impeccable. Reservation simple et proprietaire tres reactif.'],
  ['Thomas L.', 'Parfait pour une sortie en famille. Le bateau correspondait exactement a l annonce.'],
  ['Sarah B.', 'Tres bonne experience, paiement clair et support rassurant avant le depart.'],
];

const HeroSearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    navigate(`/boats?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="home-search" aria-label="Rechercher un bateau">
      <label className="home-search-field">
        <span>Destination</span>
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Marseille, Nice..."
        />
      </label>
      <label className="home-search-field">
        <span>Dates</span>
        <input type="text" placeholder="Arrivee - depart" aria-label="Dates souhaitees" />
      </label>
      <label className="home-search-field">
        <span>Type</span>
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Type de bateau">
          <option value="">Tous types</option>
          <option value="sailboat">Voilier</option>
          <option value="motorboat">Moteur</option>
          <option value="catamaran">Catamaran</option>
          <option value="rib">Semi-rigide</option>
        </select>
      </label>
      <button type="submit" className="home-search-button">
        <Search size={16} />
        <span>Rechercher</span>
      </button>
    </form>
  );
};

const HomePage = () => {
  const [featuredBoats, setFeaturedBoats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBoats({ limit: 6 })
      .then(({ data }) => {
        const boats = data.boats || data || [];
        setFeaturedBoats(boats.length > 0 ? boats.slice(0, 6) : mockBoats.slice(0, 6));
      })
      .catch(() => setFeaturedBoats(mockBoats.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-shell">
      <SEO
        title="SailingLoc - Location de bateaux entre particuliers"
        description="Louez un voilier, catamaran ou bateau a moteur entre particuliers avec proprietaires verifies, avis et reservation en ligne."
      />
      <section className="home-hero">
        <div className="home-hero-orb" aria-hidden="true" />
        <div className="container-max home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-pill">
              <Anchor size={13} />
              Plateforme n 1 en France
            </span>
            <h1>
              Naviguez librement,
              <span> entre particuliers</span>
            </h1>
            <p>
              Louez un voilier ou un bateau a moteur directement aupres de proprietaires verifies, avec disponibilites,
              avis et reservation en ligne.
            </p>
            <HeroSearchBar />
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="Chiffres cles SailingLoc">
        <div className="container-max home-stats-grid">
          {STATS.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding home-section">
        <div className="container-max">
          <div className="home-section-heading">
            <div>
              <span className="sec-eyebrow">Nos bateaux</span>
              <h2>Trouvez votre embarcation ideale</h2>
            </div>
            <Link to="/boats" className="home-text-link">
              Voir tous les bateaux <ArrowRight size={15} />
            </Link>
          </div>
          <BoatGrid boats={featuredBoats} loading={loading} />
          <div className="text-center mt-9">
            <Link to="/boats" className="home-dark-cta">
              Voir tous les bateaux <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding home-section home-how">
        <div className="container-max">
          <span className="sec-eyebrow">Comment ca marche</span>
          <h2>Simple, rapide et securise</h2>
          <div className="home-step-grid">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="home-step-card">
                  <Icon size={25} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding home-section">
        <div className="container-max">
          <span className="sec-eyebrow">Temoignages</span>
          <h2>Ils ont navigue avec SailingLoc</h2>
          <div className="home-review-grid">
            {REVIEWS.map(([name, text]) => (
              <article key={name} className="home-review-card">
                <div className="home-stars" aria-label="5 sur 5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={14} fill="#F4A01A" color="#F4A01A" />
                  ))}
                </div>
                <p>{text}</p>
                <div className="home-review-user">
                  <span>{name.slice(0, 1)}</span>
                  <strong>{name}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-trust">
        <div className="container-max home-trust-grid">
          <div>
            <ShieldCheck size={20} /> Proprietaires verifies
          </div>
          <div>
            <Users size={20} /> Support reservation
          </div>
          <div>
            <ShipWheel size={20} /> Bateaux valides
          </div>
          <div>
            <Waves size={20} /> Paiement trace
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
