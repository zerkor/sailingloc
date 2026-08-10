import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Anchor,
  BadgeCheck,
  Camera,
  Check,
  Compass,
  Gauge,
  Lock,
  MapPin,
  Ruler,
  Sailboat,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import BookingForm from '../../components/BookingForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReviewList from '../../components/ReviewList';
import SEO from '../../components/SEO';
import Breadcrumb from '../../components/Breadcrumb';
import { getBoatById, getBoatBySlug, getBoats } from '../../services/boatService';
import { getBoatReviews } from '../../services/reviewService';
import { FALLBACK_BOAT_IMAGE, getBoatImages } from '../../utils/boatImages';
import { formatPrice } from '../../utils/formatPrice';
import BoatCard from '../../components/BoatCard';

const typeLabels = {
  sailboat: 'Voilier',
  motorboat: 'Bateau à moteur',
  catamaran: 'Catamaran',
  rib: 'Semi-rigide',
};

const initials = (owner) =>
  `${owner?.firstName?.charAt(0) || ''}${owner?.lastName?.charAt(0) || ''}`.toUpperCase() || 'SL';

const FeatureItem = ({ icon: Icon, label, value, tone = 'aqua' }) => (
  <div className={`boat-feature-card boat-feature-card--${tone}`}>
    <Icon size={22} strokeWidth={2.1} />
    <span>{label}</span>
    <strong>{value || 'Non renseigné'}</strong>
  </div>
);

