import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Anchor, Check, Compass, Lock, MapPin, Ruler, Settings, ShieldCheck, Star, Users } from 'lucide-react';
import { getBoatById, getBoatBySlug } from '../../services/boatService';
import { getBoatReviews } from '../../services/reviewService';
import BookingForm from '../../components/BookingForm';
import ReviewList from '../../components/ReviewList';
import LoadingSpinner from '../../components/LoadingSpinner';
import SEO from '../../components/SEO';
import { formatPrice } from '../../utils/formatPrice';

const typeLabels = {
  sailboat: 'Voilier',
  motorboat: 'Bateau à moteur',
  catamaran: 'Catamaran',
  rib: 'Semi-rigide',
};

const BoatDetailPage = () => {
  const { id, slug } = useParams();
  const [boat, setBoat] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boatRes, reviewsRes] = await Promise.all([
          slug ? getBoatBySlug(slug) : getBoatById(id),
          getBoatReviews(id || slug?.match(/[a-f\d]{24}$/i)?.[0]),
        ]);
        setBoat(boatRes.data);
        setReviews(reviewsRes.data || []);
      } catch {
        setError('Impossible de charger ce bateau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, slug]);

  if (loading) return <LoadingSpinner text="Chargement du bateau..." />;
  if (error || !boat) {
    return (
      <div className="container-max section-padding text-center py-24">
        <Anchor size={48} className="mx-auto mb-4" color="#00C6E0" />
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#07192E' }}>
          {error || 'Bateau introuvable'}
        </h2>
        <Link to="/boats" className="btn-primary">
          Retour aux bateaux
        </Link>
      </div>
    );
  }

  const images = boat.images?.length
    ? boat.images
    : ['https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800'];
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
      boat.averageRating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: boat.averageRating,
            reviewCount: reviews.length || 1,
          }
        : undefined,
  };

  return (
    <div style={{ background: '#EDF1F5', minHeight: '100vh' }}>
      <SEO
        title={`${boat.title} a ${boat.location} - SailingLoc`}
        description={`Louez ${boat.title}, ${typeLabels[boat.type] || 'bateau'} a ${boat.location}, a partir de ${formatPrice(boat.pricePerDay)} par jour.`}
        jsonLd={jsonLd}
      />
      <div className="container-max section-padding">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: '#8896A8' }}>
          <Link to="/" className="hover:text-cyan-500 transition-colors" style={{ color: '#00C6E0' }}>
            Accueil
          </Link>
          <span>/</span>
          <Link to="/boats" className="hover:text-cyan-500 transition-colors" style={{ color: '#00C6E0' }}>
            Bateaux
          </Link>
          <span>/</span>
          <span className="truncate max-w-[200px]">{boat.title}</span>
        </div>

        {/* ── Gallery ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {/* Main image */}
          <div className="md:col-span-2 rounded-2xl overflow-hidden relative" style={{ height: 380 }}>
            <img
              src={images[selectedImage]}
              alt={boat.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800';
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(7,25,46,0.3) 0%, transparent 60%)' }}
            />
          </div>

          {/* Thumbs */}
          {images.length > 1 && (
            <div className="grid grid-rows-2 gap-3">
              {images.slice(1, 3).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i + 1)}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    outline: selectedImage === i + 1 ? '3px solid #00C6E0' : '3px solid transparent',
                    outlineOffset: 2,
                  }}
                >
                  <img
                    src={img}
                    alt={`Vue ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    style={{ height: '100%', maxHeight: 180 }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=400';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content + Booking ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT: details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
              <div className="mb-3">
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 rounded-full mb-3"
                  style={{ background: 'rgba(0,198,224,0.12)', color: '#00C6E0' }}
                >
                  {typeLabels[boat.type] || boat.type}
                </span>
                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(24px,4vw,42px)',
                    fontWeight: 800,
                    color: '#07192E',
                    lineHeight: 1.1,
                  }}
                >
                  {boat.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2 items-center mb-4">
                <div className="meta-pill">
                  <MapPin size={14} /> {boat.location}
                </div>
                {boat.averageRating > 0 && (
                  <div className="meta-pill">
                    <Star size={14} fill="#F4A01A" color="#F4A01A" />
                    {boat.averageRating.toFixed(1)} ({reviews.length} avis)
                  </div>
                )}
                {boat.skipperAvailable && (
                  <div className="meta-pill">
                    <Compass size={14} /> Skipper disponible
                  </div>
                )}
                {boat.length && (
                  <div className="meta-pill">
                    <Ruler size={14} /> {boat.length} m
                  </div>
                )}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: '#3D4D61' }}>
                {boat.description || 'Aucune description fournie.'}
              </p>
            </div>

            {/* Specs */}
            <div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
              >
                Caractéristiques
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Capacité', value: `${boat.capacity} pers.`, icon: Users },
                  { label: 'Longueur', value: boat.length ? `${boat.length} m` : 'N/A', icon: Ruler },
                  { label: 'Skipper', value: boat.skipperAvailable ? 'Disponible' : 'Non inclus', icon: Compass },
                  { label: 'Moteur', value: boat.engine || 'N/A', icon: Settings },
                  { label: 'Port', value: boat.port || boat.location, icon: Anchor },
                  {
                    label: 'Note',
                    value: boat.averageRating > 0 ? `${boat.averageRating.toFixed(1)}/5` : 'Nouveau',
                    icon: Star,
                  },
                ].map((spec) => (
                  <div key={spec.label} className="spec-item">
                    <spec.icon size={22} className="mb-2 mx-auto" color="#155374" />
                    <div className="spec-lbl">{spec.label}</div>
                    <div className="spec-val">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            {boat.equipments?.length > 0 && (
              <div>
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
                >
                  Équipements
                </h2>
                <div className="flex flex-wrap gap-2">
                  {boat.equipments.map((eq, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        background: 'rgba(0,198,224,0.1)',
                        color: '#155374',
                        border: '1px solid rgba(0,198,224,0.25)',
                      }}
                    >
                      <Check size={14} /> {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner */}
            {boat.owner && (
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
                >
                  Propriétaire
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: '#07192E', color: '#00C6E0' }}
                  >
                    {boat.owner.firstName?.charAt(0)}
                    {boat.owner.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#07192E' }}>
                      {boat.owner.firstName} {boat.owner.lastName}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-sm" style={{ color: '#8896A8' }}>
                      Propriétaire vérifié <ShieldCheck size={14} color="#16a34a" />
                    </p>
                  </div>
                </div>
                {/* Trust block */}
                <div
                  className="mt-4 flex items-start gap-3 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(0,198,224,0.07)', border: '1px solid rgba(0,198,224,0.2)' }}
                >
                  <Lock size={18} className="mt-0.5 flex-shrink-0" />
                  <p style={{ color: '#155374' }}>
                    Les documents du propriétaire sont vérifiés avant la publication de l'annonce.
                  </p>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2
                className="text-xl font-bold mb-5"
                style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
              >
                Avis ({reviews.length})
              </h2>
              <ReviewList reviews={reviews} />
            </div>
          </div>

          {/* RIGHT: booking */}
          <div className="lg:col-span-1">
            <BookingForm boat={boat} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatDetailPage;
