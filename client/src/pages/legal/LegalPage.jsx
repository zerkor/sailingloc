import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const content = {
  'mentions-legales': {
    title: 'Mentions légales',
    body: `
## Éditeur du site

SailingLoc est une plateforme de location de bateaux entre particuliers.

**Adresse :** 1 rue de la Mer, 13001 Marseille, France
**Email :** contact@sailingloc.fr
**Téléphone :** +33 4 00 00 00 00

## Hébergement

Ce site est hébergé par un prestataire tiers. Conformément à l'article L.6 de la LCEN, les coordonnées de l'hébergeur sont disponibles sur demande.

## Propriété intellectuelle

L'ensemble des contenus présents sur ce site (textes, images, logos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.
    `,
  },
  cgu: {
    title: 'Conditions Générales d\'Utilisation (CGU)',
    body: `
## 1. Objet

Les présentes CGU définissent les conditions d'utilisation de la plateforme SailingLoc permettant la mise en relation entre propriétaires de bateaux et locataires.

## 2. Inscription

Pour utiliser SailingLoc, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.

## 3. Utilisation de la plateforme

SailingLoc agit en tant qu'intermédiaire entre propriétaires et locataires. La plateforme ne saurait être tenue responsable des dommages survenus lors d'une location.

## 4. Responsabilités

Chaque utilisateur est responsable du contenu qu'il publie. SailingLoc se réserve le droit de supprimer tout contenu contraire aux présentes CGU.

## 5. Modification des CGU

SailingLoc se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email.
    `,
  },
  cgv: {
    title: 'Conditions Générales de Vente (CGV)',
    body: `
## 1. Objet

Les présentes CGV régissent les transactions effectuées via la plateforme SailingLoc entre propriétaires et locataires de bateaux.

## 2. Prix

Les prix affichés sont en euros TTC. SailingLoc prélève une commission de 10% sur chaque transaction.

## 3. Réservation

La réservation est confirmée après acceptation par le propriétaire et paiement du montant total.

## 4. Annulation

- Annulation par le locataire : remboursement selon la politique du propriétaire.
- Annulation par le propriétaire : remboursement intégral au locataire.

## 5. Paiement

Les paiements sont sécurisés. SailingLoc ne stocke pas vos coordonnées bancaires.
    `,
  },
  privacy: {
    title: 'Politique de confidentialité',
    body: `
## Données collectées

SailingLoc collecte les données suivantes : nom, prénom, email, téléphone, et données de navigation.

## Utilisation des données

Vos données sont utilisées pour :
- Gestion de votre compte
- Traitement des réservations
- Amélioration de nos services
- Communication par email

## Conservation

Vos données sont conservées pendant la durée de votre inscription et 3 ans après sa résiliation.

## Vos droits

Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à contact@sailingloc.fr.

## Cookies

Voir notre politique des cookies.
    `,
  },
  cookies: {
    title: 'Politique des cookies',
    body: `
## Qu'est-ce qu'un cookie ?

Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site.

## Cookies utilisés

**Cookies essentiels :** nécessaires au fonctionnement du site (authentification, session).

**Cookies analytiques :** nous permettent de comprendre comment vous utilisez le site (données anonymisées).

## Gestion des cookies

Vous pouvez configurer votre navigateur pour refuser les cookies. Cela peut affecter certaines fonctionnalités du site.

## Durée de conservation

Les cookies essentiels sont conservés pendant la durée de votre session ou jusqu'à 30 jours.
    `,
  },
};

const LegalPage = () => {
  const { slug } = useParams();
  const page = content[slug];

  if (!page) {
    return (
      <div className="container-max section-padding text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h1>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-600">{line.slice(2)}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-gray-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="container-max section-padding max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-navy-600 hover:underline text-sm"><ArrowLeft size={14} /> Retour a l'accueil</Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-8">{page.title}</h1>
      <div className="prose max-w-none space-y-1">
        {renderContent(page.body)}
      </div>
    </div>
  );
};

export default LegalPage;