const BoatDetailPage = () => {
  const { id, slug } = useParams();
  const [boat, setBoat] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedBoats, setRelatedBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const identifier = slug || id;
        const isId = /^[a-f\d]{24}$/i.test(identifier || '');
        const boatRes = isId ? await getBoatById(identifier) : await getBoatBySlug(identifier);
        const boatData = boatRes.data;
        const reviewsRes = boatData?._id ? await getBoatReviews(boatData._id) : { data: [] };
        setBoat(boatData);
        setReviews(reviewsRes.data || []);
      } catch {
        setError('Impossible de charger ce bateau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, slug]);

  useEffect(() => {
    if (!boat) return;
    getBoats({ type: boat.type, limit: 4 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data?.boats || [];
        setRelatedBoats(items.filter((item) => item._id !== boat._id).slice(0, 3));
      })
      .catch(() => setRelatedBoats([]));
  }, [boat]);

  if (loading) {
    return (
      <>
        <SEO title="Chargement du bateau — SailingLoc" description="Chargement de la fiche bateau SailingLoc." noIndex />
        <LoadingSpinner text="Chargement du bateau..." />
      </>
    );
  }

  if (error || !boat) {
    return (
      <div className="container-max section-padding text-center py-24">
        <SEO title="Bateau introuvable — SailingLoc" description="Cette annonce bateau est introuvable ou indisponible." noIndex />
        <Anchor size={48} className="mx-auto mb-4" color="#00C6E0" />
        <h1 className="mb-4 text-2xl font-bold text-[#07192E]">{error || 'Bateau introuvable'}</h1>
        <Link to="/boats" className="btn-primary">
          Retour aux bateaux
        </Link>
      </div>
    );
  }

  const images = getBoatImages(boat);
  const activeImage = images[selectedImage] || FALLBACK_BOAT_IMAGE;
  const reviewCount = reviews.length;
  const ratingLabel = boat.averageRating > 0 ? `${boat.averageRating.toFixed(1)} / 5` : 'Nouveau bateau';
  const canonicalSlug = boat.slug || boat._id;
  const seoTitle = `${boat.title} à ${boat.location} — Location bateau SailingLoc`;
  const seoDescription = `Louez ${boat.title} à ${boat.location} sur SailingLoc. ${
    typeLabels[boat.type] || 'Bateau'
  } de ${boat.capacity} places, à partir de ${formatPrice(boat.pricePerDay)} par jour. Réservation simple et sécurisée entre particuliers.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: boat.title,
    description: boat.description,
    image: images,
    brand: { '@type': 'Brand', name: 'SailingLoc' },
    offers: {
      '@type': 'Offer',
      price: boat.pricePerDay,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      areaServed: boat.location,
    },
    aggregateRating:
      boat.averageRating > 0 && reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: boat.averageRating,
            reviewCount,
          }
        : undefined,
  };

  return (
    <div className="boat-detail-page">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/boats/${canonicalSlug}`}
        image={activeImage}
        type="product"
        jsonLd={jsonLd}
      />

      <div className="container-max section-padding">
        <Breadcrumb items={[{ label: 'Bateaux', to: '/boats' }, { label: boat.title }]} />

        <div className="boat-detail-layout">
          <main className="boat-detail-main">
            <section className="boat-gallery" aria-label="Photos du bateau">
              <div className="boat-gallery__main">
                <img
                  src={activeImage}
                  alt={boat.title}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_BOAT_IMAGE;
                  }}
                />
                <div className="boat-gallery__overlay" />
                <div className="boat-gallery__badges">
                  <span>
                    <Sailboat size={14} /> {typeLabels[boat.type] || boat.type}
                  </span>
                  <span>
                    <MapPin size={14} /> {boat.location}
                  </span>
                  {boat.skipperAvailable && (
                    <span>
                      <Compass size={14} /> Skipper disponible
                    </span>
                  )}
                </div>
                <div className="boat-gallery__count">
                  <Camera size={14} /> {selectedImage + 1} / {images.length} photo{images.length > 1 ? 's' : ''}
                </div>
              </div>

              {images.length > 1 && (
                <div className="boat-gallery__thumbs">
                  {images.slice(0, 5).map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      className={selectedImage === index ? 'is-active' : ''}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Afficher la photo ${index + 1}`}
                    >
                      <img
                        src={img}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_BOAT_IMAGE;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="boat-title-card">
              <div>
                <span className="boat-eyebrow">{typeLabels[boat.type] || boat.type}</span>
                <h1>
                  {boat.title} à {boat.location}
                </h1>
                <p className="boat-title-card__subtitle">
                  {boat.port || boat.location} · {boat.capacity} personnes · {boat.length || 'Longueur NC'} m
                </p>
              </div>
              <div className="boat-rating-card">
                <Star size={18} fill="#F4A01A" color="#F4A01A" />
                <strong>{ratingLabel}</strong>
                <span>{reviewCount > 0 ? `${reviewCount} avis locataire${reviewCount > 1 ? 's' : ''}` : 'Première location à venir'}</span>
              </div>
              <div className="boat-trust-pills">
                <span>
                  <ShieldCheck size={15} /> Réservation sécurisée
                </span>
                <span>
                  <BadgeCheck size={15} /> Documents vérifiés avant publication
                </span>
                {boat.skipperAvailable && (
                  <span>
                    <Compass size={15} /> Skipper disponible
                  </span>
                )}
              </div>
              <p>{boat.description || 'Aucune description fournie pour cette annonce.'}</p>
            </section>

            <section id="booking-card" className="boat-booking-mobile" aria-label="Réservation">
              <BookingForm boat={boat} />
            </section>

            <section className="boat-section">
              <div className="boat-section__header">
                <span>À bord</span>
                <h2>Caractéristiques du bateau</h2>
              </div>
              <div className="boat-feature-grid">
                <FeatureItem icon={Users} label="Capacité" value={`${boat.capacity} pers.`} />
                <FeatureItem icon={Ruler} label="Longueur" value={boat.length ? `${boat.length} m` : 'Non renseignée'} />
                <FeatureItem icon={Sailboat} label="Type" value={typeLabels[boat.type] || boat.type} tone="sand" />
                <FeatureItem icon={Gauge} label="Moteur" value={boat.engine || 'Non renseigné'} />
                <FeatureItem icon={Anchor} label="Port" value={boat.port || boat.location} tone="sand" />
                <FeatureItem
                  icon={Compass}
                  label="Skipper"
                  value={boat.skipperAvailable ? 'Disponible' : 'Non inclus'}
                />
                <FeatureItem icon={Star} label="Note" value={ratingLabel} tone="sand" />
                <FeatureItem icon={ShieldCheck} label="Statut" value="Annonce validée" />
              </div>
            </section>

            <section className="boat-section">
              <div className="boat-section__header">
                <span>Confort</span>
                <h2>Équipements à bord</h2>
              </div>
              {boat.equipments?.length > 0 ? (
                <div className="boat-equipment-list">
                  {boat.equipments.map((equipment) => (
                    <span key={equipment}>
                      <Check size={15} /> {equipment}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="boat-empty-state">Aucun équipement spécifique n'a encore été renseigné.</div>
              )}
            </section>

            <section className="boat-owner-card">
              <div className="boat-section__header">
                <span>Confiance</span>
                <h2>Propriétaire</h2>
              </div>
              {boat.owner ? (
                <div className="boat-owner-card__content">
                  <div className="boat-owner-card__avatar">{initials(boat.owner)}</div>
                  <div>
                    <strong>
                      {boat.owner.firstName} {boat.owner.lastName}
                    </strong>
                    <span>Propriétaire SailingLoc</span>
                  </div>
                  <div className="boat-owner-card__checks">
                    <span>
                      <ShieldCheck size={15} /> Vérification administrative avant publication
                    </span>
                    <span>
                      <Lock size={15} /> Documents bateau vérifiés
                    </span>
                    <span>
                      <Sparkles size={15} /> Annonce validée par SailingLoc
                    </span>
                  </div>
                </div>
              ) : (
                <div className="boat-empty-state">Propriétaire en cours de rattachement administratif.</div>
              )}
            </section>

            <section className="boat-section">
              <div className="boat-section__header">
                <span>Retours</span>
                <h2>Avis des locataires</h2>
              </div>
              <ReviewList reviews={reviews} />
            </section>

            {relatedBoats.length > 0 && (
              <section className="boat-section">
                <div className="boat-section__header">
                  <span>Suggestions</span>
                  <h2>Bateaux similaires</h2>
                </div>
                <div className="boat-related-grid">
                  {relatedBoats.map((item) => (
                    <BoatCard key={item._id} boat={item} />
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="boat-detail-aside" aria-label="Réservation">
            <BookingForm boat={boat} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BoatDetailPage;
