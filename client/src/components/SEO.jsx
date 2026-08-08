import { Helmet } from 'react-helmet-async';

const defaultTitle = 'SailingLoc — Location de bateaux entre particuliers';
const defaultDescription =
  'Louez un voilier, catamaran ou bateau à moteur entre particuliers avec SailingLoc. Réservation simple, annonces vérifiées et expérience nautique sécurisée.';
const siteUrl = 'https://dsp-dev-o24a-g6-fr.onrender.com';
const defaultImage = `${siteUrl}/images/hero-boat.jpeg`;

const SEO = ({
  title = defaultTitle,
  description = defaultDescription,
  canonical,
  image = defaultImage,
  type = 'website',
  noIndex = false,
  jsonLd,
}) => {
  const canonicalUrl = canonical ? `${siteUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default SEO;
