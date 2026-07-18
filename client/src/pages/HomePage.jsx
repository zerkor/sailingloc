import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  ['1 200+', 'home.stats.boats'],
  ['320', 'home.stats.ports'],
  ['15 000+', 'home.stats.navigations'],
  ['4.9/5', 'home.stats.rating'],
];

const STEPS = [
  {
    icon: Search,
    titleKey: 'home.steps.searchTitle',
    textKey: 'home.steps.searchText',
  },
  {
    icon: CalendarDays,
    titleKey: 'home.steps.bookTitle',
    textKey: 'home.steps.bookText',
  },
  {
    icon: Sailboat,
    titleKey: 'home.steps.sailTitle',
    textKey: 'home.steps.sailText',
  },
];

const REVIEWS = [
  ['Marie D.', 'home.reviews.marie'],
  ['Thomas L.', 'home.reviews.thomas'],
  ['Sarah B.', 'home.reviews.sarah'],
];

const HeroSearchBar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    <form onSubmit={handleSubmit} className="home-search" aria-label={t('home.searchAria')}>
      <label className="home-search-field">
        <span>{t('home.destination')}</span>
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder={t('home.destinationPlaceholder')}
        />
      </label>
      <label className="home-search-field">
        <span>{t('home.dates')}</span>
        <input type="text" placeholder={t('home.datesPlaceholder')} aria-label={t('home.dateAria')} />
      </label>
      <label className="home-search-field">
        <span>{t('boatTypes.label')}</span>
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label={t('home.typeAria')}>
          <option value="">{t('boatTypes.all')}</option>
          <option value="sailboat">{t('boatTypes.sailboat')}</option>
          <option value="motorboat">{t('boatTypes.motorboat')}</option>
          <option value="catamaran">{t('boatTypes.catamaran')}</option>
          <option value="rib">{t('boatTypes.rib')}</option>
        </select>
      </label>
      <button type="submit" className="home-search-button">
        <Search size={16} />
        <span>{t('common.search')}</span>
      </button>
    </form>
  );
};

const HomePage = () => {
  const { t } = useTranslation();
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
      <SEO title={t('home.seoTitle')} description={t('home.seoDescription')} />
      <section className="home-hero">
        <div className="container-max home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-pill">
              <Anchor size={13} />
              {t('home.pill')}
            </span>
            <h1>
              {t('home.heroTitle')}
              <span>{t('home.heroHighlight')}</span>
            </h1>
            <p>{t('home.heroSubtitle')}</p>
            <HeroSearchBar />
          </div>
          <div className="home-hero-orb" aria-hidden="true" />
        </div>
      </section>

      <section className="home-stats" aria-label={t('home.statsAria')}>
        <div className="container-max home-stats-grid">
          {STATS.map(([value, labelKey]) => (
            <div key={labelKey}>
              <strong>{value}</strong>
              <span>{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding home-section home-section--boats">
        <div className="container-max">
          <div className="home-section-heading">
            <div>
              <span className="sec-eyebrow">{t('home.boatsEyebrow')}</span>
              <h2>{t('home.boatsTitle')}</h2>
            </div>
            <Link to="/boats" className="home-text-link">
              {t('home.viewAllBoats')} <ArrowRight size={15} />
            </Link>
          </div>
          <BoatGrid boats={featuredBoats} loading={loading} />
          <div className="home-boats-cta text-center">
            <Link to="/boats" className="home-dark-cta">
              {t('home.viewAllBoats')} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding home-section home-how">
        <div className="container-max">
          <span className="sec-eyebrow">{t('home.howEyebrow')}</span>
          <h2>{t('home.howTitle')}</h2>
          <div className="home-step-grid">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.titleKey} className="home-step-card">
                  <Icon size={25} />
                  <h3>{t(step.titleKey)}</h3>
                  <p>{t(step.textKey)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding home-section home-section--reviews">
        <div className="container-max">
          <span className="sec-eyebrow">{t('home.reviewsEyebrow')}</span>
          <h2>{t('home.reviewsTitle')}</h2>
          <div className="home-review-grid">
            {REVIEWS.map(([name, textKey]) => (
              <article key={name} className="home-review-card">
                <div className="home-stars" aria-label={t('home.reviewAria')}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={14} fill="#F4A01A" color="#F4A01A" />
                  ))}
                </div>
                <p>{t(textKey)}</p>
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
            <ShieldCheck size={20} /> {t('home.trust.owners')}
          </div>
          <div>
            <Users size={20} /> {t('home.trust.support')}
          </div>
          <div>
            <ShipWheel size={20} /> {t('home.trust.boats')}
          </div>
          <div>
            <Waves size={20} /> {t('home.trust.payment')}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
