import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

const content = {
  'mentions-legales': {
    title: 'Mentions légales',
    body: `
## Éditeur du site

SailingLoc est une plateforme fictive de location de bateaux entre particuliers réalisée dans le cadre d'un projet étudiant.

**Adresse :** 1 rue de la Mer, 13001 Marseille, France
**Email :** contact@sailingloc.fr
**Téléphone :** +33 4 00 00 00 00

## Nature fictive du projet

Ce site est un projet étudiant fictif. Aucun achat, paiement, contrat, réservation ou location réelle ne peut être effectué depuis SailingLoc. Les annonces, comptes, paiements et réservations présentés servent uniquement à la démonstration du MVP.

## Hébergement

Ce site est hébergé par un prestataire tiers. Conformément à l'article 6 de la LCEN, les coordonnées de l'hébergeur sont disponibles sur demande.

## Propriété intellectuelle

L'ensemble des contenus présents sur ce site, notamment les textes, images et logos, est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.
    `,
  },
  cgu: {
    title: "Conditions Générales d'Utilisation (CGU)",
    body: `
## 1. Objet

Les présentes CGU définissent les conditions d'utilisation de la plateforme SailingLoc permettant la mise en relation fictive entre propriétaires de bateaux et locataires.

## 2. Inscription

Pour utiliser SailingLoc, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.

## 3. Utilisation de la plateforme

SailingLoc est un projet étudiant fictif. Les parcours de réservation, paiement et gestion d'annonces sont fournis à des fins de démonstration uniquement.

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

Les présentes CGV décrivent le fonctionnement fictif des transactions simulées via la plateforme SailingLoc.

## 2. Prix

Les prix affichés sont en euros TTC et servent uniquement à la démonstration du projet. Aucun paiement réel n'est encaissé.

## 3. Réservation

La réservation affichée dans l'application est une simulation de parcours utilisateur. Elle ne crée aucun contrat réel entre un propriétaire et un locataire.

## 4. Annulation

Les règles d'annulation présentées sont fictives et servent uniquement à illustrer le fonctionnement métier du MVP.

## 5. Paiement

SailingLoc ne traite pas de paiement réel et ne stocke aucune coordonnée bancaire.
    `,
  },
  privacy: {
    title: 'Politique de confidentialité',
    body: `
## Données collectées

SailingLoc peut collecter les données suivantes dans le cadre de la démonstration : nom, prénom, email, téléphone et données de navigation.

## Utilisation des données

Vos données sont utilisées pour :
- Gestion de votre compte
- Traitement des réservations fictives
- Amélioration de nos services
- Communication par email

## Conservation

Vos données sont conservées pendant la durée nécessaire à la démonstration du projet.

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

**Cookies essentiels :** nécessaires au fonctionnement du site, notamment l'authentification et la session.

**Cookies analytiques :** utilisés via Google Tag Manager pour comprendre l'utilisation du site.

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
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Page introuvable</h1>
        <Link to="/" className="btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="mb-2 mt-6 text-xl font-bold text-gray-900">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-gray-800">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 text-gray-600">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return (
        <p key={i} className="leading-relaxed text-gray-600">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="container-max section-padding max-w-3xl">
      <Breadcrumb className="site-breadcrumb--card" items={[{ label: 'Pages légales' }, { label: page.title }]} />
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:underline">
        <ArrowLeft size={14} /> Retour à l'accueil
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold text-gray-900">{page.title}</h1>
      <div className="prose max-w-none space-y-1">{renderContent(page.body)}</div>
    </div>
  );
};

export default LegalPage;
