import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BoatGrid from '../components/BoatGrid';
import { getBoats } from '../services/boatService';
import { mockBoats } from '../data/boats.mock';

const TABS = [
  { label: 'Tous',      value: 'all',       icon: '🌊' },
  { label: 'Voilier',   value: 'sailboat',  icon: '⛵' },
  { label: 'Moteur',    value: 'motorboat', icon: '🚤' },
  { label: 'Catamaran', value: 'catamaran', icon: '⛴' },
  { label: 'Yacht',     value: 'rib',       icon: '🛥' },
];

const HERO_IMG  = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=1600&q=85&auto=format&fit=crop';
const SEA_IMG   = 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80&auto=format&fit=crop';

const STEPS = [
  { ico: '🔍', n: '01', title: 'Recherchez',  desc: "Filtrez par destination, type de bateau, dates et budget parmi des centaines d'annonces vérifiées." },
  { ico: '📅', n: '02', title: 'Réservez',    desc: 'Réservez en ligne et payez en toute sécurité via notre plateforme. Annulation flexible possible.' },
  { ico: '⛵', n: '03', title: 'Naviguez',    desc: 'Profitez de votre aventure en mer avec un propriétaire passionné ou en totale autonomie.' },
];

const AVATARS = [
  { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=75&auto=format&fit=crop&crop=face', name: 'Marie D.',    loc: 'Paris',    text: "Une expérience inoubliable. Le voilier était impeccable et le propriétaire d'une gentillesse rare. SailingLoc a tout géré à la perfection." },
  { img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=75&auto=format&fit=crop&crop=face', name: 'Thomas L.',   loc: 'Lyon',     text: "Parfait pour des vacances en famille. La réservation était simple, sécurisée, et le bateau exactement comme décrit. On reviendra !" },
  { img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=75&auto=format&fit=crop&crop=face', name: 'Isabelle M.', loc: 'Bordeaux', text: "SailingLoc change vraiment la façon de vivre la mer. Le skipper était passionné et connaissait chaque recoin de la côte." },
];

const STATS = [
  ['1 200+', 'Bateaux'],
  ['320',    'Ports'],
  ['15 000+','Navigations'],
  ['4.9/5',  'Note moyenne'],
];

const HeroSearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type,     setType]     = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (type)     params.set('type', type);
    navigate(`/boats?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row max-w-2xl rounded-2xl overflow-hidden p-2 gap-1"
      style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
    >
      <div className="flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <label className="block text-[10px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Destination</label>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Marseille, Nice, Cannes…"
          className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder-white/40"
        />
      </div>
      <div className="flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <label className="block text-[10px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Type de bateau</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-medium text-white/80 cursor-pointer"
          style={{ appearance: 'none' }}
        >
          <option value="" className="text-navy-900 bg-white">Tous types</option>
          <option value="sailboat"  className="text-navy-900 bg-white">Voilier</option>
          <option value="motorboat" className="text-navy-900 bg-white">Bateau à moteur</option>
          <option value="catamaran" className="text-navy-900 bg-white">Catamaran</option>
          <option value="rib"       className="text-navy-900 bg-white">Semi-rigide</option>
        </select>
      </div>
      <button
        type="submit"
        className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 whitespace-nowrap"
        style={{ background: '#00C6E0', color: '#07192E' }}
      >
        Rechercher
      </button>
    </form>
  );
};

const HomePage = () => {
  const [featuredBoats, setFeaturedBoats] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('all');

  useEffect(() => {
    getBoats({ limit: 12 })
      .then(({ data }) => {
        const boats = data.boats || data || [];
        setFeaturedBoats(boats.length > 0 ? boats : mockBoats);
      })
      .catch(() => setFeaturedBoats(mockBoats))
      .finally(() => setLoading(false));
  }, []);

  const filteredBoats = activeTab === 'all'
    ? featuredBoats
    : featuredBoats.filter(b => b.type === activeTab);

  return (
    <div style={{ background: '#F7F5F2' }}>

      {/* ── HERO ── */}
      <section className="relative flex flex-col justify-end overflow-hidden" style={{ minHeight: 620 }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            filter: 'brightness(0.45)',
            transform: 'scale(1.02)',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(7,25,46,0.95) 0%, rgba(7,25,46,0.4) 50%, transparent 100%)' }}
        />

        <div className="relative z-10 container-max px-4 sm:px-6 lg:px-14 pb-16 pt-20">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[1.5px] mb-6"
            style={{ background: 'rgba(0,198,224,0.15)', border: '1px solid rgba(0,198,224,0.35)', color: '#00C6E0' }}
          >
            ⚓ Plateforme N°1 en France
          </div>

          {/* Title */}
          <h1
            className="text-white mb-5 leading-[1.05]"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, textShadow: '0 4px 30px rgba(0,0,0,0.4)', maxWidth: 720 }}
          >
            Naviguez <em style={{ color: '#00C6E0', fontStyle: 'italic' }}>librement</em>,<br />
            entre particuliers.
          </h1>

          {/* Subtitle */}
          <p className="mb-8 leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.72)', fontSize: 17 }}>
            Louez le voilier ou bateau à moteur de vos rêves directement auprès de propriétaires passionnés, dans les plus beaux ports de France et d'Europe.
          </p>

          {/* Search bar */}
          <HeroSearchBar />

          {/* Stats */}
          <div
            className="flex flex-wrap gap-8 mt-10 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
          >
            {STATS.map(([num, label]) => (
              <div key={label} className="flex flex-col">
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{num}</span>
                <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED BOATS ── */}
      <section className="section-padding" style={{ background: '#F7F5F2' }}>
        <div className="container-max">
          <span className="sec-eyebrow">Nos bateaux</span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#07192E', lineHeight: 1.1 }}>
              Trouvez votre <em style={{ color: '#00C6E0', fontStyle: 'italic' }}>embarcation</em> idéale
            </h2>
            <Link
              to="/boats"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors whitespace-nowrap"
              style={{ color: '#07192E' }}
            >
              Voir tous les bateaux →
            </Link>
          </div>

          {/* Filter tabs */}
          {!loading && (
            <div className="overflow-x-auto scrollbar-hide mb-8 -mx-1 px-1">
              <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200"
                    style={activeTab === tab.value
                      ? { background: '#00C6E0', color: '#07192E' }
                      : { background: 'transparent', color: 'rgba(0,198,224,0.85)', border: '1.5px solid rgba(0,198,224,0.3)' }
                    }
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <BoatGrid boats={filteredBoats} loading={loading} />

          <div className="text-center mt-10">
            <Link
              to="/boats"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: '#07192E', color: '#fff' }}
            >
              Voir tous les bateaux →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED BANNER (owner CTA) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div
          className="relative min-h-[320px]"
          style={{
            backgroundImage: `url(${SEA_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(7,25,46,0.3)' }} />
        </div>

        {/* Content */}
        <div
          className="flex flex-col justify-center px-8 py-16 sm:px-14"
          style={{ background: '#07192E' }}
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-1.5 rounded-full mb-5 w-fit"
            style={{ background: 'rgba(0,198,224,0.15)', color: '#00C6E0' }}
          >
            Devenir propriétaire
          </span>
          <h2
            className="mb-4 leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#fff' }}
          >
            Rentabilisez votre bateau<br />entre vos navigations
          </h2>
          <p className="mb-8 leading-relaxed text-sm" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 380 }}>
            Rejoignez +1 200 propriétaires qui génèrent jusqu'à 18 000€ par saison en louant leur bateau à des navigateurs passionnés.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 w-fit"
            style={{ background: '#00C6E0', color: '#07192E' }}
          >
            Mettre mon bateau en ligne →
          </Link>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section-padding" style={{ background: '#07192E' }}>
        <div className="container-max">
          <span className="sec-eyebrow" style={{ color: '#00C6E0' }}>Comment ça marche</span>
          <h2
            className="mb-10 leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff' }}
          >
            Simple, rapide<br />& <em style={{ color: '#00C6E0', fontStyle: 'italic' }}>sécurisé</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="relative overflow-hidden rounded-3xl p-8"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {/* Big number background */}
                <span
                  className="absolute top-0 right-4 leading-none select-none pointer-events-none"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 96, fontWeight: 900, color: 'rgba(0,198,224,0.07)', lineHeight: 1 }}
                >
                  {step.n}
                </span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: 'rgba(0,198,224,0.15)', border: '1px solid rgba(0,198,224,0.25)' }}
                >
                  {step.ico}
                </div>

                <h3
                  className="mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container-max">
          <span className="sec-eyebrow">Témoignages</span>
          <h2
            className="mb-10"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#07192E', lineHeight: 1.1 }}
          >
            Ce que disent<br />nos <em style={{ color: '#00C6E0', fontStyle: 'italic' }}>navigateurs</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AVATARS.map((r) => (
              <div
                key={r.name}
                className="bg-white rounded-2xl p-7 relative"
                style={{ boxShadow: '0 4px 20px rgba(7,25,46,0.06)', border: '1px solid rgba(7,25,46,0.05)' }}
              >
                <div style={{ color: '#F4A01A', fontSize: 14, letterSpacing: 2, marginBottom: 12 }}>★★★★★</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: '#00C6E0', lineHeight: 1, marginBottom: 4 }}>"</div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: '#3D4D61' }}>{r.text}</p>
                <div className="flex items-center gap-3">
                  <img src={r.img} alt={r.name} className="w-11 h-11 rounded-full object-cover" style={{ border: '2px solid #EDF1F5' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#07192E' }}>{r.name}</p>
                    <p className="text-xs" style={{ color: '#8896A8' }}>{r.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-5 px-8 sm:px-14 py-5"
        style={{ background: '#00C6E0' }}
      >
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#07192E' }}>
          Prêt à prendre le large ? 🌊
        </span>
        <Link
          to="/boats"
          className="text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:opacity-90 whitespace-nowrap"
          style={{ background: '#07192E', color: '#fff' }}
        >
          Trouver mon bateau
        </Link>
      </div>

    </div>
  );
};

export default HomePage;
